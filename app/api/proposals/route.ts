import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function user() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  return { user, error };
}

function msg(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Proposal request failed.";
}

export async function GET() {
  try {
    const auth = await user();
    if (auth.error || !auth.user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("proposals")
      .select("*")
      .or(`creator_user_id.eq.${auth.user.id},creator_id.eq.${auth.user.id}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ proposals: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: msg(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await user();
    if (auth.error || !auth.user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    const body = await request.json();
    if (!body.title || !body.summary || !body.description || !body.department) {
      return NextResponse.json({ error: "Complete the required proposal fields." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin.from("proposals").insert({
      creator_user_id: auth.user.id,
      title: String(body.title).trim(),
      summary: String(body.summary).trim(),
      description: String(body.description).trim(),
      department: String(body.department).trim(),
      format: body.format ? String(body.format).trim() : null,
      estimated_timeline: body.estimated_timeline ? String(body.estimated_timeline).trim() : null,
      estimated_budget: body.estimated_budget === null || body.estimated_budget === "" ? null : Number(body.estimated_budget),
      portfolio_url: body.portfolio_url ? String(body.portfolio_url).trim() : null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ proposal: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: msg(error) }, { status: 500 });
  }
}
