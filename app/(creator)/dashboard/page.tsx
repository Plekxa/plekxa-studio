import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, creator_type, location, availability, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="studio-page">
      <section className="studio-page-heading">
        <span>Overview</span>
        <h1>Your Creator Studio</h1>
        <p>
          Track projects, applications, earnings and account activity from one
          place.
        </p>
      </section>

      <section className="studio-stats-grid">
        <article>
          <span>Active projects</span>
          <strong>0</strong>
          <small>Current collaborations</small>
        </article>

        <article>
          <span>Applications</span>
          <strong>0</strong>
          <small>Awaiting review</small>
        </article>

        <article>
          <span>Pending earnings</span>
          <strong>£0.00</strong>
          <small>Fees, royalties and PPR</small>
        </article>

        <article>
          <span>Creator rating</span>
          <strong>—</strong>
          <small>No ratings yet</small>
        </article>
      </section>

      <section className="studio-dashboard-grid">
        <article className="studio-panel studio-current-work">
          <div className="studio-panel-header">
            <div>
              <span>Current work</span>
              <h2>Active projects</h2>
            </div>

            <Link href="/active-projects">
              View all
            </Link>
          </div>

          <div className="studio-empty-state">
            <h3>No active projects yet</h3>
            <p>
              When you join a project, its milestones and submissions will
              appear here.
            </p>

            <Link href="/creator-projects">
              Browse opportunities
            </Link>
          </div>
        </article>

        <article className="studio-panel">
          <div className="studio-panel-header">
            <div>
              <span>Activity</span>
              <h2>Recent updates</h2>
            </div>
          </div>

          <div className="studio-empty-state compact">
            <h3>No activity yet</h3>
            <p>
              Application decisions, messages and reviews will appear here.
            </p>
          </div>
        </article>
      </section>

      <section className="studio-panel studio-profile-summary">
        <div className="studio-panel-header">
          <div>
            <span>Your profile</span>
            <h2>Creator information</h2>
          </div>

          <Link href="/profile">
            Edit profile
          </Link>
        </div>

        <div className="studio-profile-overview">
          <div className="studio-profile-overview-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Creator"}
              />
            ) : (
              <span>
                {profile?.full_name
                  ?.split(" ")
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "CR"}
              </span>
            )}
          </div>

          <div>
            <strong>{profile?.full_name || "Complete your profile"}</strong>
            <span>{profile?.creator_type || "Creator type not set"}</span>
          </div>

          <dl>
            <div>
              <dt>Location</dt>
              <dd>{profile?.location || "Not added"}</dd>
            </div>

            <div>
              <dt>Availability</dt>
              <dd>{profile?.availability || "Not added"}</dd>
            </div>

            <div>
              <dt>Profile status</dt>
              <dd>In progress</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}