import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Heart,
  Home,
  Library,
  Plus,
  Radio,
  Search,
  Settings,
} from "lucide-react";

const mainLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <Link className="sidebar-brand" href="/" aria-label="Plekxa home">
  <Image
  className="sidebar-wordmark"
  src="/images/plekxa-logo2.png"
  alt=""
  width={397}
  height={65}
  priority
/>
</Link>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-section">
        <p>Your Plekxa</p>

        <Link href="/library">
          <Heart size={19} />
          <span>Saved Experiences</span>
        </Link>

        <Link href="/listen">
          <Radio size={19} />
          <span>Listening History</span>
        </Link>
      </div>

      <div className="sidebar-bottom">
        <Link href="/create">
          <Plus size={19} />
          <span>Create</span>
        </Link>

        <Link href="/account">
          <Settings size={19} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}