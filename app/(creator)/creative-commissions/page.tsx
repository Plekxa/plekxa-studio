'use client';
import { useEffect, useState } from 'react';

type Casting = { id: string; title: string; role_name: string; description: string | null; requirements: string | null; positions: number; application_deadline: string | null; creative_commissions: { title: string; description: string | null; starts_on: string | null; ends_on: string | null } };
type Application = { id: string; casting_id: string; status: string };
export default function CreativeCommissionsPage() {
  const [castings, setCastings] = useState<Casting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [statement, setStatement] = useState<Record<string, string>>({});
  const [portfolio, setPortfolio] = useState<Record<string, string>>({});
  async function refresh() {
    const res = await fetch('/api/creative-commissions', { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Unable to load castings');
    setCastings(json.castings ?? []); setApplications(json.applications ?? []);
  }
  useEffect(() => { refresh().catch((e) => setMessage(e.message)).finally(() => setLoading(false)); }, []);
  async function apply(castingId: string) {
    setBusy(castingId); setMessage('');
    try {
      const res = await fetch('/api/creative-commissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ castingId, statement: statement[castingId] ?? '', portfolioUrl: portfolio[castingId] ?? '' }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Application failed');
      await refresh(); setMessage('Application submitted.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Application failed'); }
    finally { setBusy(null); }
  }
  return <div className="container" style={{ maxWidth: 920, paddingBlock: 32 }}>
    <span className="eyebrow">PLEKXA CREATOR OPPORTUNITIES</span>
    <h1>Creative Commissions</h1>
    <p>Apply to join funded, time-limited creative programmes. Each creator receives individual contractual terms before membership becomes active.</p>
    {message && <p role="status">{message}</p>}
    {loading ? <p>Loading opportunities…</p> : castings.length === 0 ? <p>No open Creative Commission castings are available yet.</p> : castings.map(c => {
      const existing = applications.find(a => a.casting_id === c.id);
      return <section key={c.id} style={{ border: '1px solid #7775', borderRadius: 12, padding: 20, marginBlock: 16 }}>
        <p className="eyebrow">{c.creative_commissions?.title}</p>
        <h2>{c.title}</h2>
        <p><strong>Role:</strong> {c.role_name} · <strong>Positions:</strong> {c.positions}</p>
        {c.description && <p>{c.description}</p>}
        {c.requirements && <p><strong>Requirements:</strong> {c.requirements}</p>}
        {c.application_deadline && <p>Apply by {new Date(c.application_deadline).toLocaleDateString()}</p>}
        {existing ? <p><strong>Application status:</strong> {existing.status}</p> : <form onSubmit={e => { e.preventDefault(); void apply(c.id); }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Why would you like to join?<textarea style={{ display: 'block', width: '100%', minHeight: 90 }} maxLength={5000} value={statement[c.id] ?? ''} onChange={e => setStatement(p => ({ ...p, [c.id]: e.target.value }))}/></label>
          <label style={{ display: 'block', marginBottom: 12 }}>Portfolio URL (optional)<input type="url" style={{ display: 'block', width: '100%' }} value={portfolio[c.id] ?? ''} onChange={e => setPortfolio(p => ({ ...p, [c.id]: e.target.value }))}/></label>
          <button className="button" type="submit" disabled={busy !== null}>{busy === c.id ? 'Submitting…' : 'Apply to this commission'}</button>
        </form>}
      </section>;
    })}
  </div>;
}
