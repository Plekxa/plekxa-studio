import Link from "next/link";

export default function ActiveProjectsPage() {
  return (
    <div className="creator-page">
      <div className="creator-page-heading">
        <span>My work</span>
        <h1>Active projects</h1>
        <p>
          Manage current Plekxa collaborations, project milestones, submissions
          and review activity.
        </p>
      </div>

      <section className="creator-empty-page">
        <h2>No active projects yet</h2>
        <p>
          Once you are accepted onto a project, it will appear here with its
          milestones, deliverables, team and submission history.
        </p>

        <Link href="/creator-studio/projects">
          Browse available projects
        </Link>
      </section>
    </div>
  );
}