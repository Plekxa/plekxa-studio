import Link from "next/link";
import {
  Bell,
  Compass,
  Home,
  Library,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

export function Header() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">

        <Link className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>Plekxa</span>
        </Link>

        <nav className="nav-links">

          <Link href="/">
            <Home size={16} />
            Home
          </Link>

          <Link href="/explore">
            <Compass size={16} />
            Explore
          </Link>

          <Link href="/library">
            <Library size={16} />
            Library
          </Link>

        </nav>

        <div className="nav-actions">

          <Link
            className="icon-link"
            href="/explore"
            aria-label="Search"
          >
            <Search size={19} />
          </Link>

          <Link
            className="icon-link"
            href="/notifications"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </Link>

          <Link
            className="create-action"
            href="/create"
            aria-label="Creator Studio"
          >
            <Plus size={20} />
          </Link>

          <Link
            className="icon-link"
            href="/account"
            aria-label="Profile"
          >
            <UserRound size={19} />
          </Link>

        </div>
      </div>
    </header>
  );
}