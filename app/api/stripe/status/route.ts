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

export async function GET() {
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
      .select(
        "stripe_account_id, paypal_email, preferred_payout_method"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        stripeConnected: false,
        detailsSubmitted: false,
        payoutsEnabled: false,
        paypalEmail: profile?.paypal_email ?? "",
        preferredPayoutMethod:
          profile?.preferred_payout_method ?? null,
      });
    }

    const account = await stripe.accounts.retrieve(
      profile.stripe_account_id
    );

    const detailsSubmitted =
      "details_submitted" in account
        ? Boolean(account.details_submitted)
        : false;

    const payoutsEnabled =
      "payouts_enabled" in account
        ? Boolean(account.payouts_enabled)
        : false;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_details_submitted: detailsSubmitted,
        stripe_payouts_enabled: payoutsEnabled,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      stripeConnected: true,
      detailsSubmitted,
      payoutsEnabled,
      paypalEmail: profile.paypal_email ?? "",
      preferredPayoutMethod:
        profile.preferred_payout_method ?? null,
    });
  } catch (error) {
    console.error("Stripe status error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payout status could not be loaded.",
      },
      { status: 500 }
    );
  }
}