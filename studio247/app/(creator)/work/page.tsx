import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  FileCheck2,
  Layers3,
} from "lucide-react";
import { getCompletedWork } from "@/lib/creator-studio-data";
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

export default async function CompletedWorkPage() {
  const work = await getCompletedWork();

  const completedProjects = work.length;
  const approvedAssets = work.reduce(
    (total, item) => total + item.approvedAssets,
    0
  );
  const totalEarnings = work.reduce(
    (total, item) => total + item.earnings,
    0
  );
  const clients = new Set(work.map((item) => item.clientName)).size;
  const currency = work[0]?.currency ?? "GBP";

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Portfolio</span>
          <h1>Completed work</h1>
          <p>
            Review approved projects, delivered assets and the earnings
            attached to your finished creator work.
          </p>
        </div>

        <Link href="/projects" className={styles.secondaryButton}>
          <BriefcaseBusiness size={17} />
          Browse projects
        </Link>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <BadgeCheck size={20} />
          </div>
          <span className={styles.statLabel}>Completed projects</span>
          <strong className={styles.statValue}>{completedProjects}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileCheck2 size={20} />
          </div>
          <span className={styles.statLabel}>Approved assets</span>
          <strong className={styles.statValue}>{approvedAssets}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Layers3 size={20} />
          </div>
          <span className={styles.statLabel}>Clients worked with</span>
          <strong className={styles.statValue}>{clients}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <CircleDollarSign size={20} />
          </div>
          <span className={styles.statLabel}>Completed-work earnings</span>
          <strong className={styles.statValue}>
            {formatCurrency(totalEarnings, currency)}
          </strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Work history</h2>
            <p>Your approved and completed creator projects.</p>
          </div>
        </div>

        {work.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FileCheck2 size={28} />
            </div>

            <h2>No completed work yet</h2>
            <p>
              Projects will appear here after your submitted assets have
              been approved and the project has been marked as completed.
            </p>

            <Link href="/projects" className={styles.primaryButton}>
              Browse available projects
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Role</th>
                  <th>Completed</th>
                  <th>Assets</th>
                  <th>Status</th>
                  <th>Earnings</th>
                </tr>
              </thead>

              <tbody>
                {work.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.projectCell}>
                        <div className={styles.thumbnail}>
                          {item.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnailUrl} alt="" />
                          ) : (
                            <BriefcaseBusiness size={20} />
                          )}
                        </div>

                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.clientName}</span>
                        </div>
                      </div>
                    </td>

                    <td>{item.role}</td>
                    <td>{formatDate(item.completedAt)}</td>
                    <td>{item.approvedAssets}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          item.status === "approved" ||
                          item.status === "completed"
                            ? styles.statusApproved
                            : styles.statusArchived
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className={styles.money}>
                      {formatCurrency(item.earnings, item.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}