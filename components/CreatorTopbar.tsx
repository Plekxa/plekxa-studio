"use client";

import Link from "next/link";
import { Bell, CircleHelp, ExternalLink } from "lucide-react";

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
    <header className="studio-topbar">
      <div className="studio-topbar-title">
        <span>Creator Studio</span>
        <strong>{fullName ? `Welcome, ${fullName}` : "Welcome"}</strong>
      </div>

      <div className="studio-topbar-actions">
        <a
          href="https://plekxa.com/contact?category=creator-support"
          target="_blank"
          rel="noreferrer"
          aria-label="Help"
          className="studio-topbar-icon"
        >
          <CircleHelp size={18} />
        </a>

        <button
          type="button"
          aria-label="Notifications"
          className="studio-topbar-icon"
        >
          <Bell size={18} />
        </button>

        <a
          href="https://plekxa.com"
          target="_blank"
          rel="noreferrer"
          className="studio-topbar-site"
        >
          Visit Plekxa
          <ExternalLink size={14} />
        </a>

        <Link
          href="/profile"
          className="studio-topbar-profile"
        >
          <div className="studio-topbar-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName || "Creator"} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div>
            <strong>{fullName || "Creator"}</strong>
            <span>{creatorType || "Creator"}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}