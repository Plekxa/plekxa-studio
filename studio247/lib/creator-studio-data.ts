import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CompletedWorkItem = {
  id: string;
  title: string;
  clientName: string;
  role: string;
  completedAt: string;
  status: "approved" | "completed" | "archived";
  earnings: number;
  currency: string;
  thumbnailUrl: string | null;
  approvedAssets: number;
};

export type CreatorExperience = {
  id: string;
  title: string;
  brandName: string;
  role: string;
  status: "live" | "upcoming" | "paused" | "ended";
  royaltyPercentage: number;
  totalPlays: number;
  revenueGenerated: number;
  creatorEarnings: number;
  currency: string;
  coverUrl: string | null;
};

export type CreatorEarning = {
  id: string;
  source: string;
  projectName: string;
  amount: number;
  currency: string;
  status: "pending" | "available" | "paid" | "cancelled";
  earnedAt: string;
};

export type CreatorPayout = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed";
  payoutMethod: "stripe" | "paypal";
  createdAt: string;
};

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

export async function getCompletedWork(): Promise<CompletedWorkItem[]> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("creator_completed_work")
    .select(
      `
        id,
        title,
        client_name,
        role,
        completed_at,
        status,
        earnings,
        currency,
        thumbnail_url,
        approved_assets
      `
    )
    .eq("creator_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Completed work query failed:", error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    clientName: item.client_name,
    role: item.role,
    completedAt: item.completed_at,
    status: item.status,
    earnings: Number(item.earnings ?? 0),
    currency: item.currency ?? "GBP",
    thumbnailUrl: item.thumbnail_url,
    approvedAssets: Number(item.approved_assets ?? 0),
  }));
}

export async function getCreatorExperiences(): Promise<
  CreatorExperience[]
> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("creator_experiences")
    .select(
      `
        id,
        title,
        brand_name,
        role,
        status,
        royalty_percentage,
        total_plays,
        revenue_generated,
        creator_earnings,
        currency,
        cover_url
      `
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Creator experiences query failed:", error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    brandName: item.brand_name,
    role: item.role,
    status: item.status,
    royaltyPercentage: Number(item.royalty_percentage ?? 0),
    totalPlays: Number(item.total_plays ?? 0),
    revenueGenerated: Number(item.revenue_generated ?? 0),
    creatorEarnings: Number(item.creator_earnings ?? 0),
    currency: item.currency ?? "GBP",
    coverUrl: item.cover_url,
  }));
}

export async function getCreatorEarnings() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      earnings: [] as CreatorEarning[],
      payouts: [] as CreatorPayout[],
    };
  }

  const [earningsResult, payoutsResult] = await Promise.all([
    supabase
      .from("creator_earnings")
      .select(
        `
          id,
          source,
          project_name,
          amount,
          currency,
          status,
          earned_at
        `
      )
      .eq("creator_id", user.id)
      .order("earned_at", { ascending: false }),

    supabase
      .from("creator_payouts")
      .select(
        `
          id,
          amount,
          currency,
          status,
          payout_method,
          created_at
        `
      )
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (earningsResult.error) {
    console.error(
      "Creator earnings query failed:",
      earningsResult.error.message
    );
  }

  if (payoutsResult.error) {
    console.error(
      "Creator payouts query failed:",
      payoutsResult.error.message
    );
  }

  const earnings: CreatorEarning[] = (
    earningsResult.data ?? []
  ).map((item) => ({
    id: item.id,
    source: item.source,
    projectName: item.project_name,
    amount: Number(item.amount ?? 0),
    currency: item.currency ?? "GBP",
    status: item.status,
    earnedAt: item.earned_at,
  }));

  const payouts: CreatorPayout[] = (payoutsResult.data ?? []).map(
    (item) => ({
      id: item.id,
      amount: Number(item.amount ?? 0),
      currency: item.currency ?? "GBP",
      status: item.status,
      payoutMethod: item.payout_method,
      createdAt: item.created_at,
    })
  );

  return {
    earnings,
    payouts,
  };
}