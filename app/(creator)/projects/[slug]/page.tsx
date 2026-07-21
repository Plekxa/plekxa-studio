import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "./ApplicationForm";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: project }, { data: profile }, { data: existingApplication }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, title, slug, summary, description, department, deadline, status"
        )
        .eq("slug", slug)
        .eq("status", "open")
        .single(),

      supabase
        .from("profiles")
        .select("portfolio_url, availability")
        .eq("id", user.id)
        .single(),

      supabase
        .from("applications")
        .select("id, status, created_at")
        .eq("creator_id", user.id)
        .eq(
          "project_id",
          (
            await supabase
              .from("projects")
              .select("id")
              .eq("slug", slug)
              .single()
          ).data?.id ?? ""
        )
        .maybeSingle(),
    ]);

  if (!project) {
    notFound();
  }

  return (
    <main className="creator-project-page">
      <div className="container creator-project-layout">
        <section className="creator-project-details">
          <Link className="creator-back-link" href="/dashboard">
            ← Back to dashboard
          </Link>

          <span className="eyebrow">{project.department}</span>
          <h1>{project.title}</h1>
          <p className="creator-project-summary">{project.summary}</p>

          {project.description ? (
            <div className="creator-project-description">
              <h2>About the project</h2>
              <p>{project.description}</p>
            </div>
          ) : null}

          {project.deadline ? (
            <p className="creator-project-deadline">
              Application deadline:{" "}
              {new Date(project.deadline).toLocaleDateString()}
            </p>
          ) : null}
        </section>

        <aside className="creator-application-panel">
          {existingApplication ? (
            <>
              <span className="eyebrow">APPLICATION RECEIVED</span>
              <h2>You have already applied.</h2>
              <p>
                Current status:{" "}
                <strong>
                  {existingApplication.status.replaceAll("_", " ")}
                </strong>
              </p>
            </>
          ) : (
            <>
              <span className="eyebrow">APPLY TO JOIN</span>
              <h2>Submit your application.</h2>
              <p>
                Explain why your experience and creative approach suit this
                production.
              </p>

              <ApplicationForm
                projectId={project.id}
                creatorId={user.id}
                defaultPortfolioUrl={profile?.portfolio_url ?? ""}
                defaultAvailability={profile?.availability ?? ""}
              />
            </>
          )}
        </aside>
      </div>
    </main>
  );
}