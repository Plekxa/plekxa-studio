"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PayoutStatus = {
  stripeConnected: boolean;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  paypalEmail: string;
  preferredPayoutMethod: "bank" | "paypal" | null;
};

const initialStatus: PayoutStatus = {
  stripeConnected: false,
  detailsSubmitted: false,
  payoutsEnabled: false,
  paypalEmail: "",
  preferredPayoutMethod: null,
};

export default function PaymentsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [status, setStatus] = useState<PayoutStatus>(initialStatus);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [message, setMessage] = useState("");

  async function loadStatus() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/stripe/status", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load payout status.");
      }

      setStatus(result);
      setPaypalEmail(result.paypalEmail || "");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load payout status."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function connectBankAccount() {
    setConnecting(true);
    setMessage("");

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error || "Stripe onboarding could not be started."
        );
      }

      window.location.assign(result.url);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Stripe onboarding could not be started."
      );
      setConnecting(false);
    }
  }

  async function savePaypal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPaypal(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be signed in.");
      setSavingPaypal(false);
      return;
    }

    const normalizedEmail = paypalEmail.trim().toLowerCase();

    const { error } = await supabase
      .from("profiles")
      .update({
        paypal_email: normalizedEmail,
        preferred_payout_method: "paypal",
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      setSavingPaypal(false);
      return;
    }

    setStatus((current) => ({
      ...current,
      paypalEmail: normalizedEmail,
      preferredPayoutMethod: "paypal",
    }));

    setMessage("PayPal email saved.");
    setSavingPaypal(false);
  }

  if (loading) {
    return (
      <div className="studio-page">
        <p>Loading payout settings...</p>
      </div>
    );
  }

  return (
    <div className="studio-page">
      <section className="studio-page-heading">
        <span>Finance</span>
        <h1>Payout methods</h1>
        <p>
          Connect your bank through Stripe or save the PayPal account
          associated with future creator payouts.
        </p>
      </section>

      <div className="studio-payout-grid">
        <section className="studio-panel studio-payout-card">
          <div className="studio-payout-icon">
            <Building2 size={23} />
          </div>

          <div className="studio-payout-card-header">
            <div>
              <span>Bank account</span>
              <h2>Stripe Connect</h2>
            </div>

            {status.payoutsEnabled ? (
              <div className="studio-payout-status success">
                <BadgeCheck size={15} />
                Ready
              </div>
            ) : status.detailsSubmitted ? (
              <div className="studio-payout-status pending">
                Verification pending
              </div>
            ) : null}
          </div>

          <p>
            Stripe securely collects and verifies your identity and bank
            details. Plekxa does not store your full bank-account information.
          </p>

          <button
            type="button"
            onClick={connectBankAccount}
            disabled={connecting}
          >
            {connecting
              ? "Opening Stripe..."
              : status.stripeConnected
                ? "Continue bank setup"
                : "Connect bank account"}

            <ExternalLink size={15} />
          </button>
        </section>

        <section className="studio-panel studio-payout-card">
          <div className="studio-payout-icon paypal">
            <Mail size={23} />
          </div>

          <div className="studio-payout-card-header">
            <div>
              <span>PayPal</span>
              <h2>PayPal payout email</h2>
            </div>

            {status.paypalEmail ? (
              <div className="studio-payout-status pending">
                Saved
              </div>
            ) : null}
          </div>

          <p>
            Save the email address attached to the PayPal account you may use
            for future eligible payouts.
          </p>

          <form className="studio-paypal-form" onSubmit={savePaypal}>
            <label>
              <span>PayPal email address</span>

              <input
                type="email"
                value={paypalEmail}
                onChange={(event) => setPaypalEmail(event.target.value)}
                placeholder="creator@example.com"
                required
              />
            </label>

            <button type="submit" disabled={savingPaypal}>
              {savingPaypal ? "Saving..." : "Save PayPal details"}
            </button>
          </form>

          <small>
            PayPal transfers are not active yet. This currently stores the
            creator’s preferred PayPal email only.
          </small>
        </section>
      </div>

      {message ? (
        <p className="studio-settings-message">{message}</p>
      ) : null}
    </div>
  );
}