import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    contractId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { contractId } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { data: contract, error } = await supabase
    .from("asset_contracts")
    .select(`
      id,
      creator_id,
      contract_storage_path
    `)
    .eq("id", contractId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error || !contract) {
    return NextResponse.json(
      { error: "Contract not found." },
      { status: 404 }
    );
  }

  if (!contract.contract_storage_path) {
    return NextResponse.json(
      { error: "This contract has no document attached." },
      { status: 404 }
    );
  }

  const { data: signedUrl, error: signedUrlError } =
    await supabase.storage
      .from("creator-contracts")
      .createSignedUrl(
        contract.contract_storage_path,
        60
      );

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      {
        error:
          signedUrlError?.message ||
          "The contract could not be opened.",
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}