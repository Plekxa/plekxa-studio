"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="creator-page">
      <div className="creator-page-heading">
        <span>Account</span>
        <h1>Settings</h1>
        <p>
          Manage account security, notifications, payment preferences and
          privacy.
        </p>
      </div>

      <div className="creator-settings-grid">
        <section className="creator-settings-card">
          <h2>Account</h2>
          <p>
            Update login credentials, account details and security preferences.
          </p>

          <button type="button" disabled>
            Change password — coming soon
          </button>
        </section>

        <section className="creator-settings-card">
          <h2>Notifications</h2>
          <p>
            Control project updates, application alerts and payment notices.
          </p>

          <button type="button" disabled>
            Notification preferences — coming soon
          </button>
        </section>

        <section className="creator-settings-card">
          <h2>Payments and tax</h2>
          <p>
            Manage payout information, payment details and future tax records.
          </p>

          <button type="button" disabled>
            Payment settings — coming soon
          </button>
        </section>

<section className="creator-settings-card">
  <h2>Help and support</h2>

  <p>
    Contact the Plekxa team about applications, projects,
    payments, assets or your creator account.
  </p>

  <a
    href="https://plekxa.com/contact?category=creator-support"
    target="_blank"
    rel="noreferrer"
    className="creator-settings-link"
  >
    Contact Creator Support
  </a>
</section>

        <section className="creator-settings-card creator-settings-danger">
          <h2>Sign out</h2>
          <p>
            Sign out of Creator Studio on this device.
          </p>

          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </section>
      </div>
    </div>
  );
}