"use client";

import Link from "next/link";
import {
  Bell,
  CircleHelp,
  ExternalLink,
  UserRound,
} from "lucide-react";

type CreatorTopbarProps = {
  fullName?: string | null;
  avatarUrl?: string | null;
  creatorType?: string | null;
};

export function CreatorTopbar({
  fullName,
  avatarUrl,
  creatorType,
}: CreatorTopbarProps) {
  const initials =
    fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CR";

  return (
    <header className="creator-topbar">
      <div className="creator-topbar-copy">
        <span>Creator Studio</span>
        <strong>
          Welcome back{fullName ? `, ${fullName}` : ""}
        </strong>
      </div>

      <div className="creator-topbar-actions">
        <a
          href="https://plekxa.com/contact?category=creator-support"
          target="_blank"
          rel="noreferrer"
          className="creator-topbar-icon"
          aria-label="Contact Creator Support"
          title="Creator Support"
        >
          <CircleHelp size={19} />
        </a>

        <button
          type="button"
          className="creator-topbar-icon"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </button>

        <a
          href="https://plekxa.com"
          target="_blank"
          rel="noreferrer"
          className="creator-topbar-site-link"
        >
          Visit Plekxa
          <ExternalLink size={15} />
        </a>

        <Link
          href="/creator-studio/profile"
          className="creator-topbar-profile"
        >
          <div className="creator-topbar-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || "Creator"}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div>
            <strong>{fullName || "Creator"}</strong>
            <span>{creatorType || "Plekxa creator"}</span>
          </div>

          <UserRound
            className="creator-topbar-profile-icon"
            size={16}
          />
        </Link>
      </div>
    </header>
  );
}