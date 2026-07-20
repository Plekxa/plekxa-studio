"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ApplicationFormProps = {
  projectId: string;
  creatorId: string;
  defaultPortfolioUrl: string;
  defaultAvailability: string;
};

export function ApplicationForm({
  projectId,
  creatorId,
  defaultPortfolioUrl,
  defaultAvailability,
}: ApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [statement, setStatement] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(defaultPortfolioUrl);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("applications").insert({
      project_id: projectId,
      creator_id: creatorId,
      statement,
      portfolio_url: portfolioUrl || null,
      availability: availability || null,
      status: "submitted",
    });

    if (error) {
      if (error.code === "23505") {
        setMessage("You have already applied to this project.");
      } else {
        setMessage(error.message);
      }

      setSubmitting(false);
      return;
    }

    setMessage("Application submitted successfully.");
    setStatement("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <label>
        Why are you right for this project?
        <textarea
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          rows={7}
          placeholder="Describe your experience, creative approach and what you would contribute."
          required
        />
      </label>

      <label>
        Portfolio URL
        <input
          type="url"
          value={portfolioUrl}
          onChange={(event) => setPortfolioUrl(event.target.value)}
          placeholder="https://..."
        />
      </label>

      <label>
        Availability
        <input
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          placeholder="Tell us when you are available."
        />
      </label>

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit application"}
      </button>

      {message ? <p className="application-message">{message}</p> : null}
    </form>
  );
}