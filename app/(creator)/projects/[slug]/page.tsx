import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "./ApplicationForm";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, department, deadline, status"
    )
    .eq("slug", slug)
    .eq("status", "open")
    .single();

  if (!project) {
    notFound();
  }

  const [{ data: profile }, { data: existingApplication }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("portfolio_url, availability")
        .eq("id", user.id)
        .single(),

      supabase
        .from("creator_applications")
        .select("id, status, applied_at")
        .eq("creator_user_id", user.id)
        .eq("project_id", project.id)
        .in("status", [
          "pending",
          "under_review",
          "accepted",
        ])
        .maybeSingle(),
    ]);

  return (
    <main className="creator-project-page">
      <div className="container creator-project-layout">
        <section className="creator-project-details">
          <Link className="creator-back-link" href="/projects">
            ← Back to projects
          </Link>

          <span className="eyebrow">
            {project.department}
          </span>

          <h1>{project.title}</h1>

          <p className="creator-project-summary">
            {project.summary}
          </p>

          {project.description ? (
            <div className="creator-project-description">
              <h2>About the project</h2>
              <p>{project.description}</p>
            </div>
          ) : null}

          {project.deadline ? (
            <p className="creator-project-deadline">
              Application deadline:{" "}
              {new Date(
                project.deadline
              ).toLocaleDateString()}
            </p>
          ) : null}
        </section>

        <aside className="creator-application-panel">
          {existingApplication ? (
            <>
              <span className="eyebrow">
                APPLICATION RECEIVED
              </span>

              <h2>You have already applied.</h2>

              <p>
                Current status:{" "}
                <strong>
                  {existingApplication.status.replaceAll(
                    "_",
                    " "
                  )}
                </strong>
              </p>

              <Link
                className="button"
                href="/applications"
              >
                View application
              </Link>
            </>
          ) : (
            <>
              <span className="eyebrow">
                APPLY TO JOIN
              </span>

              <h2>Submit your application.</h2>

              <p>
                Explain why your experience and creative
                approach suit this production.
              </p>

              <ApplicationForm
  projectId={project.id}
  defaultPortfolioUrl={profile?.portfolio_url ?? ""}
/>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}