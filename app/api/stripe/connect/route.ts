import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  return NextResponse.json({
    hasKey: Boolean(secretKey),
    prefix: secretKey?.slice(0, 7) ?? null,
  });
}