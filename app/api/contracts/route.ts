import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SignContractBody = {
  contractId?: string;
  signatureName?: string;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data: contracts, error } = await supabase
      .from("contracts")
      .select(`
        id,
        application_id,
        template_id,
        project_id,
        creator_id,
        creator_user_id,
        project_title,
        contract_number,
        status,
        currency,
        total_amount,
        start_date,
        end_date,
        content,
        sent_at,
        creator_signed_at,
        client_signed_at,
        activated_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at,
        contract_milestones (
          id,
          contract_id,
          title,
          description,
          amount,
          due_date,
          status,
          position,
          submitted_at,
          approved_at,
          paid_at,
          created_at,
          updated_at
        ),
        contract_signatures (
          id,
          contract_id,
          signer_id,
          party,
          signature_name,
          signed_at
        )
      `)
      .eq("creator_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      contracts: contracts ?? [],
    });
  } catch (error) {
    console.error("Contracts GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load contracts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SignContractBody;

    const contractId = body.contractId?.trim();
    const signatureName = body.signatureName?.trim();

    if (!contractId) {
      return NextResponse.json(
        { error: "A contract ID is required." },
        { status: 400 }
      );
    }

    if (!signatureName || signatureName.length < 2) {
      return NextResponse.json(
        { error: "Enter your full legal name." },
        { status: 400 }
      );
    }

    if (signatureName.length > 150) {
      return NextResponse.json(
        { error: "The signature name is too long." },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const userAgent = request.headers.get("user-agent");

    // Perform the signing write server-side after verifying ownership. This
    // avoids the legacy RPC identity drift while preserving the same audit
    // records and database constraints.
    const admin = createAdminClient();

    const { data: contract, error: contractError } = await admin
      .from("contracts")
      .select("id,status,creator_user_id")
      .eq("id", contractId)
      .eq("creator_user_id", user.id)
      .maybeSingle();

    if (contractError) throw contractError;
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found or you do not have permission to sign it." },
        { status: 404 }
      );
    }

    if (contract.status === "creator_signed" || contract.status === "active") {
      return NextResponse.json({
        success: true,
        message: "Your contract has already been signed.",
        result: { contract_id: contract.id, status: contract.status },
      });
    }

    if (contract.status !== "sent" && contract.status !== "draft") {
      return NextResponse.json(
        { error: `This contract cannot be signed while its status is ${contract.status}.` },
        { status: 409 }
      );
    }

    const signedAt = new Date().toISOString();
    const signatureHash = createHash("sha256")
      .update([contract.id, user.id, signatureName, signedAt].join("|"), "utf8")
      .digest("hex");

    const { error: signatureError } = await admin
      .from("contract_signatures")
      .upsert(
        {
          contract_id: contract.id,
          signer_id: user.id,
          party: "creator",
          signature_name: signatureName,
          signature_hash: signatureHash,
          ip_address: ipAddress,
          user_agent: userAgent,
          signed_at: signedAt,
        },
        { onConflict: "contract_id,party" }
      );

    if (signatureError) throw signatureError;

    const { error: updateError } = await admin
      .from("contracts")
      .update({
        status: "creator_signed",
        creator_signed_at: signedAt,
        updated_at: signedAt,
      })
      .eq("id", contract.id)
      .eq("creator_user_id", user.id);

    if (updateError) throw updateError;

    // Audit event is useful but must not make an otherwise valid signature fail.
    const { error: eventError } = await admin.from("contract_events").insert({
      contract_id: contract.id,
      actor_id: user.id,
      event_type: "creator_signed",
      description: "Creator signed the contract",
    });
    if (eventError) console.error("Contract event insert error:", eventError);

    const { data: staff, error: staffError } = await admin
      .from("staff_members")
      .select("auth_user_id")
      .not("auth_user_id", "is", null);

    if (!staffError && staff?.length) {
      const { error: notificationError } = await admin
        .from("notifications")
        .insert(
          staff.map((member: { auth_user_id: string }) => ({
            recipient_id: member.auth_user_id,
            audience: "enterprise",
            type: "contract_signed",
            title: "Creator signed a contract",
            message: `Contract ${contractId} has been signed by the creator.`,
            action_url: "/contracts",
            entity_type: "contract",
            entity_id: contractId,
          }))
        );
      if (notificationError)
        console.error("Contract notification error:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: "Your contract has been signed.",
      result: { contract_id: contract.id, status: "creator_signed" },
    });
  } catch (error) {
    console.error("Contract signing error:", error);

    const databaseError = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : databaseError?.message || "Could not sign the contract.",
        code: databaseError?.code || null,
        details: databaseError?.details || null,
        hint: databaseError?.hint || null,
      },
      { status: 500 }
    );
  }
}