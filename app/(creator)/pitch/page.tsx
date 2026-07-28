"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PitchProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [format, setFormat] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          description,
          department,
          format,
          estimated_timeline: timeline,
          estimated_budget: budget,
          portfolio_url: portfolioUrl,
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Could not submit proposal.");
      router.push("/proposals");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit proposal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="creator-pitch-page">
      <div className="container">
        <div className="creator-pitch-heading">
          <Link href="/dashboard">
            ← Back to dashboard
          </Link>

          <span className="eyebrow">ORIGINAL PROJECT PITCH</span>
          <h1>Pitch your next big idea.</h1>
          <p>
            Propose an original Plekxa project for development, commissioning
            or collaboration.
          </p>
        </div>

        <form className="creator-pitch-form" onSubmit={handleSubmit}>
          <section className="creator-pitch-section">
            <span>01</span>

            <div>
              <h2>Project basics</h2>

              <label>
                Project title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </label>

              <label>
                One-line summary
                <input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Describe the idea in one strong sentence."
                  required
                />
              </label>

              <div className="creator-pitch-fields">
                <label>
                  Department
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    required
                  >
                    <option value="">Choose one</option>
                    <option value="Music">Music</option>
                    <option value="Film">Film</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Visual Experience">Visual experience</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Format
                  <input
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    placeholder="Album, series, film, live experience..."
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="creator-pitch-section">
            <span>02</span>

            <div>
              <h2>The vision</h2>

              <label>
                Full concept
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={10}
                  placeholder="Explain the concept, why it matters, the audience and why Plekxa should make it."
                  required
                />
              </label>
            </div>
          </section>

          <section className="creator-pitch-section">
            <span>03</span>

            <div>
              <h2>Planning</h2>

              <div className="creator-pitch-fields">
                <label>
                  Estimated timeline
                  <input
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value)}
                    placeholder="For example: 3 months"
                  />
                </label>

                <label>
                  Estimated budget
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <label>
                Portfolio or supporting link
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          <section className="creator-pitch-submit">
            <div>
              <h2>Ready to submit?</h2>
              <p>
                Your proposal will be sent to the internal Plekxa team for
                review.
              </p>
            </div>

            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit proposal"}
            </button>
          </section>

          {message ? <p className="application-message">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}