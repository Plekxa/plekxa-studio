"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  Gauge,
  HelpCircle,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        href: "/creator-studio/dashboard",
        label: "Dashboard",
        icon: Gauge,
      },
    ],
  },
  {
    label: "Opportunities",
    items: [
      {
        href: "/creator-studio/projects",
        label: "Browse projects",
        icon: BriefcaseBusiness,
      },
      {
        href: "/creator-studio/applications",
        label: "Applications",
        icon: FileText,
      },
      {
        href: "/creator-studio/pitch",
        label: "Pitch an idea",
        icon: Lightbulb,
      },
      {
        href: "/creator-studio/proposals",
        label: "Proposals",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        href: "/creator-studio/active-projects",
        label: "Active projects",
        icon: ListChecks,
      },
      {
        href: "/creator-studio/profile",
        label: "Profile",
        icon: UserRound,
      },
    ],
  },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  const content = (
    <>
      <div className="studio-sidebar-brand">
        <Link href="/creator-studio/dashboard">
          <strong>Plekxa</strong>
          <span>Creator Studio</span>
        </Link>
      </div>

      <nav className="studio-sidebar-nav" aria-label="Creator Studio">
        {navSections.map((section) => (
          <section className="studio-sidebar-section" key={section.label}>
            <p>{section.label}</p>

            <div>
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive(item.href)
                        ? "studio-sidebar-link is-active"
                        : "studio-sidebar-link"
                    }
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="studio-sidebar-footer">
        <a
          href="https://plekxa.com/contact?category=creator-support"
          target="_blank"
          rel="noreferrer"
          className="studio-sidebar-link"
        >
          <HelpCircle size={18} strokeWidth={1.8} />
          <span>Help</span>
        </a>

        <Link
          href="/creator-studio/settings"
          className={
            isActive("/creator-studio/settings")
              ? "studio-sidebar-link is-active"
              : "studio-sidebar-link"
          }
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        <button
          type="button"
          className="studio-sidebar-link studio-sidebar-button"
          onClick={handleLogout}
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="studio-mobile-header">
        <Link href="/creator-studio/dashboard">
          <strong>Plekxa</strong>
          <span>Creator Studio</span>
        </Link>

        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
      </header>

      <aside className="studio-sidebar studio-sidebar-desktop">
        {content}
      </aside>

      <button
        type="button"
        aria-label="Close navigation"
        className={
          mobileOpen
            ? "studio-mobile-backdrop is-visible"
            : "studio-mobile-backdrop"
        }
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={
          mobileOpen
            ? "studio-mobile-drawer is-open"
            : "studio-mobile-drawer"
        }
      >
        <button
          type="button"
          className="studio-mobile-close"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={21} />
        </button>

        {content}
      </aside>
    </>
  );
}