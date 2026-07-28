"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  title: string;
  summary?: string;
  department?: string;
  status?: string;
  created_at?: string;
};

export default function ProposalsPage() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/proposals", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load proposals.");
        setItems(result.proposals || []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load proposals."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="creator-proposals-page"><div className="container">
      <div className="creator-panel-heading"><div><span className="eyebrow">MY PROPOSALS</span><h1>Your original ideas.</h1><p>Track every project you have submitted to Plekxa.</p></div><Link className="button" href="/pitch">Pitch a project</Link></div>
      {loading ? <p>Loading proposals…</p> : error ? <p>{error}</p> : items.length ? (
        <div className="creator-proposals-grid">{items.map((proposal) => <article className="creator-proposal-card" key={proposal.id}><div><span>{proposal.department || "Plekxa"}</span><strong>{(proposal.status || "submitted").replaceAll("_", " ")}</strong></div><h2>{proposal.title}</h2><p>{proposal.summary}</p><small>Submitted {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString("en-GB") : "—"}</small></article>)}</div>
      ) : <div className="projects-empty-state"><h2>No proposals yet.</h2><p>Your original project pitches will appear here.</p></div>}
    </div></main>
  );
}
