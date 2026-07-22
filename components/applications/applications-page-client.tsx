"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import styles from "./applications-page.module.css";

type ApplicationStatus =
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected"
  | "withdrawn";

type ProjectRelation =
  | {
      id: string;
      title: string;
    }
  | {
      id: string;
      title: string;
    }[]
  | null;

type Application = {
  id: string;
  project_id: string;
  creator_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  portfolio_url: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  applied_at: string;
  reviewed_at: string | null;
  withdrawn_at: string | null;
  updated_at: string;
  projects: ProjectRelation;
};

function getProject(application: Application) {
  if (Array.isArray(application.projects)) {
    return application.projects[0] ?? null;
  }

  return application.projects;
}

function statusDetails(status: ApplicationStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending review",
        icon: <Clock3 size={15} />,
        className: styles.pending,
      };

    case "under_review":
      return {
        label: "Under review",
        icon: <Eye size={15} />,
        className: styles.review,
      };

    case "accepted":
      return {
        label: "Accepted",
        icon: <CheckCircle2 size={15} />,
        className: styles.accepted,
      };

    case "rejected":
      return {
        label: "Not selected",
        icon: <XCircle size={15} />,
        className: styles.rejected,
      };

    case "withdrawn":
      return {
        label: "Withdrawn",
        icon: <RotateCcw size={15} />,
        className: styles.withdrawn,
      };
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ApplicationsPageClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/applications", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load your applications."
        );
      }

      setApplications(result.applications ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load your applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function withdrawApplication(applicationId: string) {
    const confirmed = window.confirm(
      "Withdraw this application? You may need to apply again later."
    );

    if (!confirmed) {
      return;
    }

    setWithdrawingId(applicationId);
    setMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not withdraw your application."
        );
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: "withdrawn",
                withdrawn_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : application
        )
      );

      setMessage(result.message || "Application withdrawn.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not withdraw your application."
      );
    } finally {
      setWithdrawingId(null);
    }
  }

  const activeCount = applications.filter((application) =>
    ["pending", "under_review"].includes(application.status)
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "accepted"
  ).length;

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span>Creator opportunities</span>
          <h1>Applications</h1>
          <p>
            Track every project application and see when the studio
            team has made a decision.
          </p>
        </div>

        <Link href="/projects">Browse projects</Link>
      </header>

      <section className={styles.stats}>
        <article>
          <BriefcaseBusiness size={19} />
          <div>
            <strong>{applications.length}</strong>
            <span>Total applications</span>
          </div>
        </article>

        <article>
          <Clock3 size={19} />
          <div>
            <strong>{activeCount}</strong>
            <span>In review</span>
          </div>
        </article>

        <article>
          <CheckCircle2 size={19} />
          <div>
            <strong>{acceptedCount}</strong>
            <span>Accepted</span>
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        {loading ? (
          <div className={styles.empty}>
            <LoaderCircle
              size={28}
              className={styles.spinner}
            />
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <BriefcaseBusiness size={29} />
            </div>

            <h2>No applications yet</h2>
            <p>
              Browse available projects and apply for the ones that
              match your skills.
            </p>

            <Link href="/projects">Browse projects</Link>
          </div>
        ) : (
          applications.map((application) => {
            const project = getProject(application);
            const status = statusDetails(application.status);

            const canWithdraw = ["pending", "under_review"].includes(
              application.status
            );

            return (
              <article
                className={styles.application}
                key={application.id}
              >
                <div className={styles.projectIcon}>
                  <BriefcaseBusiness size={20} />
                </div>

                <div className={styles.applicationContent}>
                  <div className={styles.applicationTop}>
                    <div>
                      <h2>
                        {project?.title || "Creator project"}
                      </h2>

                      <p>
                        <CalendarDays size={14} />
                        Applied {formatDate(application.applied_at)}
                      </p>
                    </div>

                    <span
                      className={`${styles.status} ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {application.rejection_reason ? (
                    <div className={styles.feedback}>
                      <strong>Studio feedback</strong>
                      <p>{application.rejection_reason}</p>
                    </div>
                  ) : null}

                  <footer className={styles.applicationActions}>
                    <Link href={`/projects/${application.project_id}`}>
                      View project
                    </Link>

                    {application.status === "accepted" ? (
                      <Link
                        className={styles.primaryAction}
                        href={`/contracts?application=${application.id}`}
                      >
                        Continue to contract
                      </Link>
                    ) : null}

                    {canWithdraw ? (
                      <button
                        type="button"
                        disabled={withdrawingId === application.id}
                        onClick={() =>
                          void withdrawApplication(application.id)
                        }
                      >
                        {withdrawingId === application.id
                          ? "Withdrawing..."
                          : "Withdraw application"}
                      </button>
                    ) : null}
                  </footer>
                </div>
              </article>
            );
          })
        )}
      </section>

      {message ? <p className={styles.message}>{message}</p> : null}
    </main>
  );
}