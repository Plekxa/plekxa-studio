import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationType } from "@/types/notifications";

type CreateNotificationInput = {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput
) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      action_url: input.actionUrl ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) {
    console.error("Notification creation failed:", error.message);
    throw new Error("Could not create notification.");
  }

  return data;
}