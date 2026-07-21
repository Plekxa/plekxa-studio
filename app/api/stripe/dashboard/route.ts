import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !secretKey.startsWith("sk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing or invalid. Add a Stripe test secret key."
    );
  }

  return new Stripe(secretKey);
}

export async function POST() {
  try {
    const stripe = getStripeClient();
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    if (!profile?.stripe_account_id) {
      return NextResponse.json(
        { error: "Connect a bank account first." },
        { status: 400 }
      );
    }

    const loginLink = await stripe.accounts.createLoginLink(
      profile.stripe_account_id
    );

    return NextResponse.json({
      url: loginLink.url,
    });
  } catch (error) {
    console.error("Stripe dashboard error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not open payout management.",
      },
      { status: 500 }
    );
  }
}