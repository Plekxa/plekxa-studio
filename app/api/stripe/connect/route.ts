import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeClient() {
    console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
console.log(
  "Stripe key prefix:",
  process.env.STRIPE_SECRET_KEY?.slice(0, 8)
);
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !secretKey.startsWith("sk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing or invalid. Add a Stripe test secret key."
    );
  }

  return new Stripe(secretKey);
}

export async function POST(request: Request) {
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
      .select("full_name, stripe_account_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    let stripeAccountId = profile?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email ?? undefined,
        business_type: "individual",
        business_profile: {
          product_description:
            "Creative services and contributions for Plekxa projects and experiences.",
        },
        capabilities: {
          transfers: {
            requested: true,
          },
        },
        metadata: {
          plekxa_user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          stripe_account_id: stripeAccountId,
          preferred_payout_method: "bank",
        })
        .eq("id", user.id);

      if (saveError) {
        return NextResponse.json(
          { error: saveError.message },
          { status: 400 }
        );
      }
    }

    const requestUrl = new URL(request.url);
    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

    const siteUrl =
      configuredSiteUrl ||
      `${requestUrl.protocol}//${requestUrl.host}`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/settings/payments?stripe=refresh`,
      return_url: `${siteUrl}/settings/payments?stripe=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Stripe Connect error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe onboarding could not be started.",
      },
      { status: 500 }
    );
  }
}