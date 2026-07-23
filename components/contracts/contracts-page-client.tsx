"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileSignature,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import type {
  ContractStatus,
  CreatorContract,
} from "@/types/contracts";
import styles from "./contracts-page.module.css";

function statusDetails(status: ContractStatus) {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        className: styles.neutral,
        icon: <Clock3 size={15} />,
      };

    case "sent":
      return {
        label: "Awaiting your signature",
        className: styles.pending,
        icon: <Clock3 size={15} />,
      };

    case "creator_signed":
      return {
        label: "Waiting for Plekxa",
        className: styles.review,
        icon: <Clock3 size={15} />,
      };

    case "client_signed":
    case "active":
      return {
        label: "Active",
        className: styles.accepted,
        icon: <CheckCircle2 size={15} />,
      };

    case "completed":
      return {
        label: "Completed",
        className: styles.accepted,
        icon: <CheckCircle2 size={15} />,
      };

    case "cancelled":
      return {
        label: "Cancelled",
        className: styles.rejected,
        icon: <XCircle size={15} />,
      };
  }
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return "To be confirmed";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ContractsPageClient() {
  const [contracts, setContracts] = useState<CreatorContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadContracts = useCallback(async () => {
    try {
      setMessage("");

      const response = await fetch("/api/contracts", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load contracts."
        );
      }

      setContracts(result.contracts ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load contracts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span>Rights and agreements</span>

          <h1>Contracts</h1>

          <p>
            Review, sign and track agreements linked to your
            approved projects.
          </p>
        </div>
      </header>

      <section className={styles.panel}>
        {loading ? (
          <div className={styles.empty}>
            <LoaderCircle
              className={styles.spinner}
              size={30}
            />

            <p>Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <FileSignature size={30} />
            </div>

            <h2>No contracts yet</h2>

            <p>
              Contracts will appear here after an application is
              approved and an agreement is issued.
            </p>

            <Link href="/applications">
              View applications
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {contracts.map((contract) => {
              const status = statusDetails(contract.status);

              return (
                <article
                  className={styles.card}
                  key={contract.id}
                >
                  <div className={styles.icon}>
                    <FileSignature size={22} />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.top}>
                      <div>
                        <h2>{contract.project_title}</h2>
                        <p>{contract.contract_number}</p>
                      </div>

                      <span
                        className={`${styles.status} ${status.className}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <div className={styles.details}>
                      <div>
                        <span>Contract value</span>

                        <strong>
                          {formatMoney(
                            Number(contract.total_amount),
                            contract.currency
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Start date</span>

                        <strong>
                          {formatDate(contract.start_date)}
                        </strong>
                      </div>

                      <div>
                        <span>End date</span>

                        <strong>
                          {formatDate(contract.end_date)}
                        </strong>
                      </div>
                    </div>

                    <footer className={styles.actions}>
                      <Link
                        href={`/contracts/${contract.id}`}
                      >
                        {contract.status === "sent"
                          ? "Review and sign"
                          : "View contract"}
                      </Link>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {message ? (
        <p className={styles.error}>{message}</p>
      ) : null}
    </main>
  );
}