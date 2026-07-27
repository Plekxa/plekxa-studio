import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SignupBody = {
  fullName?: string;
  email?: string;
  password?: string;
  creatorType?: string;
  acceptedTerms?: boolean;
};

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Could not create your account.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const creatorType = body.creatorType?.trim();

    if (!fullName || !email || !creatorType || !body.acceptedTerms) {
      return NextResponse.json(
        { error: "Complete every field and accept the Plekxa policies." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Your password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const termsAcceptedAt = new Date().toISOString();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        creator_type: creatorType,
        account_type: "creator",
        terms_accepted_at: termsAcceptedAt,
        source: "plekxa-studio",
      },
    });

    if (error || !data.user) {
      const message = error?.message || "Could not create your account.";
      const duplicate = /already|registered|exists/i.test(message);
      return NextResponse.json(
        { error: duplicate ? "An account already exists for this email. Please sign in." : message },
        { status: duplicate ? 409 : 500 }
      );
    }

    const userId = data.user.id;

    // Best-effort portal profile. Profile creation must never block Auth signup.
    const portalProfile = {
      id: userId,
      email,
      full_name: fullName,
      creator_type: creatorType,
      updated_at: termsAcceptedAt,
    };
    const portalResult = await admin.from("profiles").upsert(portalProfile, { onConflict: "id" });
    if (portalResult.error) {
      console.warn("Studio profiles sync skipped:", portalResult.error.message);
    }

    // Best-effort Enterprise OS creator record using the established Enterprise fields.
    const enterpriseResult = await admin.from("creator_profiles").upsert(
      {
        user_id: userId,
        legal_name: fullName,
        email,
        metadata: {
          creator_type: creatorType,
          terms_accepted_at: termsAcceptedAt,
          source: "plekxa-studio",
        },
      },
      { onConflict: "user_id" }
    );
    if (enterpriseResult.error) {
      console.warn("Enterprise creator sync skipped:", enterpriseResult.error.message);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Studio signup API error:", error);
    return NextResponse.json({ error: readErrorMessage(error) }, { status: 500 });
  }
}
