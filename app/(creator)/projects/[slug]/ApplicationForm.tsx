"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ApplicationFormProps = {
  projectId: string;
  defaultPortfolioUrl: string;
};

export function ApplicationForm({
  projectId,
  defaultPortfolioUrl,
}: ApplicationFormProps) {
  const router = useRouter();

  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] =
    useState(defaultPortfolioUrl);

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to submit application."
        );
      }

      setMessage("Application submitted successfully.");

      setCoverLetter("");

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="application-form"
      onSubmit={handleSubmit}
    >
      <label>
        Why are you right for this project?

        <textarea
          rows={8}
          required
          maxLength={5000}
          value={coverLetter}
          onChange={(e) =>
            setCoverLetter(e.target.value)
          }
          placeholder="Describe your experience, creative process and why you're a great fit."
        />
      </label>

      <label>
        Portfolio URL

        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) =>
            setPortfolioUrl(e.target.value)
          }
          placeholder="https://yourportfolio.com"
        />
      </label>

      <button
        className="button"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : "Submit application"}
      </button>

      {message && (
        <p className="application-message">
          {message}
        </p>
      )}
    </form>
  );
}