import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContractRouteProps = {
  params: Promise<{
    contractId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: ContractRouteProps
) {
  try {
    const { contractId } = await params;
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

    const { data: contract, error } = await supabase
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

        contract_events (
  id,
  contract_id,
  actor_id,
  event_type,
  description,
  metadata,
  created_at
)

      `)
      .eq("id", contractId)
      .eq("creator_user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Contract GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load the contract.",
      },
      { status: 500 }
    );
  }
}