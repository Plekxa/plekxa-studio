export type NotificationType =
  | "project_invitation"
  | "application_submitted"
  | "application_under_review"
  | "application_accepted"
  | "application_rejected"
  | "contract_ready"
  | "contract_signed"
  | "revision_requested"
  | "submission_approved"
  | "deadline_reminder"
  | "project_completed"
  | "payment_available"
  | "payout_completed"
  | "pitch_accepted"
  | "pitch_rejected"
  | "message_received"
  | "general";

export type CreatorNotification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};