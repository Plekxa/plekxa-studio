import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubmitApplicationBody = {
  projectId?: string;
  coverLetter?: string;
  portfolioUrl?: string;
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

    const { data, error } = await supabase
      .from("creator_applications")
      .select(`
        id,
        project_id,
        creator_user_id,
        status,
        cover_letter,
        portfolio_url,
        review_notes,
        rejection_reason,
        applied_at,
        reviewed_at,
        withdrawn_at,
        updated_at,
        projects (
          id,
          title
        )
      `)
      .eq("creator_user_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      applications: data ?? [],
    });
  } catch (error) {
    console.error("Applications GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load applications.",
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

    const body = (await request.json()) as SubmitApplicationBody;

    const projectId = body.projectId?.trim();
    const coverLetter = body.coverLetter?.trim() || null;
    const portfolioUrl = body.portfolioUrl?.trim() || null;

    if (!projectId) {
      return NextResponse.json(
        { error: "A project ID is required." },
        { status: 400 }
      );
    }

    if (coverLetter && coverLetter.length > 5000) {
      return NextResponse.json(
        { error: "Your cover letter must be under 5,000 characters." },
        { status: 400 }
      );
    }

    if (portfolioUrl) {
      try {
        const parsedUrl = new URL(portfolioUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error();
        }
      } catch {
        return NextResponse.json(
          { error: "Enter a valid portfolio URL." },
          { status: 400 }
        );
      }
    }

    const { data: existingApplication, error: existingError } =
      await supabase
        .from("creator_applications")
        .select("id, status")
        .eq("project_id", projectId)
        .eq("creator_user_id", user.id)
        .in("status", ["pending", "under_review", "accepted"])
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingApplication) {
      return NextResponse.json(
        {
          error:
            existingApplication.status === "accepted"
              ? "You have already been accepted for this project."
              : "You already have an active application for this project.",
        },
        { status: 409 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    if (!project) {
      return NextResponse.json(
        { error: "This project could not be found." },
        { status: 404 }
      );
    }

    const { data: application, error: insertError } = await supabase
      .from("creator_applications")
      .insert({
        project_id: projectId,
        creator_user_id: user.id,
        status: "pending",
        cover_letter: coverLetter,
        portfolio_url: portfolioUrl,
      })
      .select(`
        id,
        project_id,
        status,
        cover_letter,
        portfolio_url,
        applied_at,
        updated_at
      `)
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You already have an active application." },
          { status: 409 }
        );
      }

      throw insertError;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Your application for ${project.title} has been submitted.`,
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Applications POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not submit your application.",
      },
      { status: 500 }
    );
  }
}

type WithdrawApplicationBody = {
  applicationId?: string;
};

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as WithdrawApplicationBody;
    const applicationId = body.applicationId?.trim();

    if (!applicationId) {
      return NextResponse.json(
        { error: "An application ID is required." },
        { status: 400 }
      );
    }

    const { data: application, error: applicationError } =
      await supabase
        .from("creator_applications")
        .select("id, creator_id, status")
        .eq("id", applicationId)
        .eq("creator_user_id", user.id)
        .maybeSingle();

    if (applicationError) {
      throw applicationError;
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (!["pending", "under_review"].includes(application.status)) {
      return NextResponse.json(
        {
          error:
            "Only pending or under-review applications can be withdrawn.",
        },
        { status: 409 }
      );
    }

    const { error: withdrawError } = await supabase.rpc(
      "withdraw_creator_application",
      {
        application_uuid: applicationId,
      }
    );

    if (withdrawError) {
      throw withdrawError;
    }

    return NextResponse.json({
      success: true,
      message: "Your application has been withdrawn.",
    });
  } catch (error) {
    console.error("Applications PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not withdraw your application.",
      },
      { status: 500 }
    );
  }
}