"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creatorType, setCreatorType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!acceptedTerms) {
      setMessage("Please agree to the Terms of Use, Privacy Policy and Cookie Policy.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          creatorType,
          acceptedTerms,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error || "Could not create your account.");
        return;
      }

      setMessage("Account created. You can now sign in.");
      window.setTimeout(() => window.location.assign("/login?created=1"), 900);
    } catch (error) {
      console.error("Signup request failed:", error);
      setMessage("Could not reach the signup service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <span className="eyebrow">CREATE WITH PLEKXA</span>
          <h1>Create your creator account</h1>
          <p>Apply to Plekxa projects, pitch original ideas and track your submissions.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>

          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          </label>

          <label>
            Primary creator type
            <select value={creatorType} onChange={(event) => setCreatorType(event.target.value)} required>
              <option value="">Choose one</option>
              <option value="musician">Musician</option>
              <option value="producer">Producer</option>
              <option value="songwriter">Songwriter</option>
              <option value="filmmaker">Filmmaker</option>
              <option value="writer">Writer</option>
              <option value="designer">Designer</option>
              <option value="host">Host or presenter</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="auth-consent">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
            />
            <span>
              I agree to the <a href="https://plekxa.com/terms" target="_blank" rel="noreferrer">Terms of Use</a>,{" "}
              <a href="https://plekxa.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and{" "}
              <a href="https://plekxa.com/cookies" target="_blank" rel="noreferrer">Cookie Policy</a>.
            </span>
          </label>

          <button className="button" type="submit" disabled={submitting || !acceptedTerms}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          {message ? <p className="auth-message" role="status">{message}</p> : null}
        </form>

        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
