import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  Gauge,
  Lightbulb,
  ListChecks,
  Settings,
  UserRound,
} from "lucide-react";

const sections = [
  {
    title: "Workspace",
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
    title: "Ideas",
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
    title: "My work",
    links: [
      {
        href: "/creator-studio/work",
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
  return (
    <aside className="creator-sidebar">
      <Link className="creator-sidebar-brand" href="/creator-studio/dashboard">
        <span>Plekxa</span>
        <small>Creator Studio</small>
      </Link>

      <nav className="creator-sidebar-nav" aria-label="Creator Studio navigation">
        {sections.map((section) => (
          <div className="creator-sidebar-section" key={section.title}>
            <p>{section.title}</p>

            {section.links.map(({ href, label, icon: Icon }) => (
              <Link href={href} key={href}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="creator-sidebar-bottom">
        <Link href="/creator-studio/settings">
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}