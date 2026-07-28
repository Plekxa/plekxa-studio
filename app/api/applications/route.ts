import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubmitApplicationBody = {
  projectId?: string;
  coverLetter?: string;
  portfolioUrl?: string;
};

type WithdrawApplicationBody = {
  applicationId?: string;
};

type DbError = { code?: string; message?: string; details?: string; hint?: string };

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const dbError = error as DbError;
    return [dbError.message, dbError.details, dbError.hint].filter(Boolean).join(" ") || fallback;
  }
  return fallback;
}

async function requireUser() {
  const sessionClient = await createClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  return { user, error };
}

async function enterpriseCreatorId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("creator_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function GET() {
  try {
    const { user, error: authError } = await requireUser();
    if (authError || !user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const admin = createAdminClient();
    const profileId = await enterpriseCreatorId(user.id);
    const filters = [
      `creator_user_id.eq.${user.id}`,
      `creator_id.eq.${user.id}`,
      ...(profileId ? [`creator_id.eq.${profileId}`] : []),
    ];

    const { data: rows, error } = await admin
      .from("creator_applications")
      .select("*")
      .or(filters.join(","))
      .order("applied_at", { ascending: false });

    if (error) throw error;

    const applications = rows ?? [];
    const projectIds = [...new Set(applications.map((row) => row.project_id).filter(Boolean))];
    let projectMap = new Map<string, Record<string, unknown>>();

    if (projectIds.length) {
      const { data: projects, error: projectsError } = await admin
        .from("projects")
        .select("*")
        .in("id", projectIds);
      if (projectsError) throw projectsError;
      projectMap = new Map((projects ?? []).map((project) => [String(project.id), project]));
    }

    return NextResponse.json({
      applications: applications.map((application) => ({
        ...application,
        projects: projectMap.get(String(application.project_id)) ?? null,
      })),
    });
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Could not load applications.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireUser();
    if (authError || !user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const body = (await request.json()) as SubmitApplicationBody;
    const projectId = body.projectId?.trim();
    const coverLetter = body.coverLetter?.trim() || null;
    const portfolioUrl = body.portfolioUrl?.trim() || null;

    if (!projectId) {
      return NextResponse.json({ error: "A project ID is required." }, { status: 400 });
    }
    if (coverLetter && coverLetter.length > 5000) {
      return NextResponse.json({ error: "Your cover letter must be under 5,000 characters." }, { status: 400 });
    }
    if (portfolioUrl) {
      try {
        const parsed = new URL(portfolioUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      } catch {
        return NextResponse.json({ error: "Enter a valid portfolio URL." }, { status: 400 });
      }
    }

    const admin = createAdminClient();
    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return NextResponse.json({ error: "This project could not be found." }, { status: 404 });

    const profileId = await enterpriseCreatorId(user.id);
    const candidates: Record<string, unknown>[] = [
      {
        project_id: projectId,
        creator_user_id: user.id,
        creator_id: profileId,
        status: "pending",
        cover_letter: coverLetter,
        portfolio_url: portfolioUrl,
      },
      {
        project_id: projectId,
        creator_user_id: user.id,
        status: "pending",
        cover_letter: coverLetter,
        portfolio_url: portfolioUrl,
      },
      {
        project_id: projectId,
        creator_id: user.id,
        status: "pending",
        cover_letter: coverLetter,
        portfolio_url: portfolioUrl,
      },
    ];

    let application: Record<string, unknown> | null = null;
    let lastError: unknown = null;

    for (const candidate of candidates) {
      const payload = Object.fromEntries(Object.entries(candidate).filter(([, value]) => value !== null));
      const { data, error } = await admin
        .from("creator_applications")
        .insert(payload)
        .select("*")
        .single();

      if (!error) {
        application = data;
        break;
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "You already have an active application for this project." }, { status: 409 });
      }
      lastError = error;
    }

    if (!application) throw lastError;

    const title = String(project.title || project.name || "this project");
    return NextResponse.json(
      { success: true, message: `Your application for ${title} has been submitted.`, application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Applications POST error:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Could not submit your application.") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error: authError } = await requireUser();
    if (authError || !user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const body = (await request.json()) as WithdrawApplicationBody;
    const applicationId = body.applicationId?.trim();
    if (!applicationId) {
      return NextResponse.json({ error: "An application ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: application, error } = await admin
      .from("creator_applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();
    if (error) throw error;
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const profileId = await enterpriseCreatorId(user.id);
    const belongsToUser = application.creator_user_id === user.id || application.creator_id === user.id || application.creator_id === profileId;
    if (!belongsToUser) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    if (!["pending", "submitted", "under_review"].includes(application.status)) {
      return NextResponse.json({ error: "Only pending or under-review applications can be withdrawn." }, { status: 409 });
    }

    const { error: updateError } = await admin
      .from("creator_applications")
      .update({ status: "withdrawn", withdrawn_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", applicationId);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Your application has been withdrawn." });
  } catch (error) {
    console.error("Applications PATCH error:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Could not withdraw your application.") },
      { status: 500 }
    );
  }
}
