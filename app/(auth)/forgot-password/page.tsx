"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrorMessage("");

    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage(
      "Check your email for a secure password-reset link. You can close this page after opening the email."
    );
    setSubmitting(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1>Reset your password</h1>
          <p>Enter the email address connected to your Plekxa Studio account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Sending link..." : "Send reset link"}
          </button>

          {message ? <p className="auth-message auth-success">{message}</p> : null}
          {errorMessage ? <p className="auth-message">{errorMessage}</p> : null}
        </form>

        <p className="auth-switch">
          Remembered your password? <Link href="/login">Return to sign in</Link>
        </p>
      </section>
    </main>
  );
}
