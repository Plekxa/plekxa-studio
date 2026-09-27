import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfilePayload = {
  full_name?: string;
  professional_name?: string;
  creator_type?: string;
  bio?: string;
  location?: string;
  availability?: string;
  avatar_url?: string;
  portfolio_url?: string;
  skills?: string[];
  genres?: string[];
};

async function currentUser() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  return { user, error };
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Profile request failed.";
}

export async function GET() {
  try {
    const { user, error } = await currentUser();
    if (error || !user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const metadata = user.user_metadata ?? {};
    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email ?? profile?.email ?? "",
        full_name: profile?.full_name ?? metadata.full_name ?? metadata.name ?? "",
        professional_name: profile?.professional_name ?? "",
        creator_type: profile?.creator_type ?? metadata.creator_type ?? "",
        bio: profile?.bio ?? "",
        location: profile?.location ?? "",
        availability: profile?.availability ?? "",
        avatar_url: profile?.avatar_url ?? "",
        portfolio_url: profile?.portfolio_url ?? "",
        skills: Array.isArray(profile?.skills) ? profile.skills : [],
        genres: Array.isArray(profile?.genres) ? profile.genres : [],
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await currentUser();
    if (error || !user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const body = (await request.json()) as ProfilePayload;
    const fullName = body.full_name?.trim();
    if (!fullName) return NextResponse.json({ error: "Your full name is required." }, { status: 400 });

    const admin = createAdminClient();
    const now = new Date().toISOString();
    const portal = {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      professional_name: body.professional_name?.trim() || null,
      creator_type: body.creator_type?.trim() || null,
      bio: body.bio?.trim() || null,
      location: body.location?.trim() || null,
      availability: body.availability?.trim() || null,
      avatar_url: body.avatar_url?.trim() || null,
      portfolio_url: body.portfolio_url?.trim() || null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      genres: Array.isArray(body.genres) ? body.genres : [],
      updated_at: now,
    };

    const { data: existing, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const portalResult = existing
      ? await admin.from("profiles").update(portal).eq("id", user.id)
      : await admin.from("profiles").insert({ ...portal, created_at: now });
    if (portalResult.error) throw portalResult.error;

    const authResult = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata ?? {}),
        full_name: fullName,
        creator_type: portal.creator_type,
      },
    });
    if (authResult.error) console.warn("Auth metadata update skipped:", authResult.error.message);

    const { data: creator, error: creatorLookupError } = await admin
      .from("creator_profiles")
      .select("id, metadata")
      .eq("user_id", user.id)
      .maybeSingle();
    if (creatorLookupError) throw creatorLookupError;

    const enterprise = {
      user_id: user.id,
      legal_name: fullName,
      stage_name: portal.professional_name,
      email: user.email ?? null,
      genres: portal.genres,
      skills: portal.skills,
      bio: portal.bio,
      portfolio_url: portal.portfolio_url,
      metadata: {
        ...(creator?.metadata && typeof creator.metadata === "object" ? creator.metadata : {}),
        creator_type: portal.creator_type,
        location: portal.location,
        availability: portal.availability,
        avatar_url: portal.avatar_url,
        source: "plekxa-studio",
      },
      updated_at: now,
    };

    const enterpriseResult = creator
      ? await admin.from("creator_profiles").update(enterprise).eq("id", creator.id)
      : await admin.from("creator_profiles").insert({ ...enterprise, created_at: now });
    if (enterpriseResult.error) throw enterpriseResult.error;

    return NextResponse.json({ success: true, message: "Profile saved." });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
