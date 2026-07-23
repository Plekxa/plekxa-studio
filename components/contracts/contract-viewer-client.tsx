"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ArrowLeft,
  Download,
  FileSignature,
  LoaderCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type {
  ContractMilestone,
  ContractSignature,
  CreatorContract,
} from "@/types/contracts";
import styles from "./contract-viewer.module.css";

type ContractViewerClientProps = {
  contractId: string;
};

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
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getCreatorSignature(
  signatures: ContractSignature[] | undefined
) {
  return signatures?.find(
    (signature) => signature.party === "creator"
  );
}

export default function ContractViewerClient({
  contractId,
}: ContractViewerClientProps) {
  const [contract, setContract] = useState<CreatorContract | null>(
    null
  );
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState("");

  const loadContract = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/contracts/${contractId}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load the contract."
        );
      }

      setContract(result.contract);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load the contract."
      );
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  async function signContract(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!agreed) {
      setMessage(
        "You must confirm that you agree to the contract terms."
      );
      return;
    }

    setSigning(true);
    setMessage("");

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          signatureName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not sign the contract."
        );
      }

      setMessage("Your contract has been signed successfully.");
      setSignatureName("");
      setAgreed(false);

      await loadContract();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not sign the contract."
      );
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <LoaderCircle className={styles.spinner} size={30} />
          <p>Loading contract...</p>
        </div>
      </main>
    );
  }

  if (!contract) {
    return (
      <main className={styles.page}>
        <Link className={styles.back} href="/contracts">
          <ArrowLeft size={16} />
          Back to contracts
        </Link>

        <div className={styles.errorState}>
          <h1>Contract unavailable</h1>
          <p>{message || "This contract could not be found."}</p>
        </div>
      </main>
    );
  }

  const content = contract.content ?? {};
  const milestones =
    contract.contract_milestones?.sort(
      (a: ContractMilestone, b: ContractMilestone) =>
        a.position - b.position
    ) ?? [];

  const creatorSignature = getCreatorSignature(
    contract.contract_signatures
  );

  const canSign = contract.status === "sent";

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/contracts">
        <ArrowLeft size={16} />
        Back to contracts
      </Link>

      <header className={styles.heading}>
        <div>
          <span>Creator services agreement</span>
          <h1>{contract.project_title}</h1>
          <p>{contract.contract_number}</p>
        </div>

        <div className={styles.status}>
          {canSign ? (
            <Clock3 size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}

          {contract.status === "sent"
            ? "Awaiting your signature"
            : contract.status === "creator_signed"
              ? "Signed by creator"
              : contract.status.replaceAll("_", " ")}
        </div>
      </header>

      <div className={styles.layout}>
        <article className={styles.document}>
          <section className={styles.summary}>
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
              <strong>{formatDate(contract.start_date)}</strong>
            </div>

            <div>
              <span>End date</span>
              <strong>{formatDate(contract.end_date)}</strong>
            </div>
          </section>

          {content.introduction ? (
            <section className={styles.section}>
              <h2>Agreement</h2>
              <p>{content.introduction}</p>
            </section>
          ) : null}

          {content.scope ? (
            <section className={styles.section}>
              <h2>Scope of services</h2>
              <p>{content.scope}</p>
            </section>
          ) : null}

          {content.deliverables?.length ? (
            <section className={styles.section}>
              <h2>Deliverables</h2>

              <ul>
                {content.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {milestones.length > 0 ? (
            <section className={styles.section}>
              <h2>Payment milestones</h2>

              <div className={styles.milestones}>
                {milestones.map((milestone) => (
                  <article key={milestone.id}>
                    <div>
                      <strong>{milestone.title}</strong>
                      <p>{milestone.description}</p>
                    </div>

                    <div>
                      <strong>
                        {formatMoney(
                          Number(milestone.amount),
                          contract.currency
                        )}
                      </strong>

                      <span>
                        {formatDate(milestone.due_date)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {content.paymentTerms ? (
            <section className={styles.section}>
              <h2>Payment terms</h2>
              <p>{content.paymentTerms}</p>
            </section>
          ) : null}

          {content.intellectualProperty ? (
            <section className={styles.section}>
              <h2>Intellectual property</h2>
              <p>{content.intellectualProperty}</p>
            </section>
          ) : null}

          {content.confidentiality ? (
            <section className={styles.section}>
              <h2>Confidentiality</h2>
              <p>{content.confidentiality}</p>
            </section>
          ) : null}

          {content.termination ? (
            <section className={styles.section}>
              <h2>Termination</h2>
              <p>{content.termination}</p>
            </section>
          ) : null}

          {content.additionalTerms ? (
            <section className={styles.section}>
              <h2>Additional terms</h2>
              <p>{content.additionalTerms}</p>
            </section>
          ) : null}
        </article>

        <aside className={styles.signingPanel}>
            <a
  className={styles.downloadButton}
  href={`/api/contracts/${contract.id}/download`}
  target="_blank"
  rel="noreferrer"
>
  <Download size={17} />
  Download contract
</a>
          {canSign ? (
            <>
              <div className={styles.signingIcon}>
                <FileSignature size={26} />
              </div>

              <h2>Sign this agreement</h2>

              <p>
                Type your full legal name to electronically sign
                this contract.
              </p>

              <form onSubmit={signContract}>
                <label>
                  Full legal name

                  <input
                    value={signatureName}
                    onChange={(event) =>
                      setSignatureName(event.target.value)
                    }
                    placeholder="Your full legal name"
                    minLength={2}
                    maxLength={150}
                    required
                  />
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) =>
                      setAgreed(event.target.checked)
                    }
                  />

                  <span>
                    I have reviewed this contract and agree to
                    be legally bound by its terms.
                  </span>
                </label>

                <button type="submit" disabled={signing}>
                  <FileSignature size={17} />

                  {signing
                    ? "Signing..."
                    : "Sign contract"}
                </button>
              </form>
            </>
          ) : creatorSignature ? (
            <div className={styles.signed}>
              <div>
                <ShieldCheck size={30} />
              </div>

              <h2>Contract signed</h2>

              <p>
                Signed by{" "}
                <strong>
                  {creatorSignature.signature_name}
                </strong>
              </p>

              <span>
                {formatDate(creatorSignature.signed_at)}
              </span>

              {contract.status === "creator_signed" ? (
                <small>
                  Waiting for Plekxa to countersign and activate
                  the project.
                </small>
              ) : null}
            </div>
          ) : (
            <div className={styles.signed}>
              <CheckCircle2 size={30} />
              <h2>Contract status</h2>
              <p>{contract.status.replaceAll("_", " ")}</p>
            </div>
          )}

          {message ? (
            <p className={styles.message}>{message}</p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}