"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
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
import styles from "./notification-bell.module.css";

type NotificationResponse = {
  notifications: CreatorNotification[];
  unreadCount: number;
  error?: string;
};

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "project_invitation":
    case "application_submitted":
    case "application_under_review":
      return <BriefcaseBusiness size={17} />;

    case "application_accepted":
    case "submission_approved":
    case "project_completed":
      return <BadgeCheck size={17} />;

    case "application_rejected":
      return <XCircle size={17} />;

    case "contract_ready":
    case "contract_signed":
      return <FileSignature size={17} />;

    case "revision_requested":
      return <RefreshCcw size={17} />;

    case "deadline_reminder":
      return <Clock3 size={17} />;

    case "payment_available":
    case "payout_completed":
      return <CircleDollarSign size={17} />;

    case "pitch_accepted":
    case "pitch_rejected":
      return <Lightbulb size={17} />;

    case "message_received":
      return <MessageCircle size={17} />;

    default:
      return <Bell size={17} />;
  }
}

function relativeTime(value: string) {
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<
    CreatorNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=8", {
        cache: "no-store",
      });

      const result = (await response.json()) as NotificationResponse;

      if (!response.ok) {
        throw new Error(result.error || "Could not load notifications.");
      }

      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

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
        .channel(`creator-notifications-${user.id}`)
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

  async function markOneRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
              readAt: new Date().toISOString(),
            }
          : notification
      )
    );

    setUnreadCount((current) => Math.max(0, current - 1));

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
    if (unreadCount === 0 || updating) {
      return;
    }

    setUpdating(true);

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
        throw new Error("Could not mark notifications as read.");
      }

      setUnreadCount(0);
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error(error);
      await loadNotifications();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.bellButton}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={20} />

        {unreadCount > 0 ? (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section className={styles.dropdown}>
          <header className={styles.header}>
            <div>
              <span>Updates</span>
              <h2>Notifications</h2>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                disabled={updating}
              >
                {updating ? "Updating..." : "Mark all read"}
              </button>
            ) : null}
          </header>

          <div className={styles.items}>
            {loading ? (
              <div className={styles.state}>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.state}>
                <div className={styles.emptyIcon}>
                  <Inbox size={23} />
                </div>

                <strong>You’re all caught up</strong>
                <p>Project and payment updates will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <>
                    <div className={styles.itemIcon}>
                      {notificationIcon(notification.type)}
                    </div>

                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>
                        <strong>{notification.title}</strong>

                        {!notification.isRead ? (
                          <span
                            className={styles.unreadDot}
                            aria-label="Unread"
                          />
                        ) : null}
                      </div>

                      <p>{notification.message}</p>
                      <time>{relativeTime(notification.createdAt)}</time>
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
                      onClick={() => {
                        setOpen(false);

                        if (!notification.isRead) {
                          void markOneRead(notification.id);
                        }
                      }}
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
                    onClick={() => {
                      if (!notification.isRead) {
                        void markOneRead(notification.id);
                      }
                    }}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <footer className={styles.footer}>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </footer>
        </section>
      ) : null}
    </div>
  );
}