"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  FolderKanban,
  Gauge,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const sections = [
  {
    label: "Workspace",
    links: [
      {
        href: "/creator-studio/dashboard",
        label: "Dashboard",
        icon: Gauge,
      },
      {
        href: "/creator-studio/projects",
        label: "Browse projects",
        icon: BriefcaseBusiness,
      },
      {
        href: "/creator-studio/applications",
        label: "My applications",
        icon: FileText,
      },
    ],
  },
  {
    label: "Ideas",
    links: [
      {
        href: "/creator-studio/pitch",
        label: "Pitch a project",
        icon: Lightbulb,
      },
      {
        href: "/creator-studio/proposals",
        label: "My proposals",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "My work",
    links: [
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

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navigation = (
    <>
      <div className="creator-sidebar-brand">
        <Link href="/creator-studio/dashboard" onClick={() => setMobileOpen(false)}>
          <span className="creator-sidebar-logo">Plekxa</span>
          <span className="creator-sidebar-product">Creator Studio</span>
        </Link>
      </div>

      <nav className="creator-sidebar-navigation">
        {sections.map((section) => (
          <div className="creator-sidebar-section" key={section.label}>
            <span className="creator-sidebar-section-label">
              {section.label}
            </span>

            <div className="creator-sidebar-links">
              {section.links.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`creator-sidebar-link ${
                      active ? "is-active" : ""
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>

                    {active ? (
                      <ChevronRight
                        className="creator-sidebar-link-arrow"
                        size={16}
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="creator-sidebar-footer">
  <Link
    href="/creator-studio/settings"
    className={`creator-sidebar-link ${
      isActive("/creator-studio/settings") ? "is-active" : ""
    }`}
    onClick={() => setMobileOpen(false)}
  >
    <Settings size={19} strokeWidth={1.8} />
    <span>Settings</span>
  </Link>

  <button
    type="button"
    className="creator-sidebar-link creator-sidebar-button"
    onClick={handleLogout}
  >
    <LogOut size={19} strokeWidth={1.8} />
    <span>Log out</span>
  </button>
</div>
    </>
  );

  return (
    <>
      <header className="creator-mobile-header">
        <Link
          href="/creator-studio/dashboard"
          className="creator-mobile-brand"
        >
          <span>Plekxa</span>
          <small>Creator Studio</small>
        </Link>

        <button
          type="button"
          className="creator-mobile-menu-button"
          aria-label="Open Creator Studio navigation"
          aria-expanded={mobileOpen}
          aria-controls="creator-mobile-navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={23} />
        </button>
      </header>

      <aside className="creator-sidebar creator-sidebar-desktop">
        {navigation}
      </aside>

      <div
        className={`creator-mobile-backdrop ${
          mobileOpen ? "is-visible" : ""
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="creator-mobile-navigation"
        className={`creator-mobile-drawer ${
          mobileOpen ? "is-open" : ""
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="creator-mobile-close-button"
          aria-label="Close Creator Studio navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={22} />
        </button>

        {navigation}
      </aside>
    </>
  );
}

const router = useRouter();
const supabase = createClient();

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/");
  router.refresh();
}