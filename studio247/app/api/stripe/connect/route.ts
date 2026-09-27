import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !secretKey.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY is missing or invalid.");
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
      .select("id, email, stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    let stripeAccountId = profile?.stripe_account_id as string | null;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: profile?.email ?? user.email ?? undefined,
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
        })
        .eq("id", user.id);

      if (saveError) {
        return NextResponse.json(
          { error: saveError.message },
          { status: 400 }
        );
      }
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://studio.plekxa.com";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/settings/payments?stripe=refresh`,
      return_url: `${siteUrl}/settings/payments?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: stripeAccountId,
    });
  } catch (error) {
    console.error("Stripe Connect error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe onboarding.",
      },
      { status: 500 }
    );
  }
}