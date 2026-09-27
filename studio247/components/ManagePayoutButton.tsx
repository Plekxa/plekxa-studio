"use client";

import { useState } from "react";

export function ManagePayoutsButton() {
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState("");

  async function openPayouts() {
    setOpening(true);
    setMessage("");

    const response = await fetch("/api/stripe/dashboard", {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok || !result.url) {
      setMessage(result.error || "Could not open payouts.");
      setOpening(false);
      return;
    }

    window.location.assign(result.url);
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPayouts}
        disabled={opening}
      >
        {opening ? "Opening Stripe..." : "Manage payouts"}
      </button>

      {message ? <p>{message}</p> : null}
    </div>
  );
}