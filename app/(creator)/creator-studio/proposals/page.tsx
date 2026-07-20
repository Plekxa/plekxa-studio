import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProposalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: proposals, error } = await supabase
    .from("proposals")
    .select(
      "id, title, summary, department, format, status, created_at"
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="creator-proposals-page">
      <div className="container">
        <div className="creator-panel-heading">
          <div>
            <span className="eyebrow">MY PROPOSALS</span>
            <h1>Your original ideas.</h1>
            <p>Track every project you have submitted to Plekxa.</p>
          </div>

          <Link className="button" href="/creator-studio/pitch">
            Pitch a project
          </Link>
        </div>

        {error ? (
          <p>We could not load your proposals.</p>
        ) : proposals && proposals.length > 0 ? (
          <div className="creator-proposals-grid">
            {proposals.map((proposal) => (
              <article className="creator-proposal-card" key={proposal.id}>
                <div>
                  <span>{proposal.department}</span>
                  <strong>{proposal.status.replaceAll("_", " ")}</strong>
                </div>

                <h2>{proposal.title}</h2>
                <p>{proposal.summary}</p>

                <small>
                  Submitted{" "}
                  {new Date(proposal.created_at).toLocaleDateString()}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <div className="projects-empty-state">
            <h2>No proposals yet.</h2>
            <p>Your original project pitches will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}