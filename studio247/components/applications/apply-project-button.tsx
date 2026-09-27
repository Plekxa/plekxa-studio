"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ExternalLink, Send, X } from "lucide-react";
import styles from "./apply-project-button.module.css";

type ApplyProjectButtonProps = {
  projectId: string;
  projectTitle: string;
  alreadyApplied?: boolean;
};

type ApplicationResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function ApplyProjectButton({
  projectId,
  projectTitle,
  alreadyApplied = false,
}: ApplyProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyApplied);
  const [message, setMessage] = useState("");

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || submitted) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          coverLetter,
          portfolioUrl,
        }),
      });

      const result = (await response.json()) as ApplicationResult;

      if (!response.ok) {
        throw new Error(
          result.error || "Could not submit your application."
        );
      }

      setSubmitted(true);
      setMessage(
        result.message || "Your application has been submitted."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && !open) {
    return (
      <button
        type="button"
        className={styles.submittedButton}
        disabled
      >
        <CheckCircle2 size={17} />
        Applied
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.applyButton}
        onClick={() => setOpen(true)}
      >
        <Send size={17} />
        Apply
      </button>

      {open ? (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setOpen(false);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
          >
            <header className={styles.header}>
              <div>
                <span>Project application</span>
                <h2 id="application-modal-title">
                  Apply for {projectTitle}
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close application form"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </header>

            {submitted ? (
              <div className={styles.success}>
                <div>
                  <CheckCircle2 size={30} />
                </div>

                <h3>Application submitted</h3>
                <p>{message}</p>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={submitApplication}
              >
                <label>
                  <span>Portfolio link</span>

                  <div className={styles.inputWrapper}>
                    <ExternalLink size={17} />

                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(event) =>
                        setPortfolioUrl(event.target.value)
                      }
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Why are you right for this project?
                  </span>

                  <textarea
                    value={coverLetter}
                    onChange={(event) =>
                      setCoverLetter(event.target.value)
                    }
                    maxLength={5000}
                    rows={7}
                    placeholder="Tell the studio team about your experience, approach and why this project suits you."
                  />

                  <small>
                    {coverLetter.length.toLocaleString()} / 5,000
                  </small>
                </label>

                {message ? (
                  <p className={styles.error}>{message}</p>
                ) : null}

                <footer className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    disabled={submitting}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    <Send size={17} />
                    {submitting
                      ? "Submitting..."
                      : "Submit application"}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}