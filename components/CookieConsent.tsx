"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "plekxa-cookie-choice";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingChoice =
      window.localStorage.getItem(COOKIE_KEY);

    if (!existingChoice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(
    choice: "accepted" | "essential"
  ) {
    window.localStorage.setItem(
      COOKIE_KEY,
      choice
    );

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <section
      className="cookie-consent"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="cookie-consent-copy">
        <strong>Your privacy choices</strong>

        <p>
          Plekxa uses essential cookies for account security,
          authentication and core platform functions. Optional
          cookies may help us understand and improve the service.
        </p>

        <Link href="/cookies">
          Read the Cookie Policy
        </Link>
      </div>

      <div className="cookie-consent-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => saveChoice("essential")}
        >
          Essential only
        </button>

        <button
          className="button"
          type="button"
          onClick={() => saveChoice("accepted")}
        >
          Accept optional cookies
        </button>
      </div>
    </section>
  );
}