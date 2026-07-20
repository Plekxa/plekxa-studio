import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function CreatorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile, error: profileError },
    { data: projects, error: projectsError },
    { count: applicationsCount },
    { count: proposalsCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, creator_type, bio, location, portfolio_url, availability"
      )
      .eq("id", user.id)
      .single(),

    supabase
      .from("projects")
      .select("id, title, slug, summary, department, deadline")
      .eq("status", "open")
      .order("created_at", { ascending: false }),

    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),

    supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),
  ]);

  if (profileError || !profile) {
    return (
      <section className="creator-dashboard-page">
        <div className="container">
          <p>We could not load your creator profile.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="creator-dashboard-page">
      <div className="container">
        <div className="creator-dashboard-heading">
          <span className="eyebrow">CREATOR STUDIO</span>
          <h1>Welcome, {profile.full_name || "creator"}.</h1>
          <p>
            Apply to Plekxa productions, pitch original ideas and manage your
            creative profile.
          </p>
        </div>

        <div className="creator-dashboard-grid">
          <article className="creator-dashboard-card">
            <span>Applications</span>
            <strong>{applicationsCount ?? 0}</strong>
            <p>Your submitted project applications.</p>
          </article>

          <article className="creator-dashboard-card">
            <span>Proposals</span>
            <strong>{proposalsCount ?? 0}</strong>
            <p>Your original ideas submitted to Plekxa.</p>
          </article>

          <article className="creator-dashboard-card">
            <span>Open opportunities</span>
            <strong>{projects?.length ?? 0}</strong>
            <p>Projects currently accepting creators.</p>
          </article>
        </div>

        <section className="creator-opportunities-panel">
          <div className="creator-panel-heading">
            <div>
              <span className="eyebrow">OPEN OPPORTUNITIES</span>
              <h2>Join a Plekxa project.</h2>
              <p>
                Apply to active productions that match your skills and
                interests.
              </p>
            </div>

            <Link className="button button-secondary" href="/creator-studio/pitch">
              Pitch your own project
            </Link>
          </div>

          {projectsError ? (
            <p>We could not load the current opportunities.</p>
          ) : projects && projects.length > 0 ? (
            <div className="creator-opportunities-grid">
              {projects.map((project) => (
                <article className="creator-opportunity-card" key={project.id}>
                  <span>{project.department}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>

                  {project.deadline ? (
                    <small>
                      Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString()}
                    </small>
                  ) : null}

                  <Link
                    className="button"
                    href={`/creator-studio/projects/${project.slug}`}
                  >
                    View project
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p>There are no open opportunities at the moment.</p>
          )}
        </section>

        <section className="creator-profile-panel">
          <div>
            <span className="eyebrow">YOUR PROFILE</span>
            <h2>Keep your creator information current.</h2>
          </div>

          <ProfileForm profile={profile} />
        </section>
      </div>
    </section>
  );
}