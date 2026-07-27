"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
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

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        data: {
          full_name: fullName.trim(),
          creator_type: creatorType,
          account_type: "creator",
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      window.location.assign("/dashboard");
      return;
    }

    setMessage("Account created. Check your email and click the confirmation link to continue.");
    setSubmitting(false);
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
