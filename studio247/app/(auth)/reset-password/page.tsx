"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasRecoverySession(Boolean(data.session));
      setCheckingSession(false);
    }

    void checkSession();
    return () => {
      mounted = false;
    };
  }, [supabase.auth]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?password_reset=success");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p>Checking your reset link...</p>
        </section>
      </main>
    );
  }

  if (!hasRecoverySession) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div>
            <span className="eyebrow">RESET LINK EXPIRED</span>
            <h1>Request another reset link</h1>
            <p>This password-reset link is invalid or has expired.</p>
          </div>
          <Link className="button auth-button-link" href="/forgot-password">
            Send another reset link
          </Link>
          <p className="auth-switch">
            <Link href="/login">Return to sign in</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <span className="eyebrow">SECURE YOUR ACCOUNT</span>
          <h1>Create a new password</h1>
          <p>Choose a new password with at least 8 characters.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating password..." : "Update password"}
          </button>

          {message ? <p className="auth-message">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
