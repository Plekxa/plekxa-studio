import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="contact-page">
      <div className="container contact-page-grid">
        <section className="contact-intro">
          <span className="eyebrow">
            CONTACT PLEKXA
          </span>

          <h1>How can we help?</h1>

          <p>
            Contact the Plekxa team about creator
            opportunities, account support, technical
            issues, partnerships, privacy or general
            enquiries.
          </p>

          <div className="contact-email-card">
            <span>Email us directly</span>

            <a href="mailto:info@plekxa.com">
              info@plekxa.com
            </a>

            <p>
              We aim to respond as soon as reasonably
              possible.
            </p>
          </div>
        </section>

        <section className="contact-form-panel">
          <span className="eyebrow">
            SUPPORT REQUEST
          </span>

          <h2>Send us a message.</h2>

          <ContactForm />
        </section>
      </div>
    </main>
  );
}