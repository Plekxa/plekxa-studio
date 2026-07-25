import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Milestone = {
  id: string;
  contract_id: string;
  title: string;
  status: string;
  due_date: string | null;
  position: number;
};

export default async function ActiveProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspaces, error: workspacesError } =
    await supabase
      .from("creator_project_workspaces")
      .select(`
        id,
        contract_id,
        project_id,
        title,
        status,
        started_at,
        created_at
      `)
      .eq("creator_id", user.id)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false });

  const contractIds =
    workspaces?.map((workspace) => workspace.contract_id) ?? [];

  let milestones: Milestone[] = [];
  let milestonesError: { message: string } | null = null;

  if (contractIds.length > 0) {
    const result = await supabase
      .from("contract_milestones")
      .select(`
        id,
        contract_id,
        title,
        status,
        due_date,
        position
      `)
      .in("contract_id", contractIds)
      .order("position", { ascending: true });

    milestones = (result.data ?? []) as Milestone[];
    milestonesError = result.error;
  }

  const error = workspacesError ?? milestonesError;

  return (
    <main className="creator-projects-page">
      <div className="container">
        <header className="creator-page-heading">
          <span className="eyebrow">WORKSPACE</span>

          <h1>Active projects</h1>

          <p>
            Manage your current productions, milestones and
            deliverables.
          </p>
        </header>

        {error ? (
          <section className="projects-empty-state">
            <h2>We couldn’t load your projects.</h2>
            <p>{error.message}</p>
          </section>
        ) : workspaces && workspaces.length > 0 ? (
          <section className="projects-marketplace-grid">
            {workspaces.map((workspace) => {
              const workspaceMilestones = milestones.filter(
                (milestone) =>
                  milestone.contract_id === workspace.contract_id
              );

              const completed = workspaceMilestones.filter(
                (milestone) =>
                  milestone.status === "approved" ||
                  milestone.status === "paid"
              ).length;

              return (
                <article
                  className="marketplace-project-card"
                  key={workspace.id}
                >
                  <div className="marketplace-project-meta">
                    <span>
                      <FolderKanban size={15} />
                      Active production
                    </span>

                    <span className="project-open-badge">
                      {workspace.status}
                    </span>
                  </div>

                  <h2>{workspace.title}</h2>

                  <p>
                    {completed} of {workspaceMilestones.length}{" "}
                    milestones completed
                  </p>

                  <small>
                    <CalendarDays size={14} /> Started{" "}
                    {new Date(
                      workspace.started_at
                    ).toLocaleDateString("en-GB")}
                  </small>

                  <Link
                    className="button"
                    href={`/active-projects/${workspace.id}`}
                  >
                    Open workspace
                  </Link>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="projects-empty-state">
            <CheckCircle2 size={30} />

            <h2>No active projects yet</h2>

            <p>
              A project appears here after its contract has been
              signed by both parties.
            </p>

            <Link href="/applications">
              View applications
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}