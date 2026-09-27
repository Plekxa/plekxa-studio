"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  FileSignature,
  Inbox,
  Lightbulb,
  MessageCircle,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  CreatorNotification,
  NotificationType,
} from "@/types/notifications";
import styles from "./notifications-page.module.css";

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "project_invitation":
    case "application_submitted":
    case "application_under_review":
      return <BriefcaseBusiness size={19} />;

    case "application_accepted":
    case "submission_approved":
    case "project_completed":
      return <BadgeCheck size={19} />;

    case "application_rejected":
      return <XCircle size={19} />;

    case "contract_ready":
    case "contract_signed":
      return <FileSignature size={19} />;

    case "revision_requested":
      return <RefreshCcw size={19} />;

    case "payment_available":
    case "payout_completed":
      return <CircleDollarSign size={19} />;

    case "pitch_accepted":
    case "pitch_rejected":
      return <Lightbulb size={19} />;

    case "message_received":
      return <MessageCircle size={19} />;

    default:
      return <Bell size={19} />;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function NotificationsPageClient() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<
    CreatorNotification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [message, setMessage] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=100", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load notifications."
        );
      }

      setNotifications(result.notifications ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let channel:
      | ReturnType<typeof supabase.channel>
      | undefined;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      channel = supabase
        .channel(`notifications-page-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            void loadNotifications();
          }
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications, supabase]);

  async function markRead(notificationId: string) {
    const notification = notifications.find(
      (item) => item.id === notificationId
    );

    if (!notification || notification.isRead) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              isRead: true,
              readAt: new Date().toISOString(),
            }
          : item
      )
    );

    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId,
      }),
    });

    if (!response.ok) {
      await loadNotifications();
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllRead: true,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error || "Could not update notifications."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span>Activity centre</span>
          <h1>Notifications</h1>
          <p>
            Project invitations, application decisions, contracts,
            revisions and payment updates appear here.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
          >
            <BadgeCheck size={17} />
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        ) : null}
      </header>

      <section className={styles.panel}>
        {loading ? (
          <div className={styles.empty}>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <div>
              <Inbox size={29} />
            </div>

            <h2>No notifications yet</h2>
            <p>
              New project, contract and payment updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const content = (
              <>
                <div className={styles.icon}>
                  {notificationIcon(notification.type)}
                </div>

                <div className={styles.content}>
                  <div className={styles.title}>
                    <strong>{notification.title}</strong>

                    {!notification.isRead ? <span /> : null}
                  </div>

                  <p>{notification.message}</p>
                  <time>{formatDate(notification.createdAt)}</time>
                </div>
              </>
            );

            if (notification.actionUrl) {
              return (
                <Link
                  href={notification.actionUrl}
                  key={notification.id}
                  className={`${styles.item} ${
                    !notification.isRead ? styles.unread : ""
                  }`}
                  onClick={() => void markRead(notification.id)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                type="button"
                key={notification.id}
                className={`${styles.item} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => void markRead(notification.id)}
              >
                {content}
              </button>
            );
          })
        )}
      </section>

      {message ? <p className={styles.message}>{message}</p> : null}
    </main>
  );
}