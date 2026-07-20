"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creatorType, setCreatorType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          creator_type: creatorType,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your account."
    );

    setSubmitting(false);
    router.refresh();
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <span className="eyebrow">CREATE WITH PLEKXA</span>
          <h1>Create your creator account</h1>
          <p>
            Apply to Plekxa projects, pitch original ideas and track your
            submissions.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            Primary creator type
            <select
              value={creatorType}
              onChange={(event) => setCreatorType(event.target.value)}
              required
            >
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
    required
  />

  <span>
    I agree to the{" "}
    <Link
      href="/terms"
      target="_blank"
    >
      Terms of Use
    </Link>
    ,{" "}
    <Link
      href="/privacy"
      target="_blank"
    >
      Privacy Policy
    </Link>{" "}
    and{" "}
    <Link
      href="/cookies"
      target="_blank"
    >
      Cookie Policy
    </Link>
    .
  </span>
</label>

          <button
  className="button"
  type="submit"
  disabled={submitting || !acceptedTerms}
>
  {submitting ? "Creating account..." : "Create account"}
</button>

          {message ? <p className="auth-message">{message}</p> : null}
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}