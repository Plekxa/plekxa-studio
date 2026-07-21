import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="studio-page">

      <section className="studio-page-heading">
        <span>Settings</span>
        <h1>Account Settings</h1>
      </section>

      <div className="studio-settings-grid">

        <Link
          href="/settings/password"
          className="studio-settings-card"
        >
          <h3>Change password</h3>
          <p>Update your account password.</p>
        </Link>

        <Link
          href="/settings/notifications"
          className="studio-settings-card"
        >
          <h3>Notifications</h3>
          <p>Email and notification preferences.</p>
        </Link>

        <Link
          href="/settings/payments"
          className="studio-settings-card"
        >
          <h3>Payments</h3>
          <p>Royalties, payouts and banking.</p>
        </Link>

      </div>

    </div>
  );
}