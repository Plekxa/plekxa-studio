import Link from "next/link";
import {
  ArrowDownToLine,
  Banknote,
  CircleDollarSign,
  Clock3,
  Landmark,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { getCreatorEarnings } from "@/lib/creator-studio-data";
import styles from "../creator-pages.module.css";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function EarningsPage() {
  const { earnings, payouts } = await getCreatorEarnings();

  const available = earnings
    .filter((earning) => earning.status === "available")
    .reduce((total, earning) => total + earning.amount, 0);

  const pending = earnings
    .filter((earning) => earning.status === "pending")
    .reduce((total, earning) => total + earning.amount, 0);

  const lifetime = earnings
    .filter((earning) => earning.status !== "cancelled")
    .reduce((total, earning) => total + earning.amount, 0);

  const now = new Date();

  const thisMonth = earnings
    .filter((earning) => {
      const date = new Date(earning.earnedAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        earning.status !== "cancelled"
      );
    })
    .reduce((total, earning) => total + earning.amount, 0);

  const currency = earnings[0]?.currency ?? "GBP";

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Creator finance</span>
          <h1>Earnings</h1>
          <p>
            Track project income, royalties, available funds and your
            creator payout history.
          </p>
        </div>

        <Link href="/settings/payments" className={styles.primaryButton}>
          <Landmark size={17} />
          Payout settings
        </Link>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <WalletCards size={20} />
          </div>
          <span className={styles.statLabel}>Available balance</span>
          <strong className={styles.statValue}>
            {formatCurrency(available, currency)}
          </strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock3 size={20} />
          </div>
          <span className={styles.statLabel}>Pending</span>
          <strong className={styles.statValue}>
            {formatCurrency(pending, currency)}
          </strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <CircleDollarSign size={20} />
          </div>
          <span className={styles.statLabel}>Lifetime earnings</span>
          <strong className={styles.statValue}>
            {formatCurrency(lifetime, currency)}
          </strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <span className={styles.statLabel}>This month</span>
          <strong className={styles.statValue}>
            {formatCurrency(thisMonth, currency)}
          </strong>
        </article>
      </section>

      <div className={styles.financeLayout}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent earnings</h2>
              <p>Income generated from projects and royalties.</p>
            </div>
          </div>

          {earnings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Banknote size={28} />
              </div>

              <h2>No earnings recorded yet</h2>
              <p>
                Approved payments and experience royalties will appear here
                once they are allocated to your creator account.
              </p>

              <Link href="/projects" className={styles.primaryButton}>
                Browse projects
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {earnings.slice(0, 12).map((earning) => (
                <div key={earning.id} className={styles.listItem}>
                  <div className={styles.listMain}>
                    <div className={styles.listIcon}>
                      <CircleDollarSign size={18} />
                    </div>

                    <div>
                      <strong>{earning.projectName}</strong>
                      <span>
                        {earning.source} ·{" "}
                        {formatDate(earning.earnedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.listAmount}>
                    <strong>
                      {formatCurrency(
                        earning.amount,
                        earning.currency
                      )}
                    </strong>

                    <span
                      className={`${styles.status} ${
                        earning.status === "available"
                          ? styles.statusAvailable
                          : earning.status === "paid"
                            ? styles.statusPaid
                            : earning.status === "pending"
                              ? styles.statusPending
                              : styles.statusCancelled
                      }`}
                    >
                      {earning.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Payout history</h2>
              <p>Transfers sent to your payout method.</p>
            </div>
          </div>

          {payouts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ArrowDownToLine size={28} />
              </div>

              <h2>No payouts yet</h2>
              <p>
                Completed withdrawals will appear here after your payout
                account is connected.
              </p>

              <Link
                href="/settings/payments"
                className={styles.secondaryButton}
              >
                Connect payout method
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {payouts.slice(0, 8).map((payout) => (
                <div key={payout.id} className={styles.listItem}>
                  <div className={styles.listMain}>
                    <div className={styles.listIcon}>
                      <ArrowDownToLine size={18} />
                    </div>

                    <div>
                      <strong>
                        {payout.payoutMethod === "stripe"
                          ? "Bank payout"
                          : "PayPal payout"}
                      </strong>
                      <span>{formatDate(payout.createdAt)}</span>
                    </div>
                  </div>

                  <div className={styles.listAmount}>
                    <strong>
                      {formatCurrency(
                        payout.amount,
                        payout.currency
                      )}
                    </strong>

                    <span
                      className={`${styles.status} ${
                        payout.status === "paid"
                          ? styles.statusPaid
                          : payout.status === "processing"
                            ? styles.statusProcessing
                            : payout.status === "pending"
                              ? styles.statusPending
                              : styles.statusFailed
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}