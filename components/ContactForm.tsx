"use client";

import {
  FormEvent,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

export function ContactForm() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] =
    useState("General enquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setStatus("");

    const { error } = await supabase
      .from("support_requests")
      .insert({
        name,
        email,
        topic,
        message,
      });

    if (error) {
  console.error("Support request error:", error);

  setStatus(
    error.message ||
      "Your message could not be sent. Please email info@plekxa.com."
  );

  setSubmitting(false);
  return;
}
    setName("");
    setEmail("");
    setTopic("General enquiry");
    setMessage("");

    setStatus(
      "Thank you. Your message has been sent."
    );

    setSubmitting(false);
  }

  return (
    <form
      className="contact-support-form"
      onSubmit={handleSubmit}
    >
      <div className="contact-form-grid">
        <label>
          Full name

          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </label>

        <label>
          Email address

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </label>
      </div>

      <label>
        What can we help with?

        <select
          value={topic}
          onChange={(event) =>
            setTopic(event.target.value)
          }
        >
          <option>General enquiry</option>
          <option>Creator support</option>
          <option>Listener support</option>
          <option>Account support</option>
          <option>Technical issue</option>
          <option>Project application</option>
          <option>Business partnership</option>
          <option>Press and media</option>
          <option>Privacy request</option>
        </select>
      </label>

      <label>
        Message

        <textarea
  rows={8}
  value={message}
  onChange={(event) => setMessage(event.target.value)}
  placeholder="Tell us how we can help. Please provide at least 10 characters."
  minLength={10}
  maxLength={5000}
  required
/>

<small className="contact-character-count">
  {message.length} / 5000 characters
</small>
      </label>

      <button
        className="button"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Sending..."
          : "Send message"}
      </button>

      {status ? (
        <p className="contact-form-status">
          {status}
        </p>
      ) : null}
    </form>
  );
}