import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const limitValue = Number(url.searchParams.get("limit") ?? "20");
    const unreadOnly = url.searchParams.get("unread") === "true";

    const limit = Number.isFinite(limitValue)
      ? Math.min(Math.max(limitValue, 1), 100)
      : 20;

    let query = supabase
      .from("notifications")
      .select(
        `
          id,
          recipient_id,
          type,
          title,
          message,
          action_url,
          entity_type,
          entity_id,
          metadata,
          is_read,
          read_at,
          created_at
        `
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const notifications = (data ?? []).map((item) => ({
      id: item.id,
      recipientId: item.recipient_id,
      type: item.type,
      title: item.title,
      message: item.message,
      actionUrl: item.action_url,
      entityType: item.entity_type,
      entityId: item.entity_id,
      metadata: item.metadata ?? {},
      isRead: item.is_read,
      readAt: item.read_at,
      createdAt: item.created_at,
    }));

    const { count, error: countError } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      notifications,
      unreadCount: count ?? 0,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load notifications.",
      },
      { status: 500 }
    );
  }
}

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

    const body = (await request.json()) as {
      notificationId?: string;
      markAllRead?: boolean;
    };

    if (body.markAllRead) {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
      });
    }

    if (!body.notificationId) {
      return NextResponse.json(
        { error: "A notification ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", body.notificationId)
      .eq("recipient_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Notifications PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update notification.",
      },
      { status: 500 }
    );
  }
}