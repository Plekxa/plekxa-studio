"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  Library,
  Search,
  UserRound,
} from "lucide-react";

const links = [
  {
    href: "/browse",
    icon: Home,
    label: "Home",
  },
  {
    href: "/explore",
    icon: Compass,
    label: "Explore",
  },
  {
    href: "/search",
    icon: Search,
    label: "Search",
  },
  {
    href: "/library",
    icon: Library,
    label: "Library",
  },
  {
    href: "/account",
    icon: UserRound,
    label: "Profile",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Listener mobile navigation"
    >
      {links.map(({ href, icon: Icon, label }) => {
        const isActive =
          pathname === href ||
          (href !== "/browse" && pathname.startsWith(`${href}/`));

        return (
          <Link
            href={href}
            key={href}
            className={isActive ? "active" : ""}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}