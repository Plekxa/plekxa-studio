import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data, error } = await supabase.rpc(
      "creator_sign_contract",
      {
        contract_uuid: contractId,
        typed_signature: signatureName,
        signer_ip: ipAddress,
        signer_user_agent: userAgent,
      }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Your contract has been signed.",
      result: data,
    });
  } catch (error) {
    console.error("Contract signing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not sign the contract.",
      },
      { status: 500 }
    );
  }
}