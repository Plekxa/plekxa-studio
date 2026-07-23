import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileAudio,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorLandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="creator-landing">
      <header className="creator-landing-header">
        <div className="creator-landing-container creator-landing-header-inner">
          <Link href="/" className="creator-landing-brand">
            <span className="creator-landing-logo">Plekxa</span>
            <span>Creator Studio</span>
          </Link>

          <nav className="creator-landing-nav" aria-label="Creator navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#earnings">Earnings</a>
          </nav>

          <div className="creator-landing-header-actions">
            <Link href="/login" className="creator-landing-signin">
              Sign in
            </Link>

            <Link href="/signup" className="creator-landing-button small">
              Join Plekxa
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </header>

      <section className="creator-landing-hero">
        <div className="creator-landing-container creator-landing-hero-grid">
          <div className="creator-landing-hero-copy">
            <div className="creator-landing-eyebrow">
              <Sparkles size={15} />
              Built for original creators
            </div>

            <h1>
              Create meaningful work.
              <span> Build a lasting career.</span>
            </h1>

            <p>
              Plekxa connects talented creators with original projects,
              collaborative opportunities and experiences that continue
              generating value after the work is released.
            </p>

            <div className="creator-landing-hero-actions">
              <Link href="/signup" className="creator-landing-button">
                Create your creator account
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="creator-landing-button creator-landing-button-secondary"
              >
                Open Creator Studio
              </Link>
            </div>

            <div className="creator-landing-trust">
              <span>
                <ShieldCheck size={17} />
                Transparent project terms
              </span>

              <span>
                <BadgeCheck size={17} />
                Verified contribution history
              </span>
            </div>
          </div>

          <div className="creator-landing-preview">
            <div className="creator-preview-topbar">
              <div>
                <span>Creator overview</span>
                <strong>Your work, value and progress</strong>
              </div>

              <div className="creator-preview-avatar">AI</div>
            </div>

            <div className="creator-preview-stats">
              <article>
                <span>Active projects</span>
                <strong>4</strong>
                <small>2 milestones due soon</small>
              </article>

              <article>
                <span>Pending earnings</span>
                <strong>£2,480</strong>
                <small>Across 6 contributions</small>
              </article>

              <article>
                <span>Creator rating</span>
                <strong>4.9</strong>
                <small>Based on completed work</small>
              </article>
            </div>

            <div className="creator-preview-project">
              <div className="creator-preview-project-heading">
                <div>
                  <span>Current project</span>
                  <strong>Midnight Stories: Lagos</strong>
                </div>

                <span className="creator-preview-status">In production</span>
              </div>

              <div className="creator-preview-progress">
                <span style={{ width: "72%" }} />
              </div>

              <div className="creator-preview-project-meta">
                <span>Music contribution</span>
                <span>72% complete</span>
              </div>
            </div>

            <div className="creator-preview-royalty">
              <CircleDollarSign size={22} />

              <div>
                <span>Royalty and PPR tracking</span>
                <strong>
                  See where your assets are used and how they perform.
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="creator-landing-section" id="how-it-works">
        <div className="creator-landing-container">
          <div className="creator-landing-section-heading">
            <span>One creative operating system</span>
            <h2>Everything creators need, in one professional workspace.</h2>
            <p>
              From discovering opportunities to submitting assets, monitoring
              projects and understanding earnings, Creator Studio keeps the
              entire journey connected.
            </p>
          </div>

          <div className="creator-feature-grid">
            <article className="creator-feature-card">
              <BriefcaseBusiness size={25} />
              <h3>Join Plekxa projects</h3>
              <p>
                Discover open briefs, apply for relevant roles and manage every
                application from one place.
              </p>
            </article>

            <article className="creator-feature-card">
              <Lightbulb size={25} />
              <h3>Pitch original ideas</h3>
              <p>
                Submit concepts for original music, stories and experiences,
                then track every review and decision.
              </p>
            </article>

            <article className="creator-feature-card">
              <FileAudio size={25} />
              <h3>Manage creative assets</h3>
              <p>
                Upload work, submit project deliverables and maintain a clear
                record of where every asset has been used.
              </p>
            </article>

            <article className="creator-feature-card">
              <CircleDollarSign size={25} />
              <h3>Track royalties and PPR</h3>
              <p>
                Follow earnings connected to your assets, experiences and
                completed contributions.
              </p>
            </article>

            <article className="creator-feature-card">
              <BarChart3 size={25} />
              <h3>Understand your performance</h3>
              <p>
                Monitor project activity, audience engagement, asset usage and
                creator performance over time.
              </p>
            </article>

            <article className="creator-feature-card">
              <Star size={25} />
              <h3>Build your reputation</h3>
              <p>
                Develop a verified profile with ratings, completed work,
                portfolio credits and contribution history.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="creator-landing-section creator-landing-opportunities"
        id="opportunities"
      >
        <div className="creator-landing-container creator-opportunity-grid">
          <div>
            <span className="creator-landing-section-label">
              Opportunities built around talent
            </span>

            <h2>
              Find the right project without getting lost in the wrong ones.
            </h2>

            <p>
              Plekxa brings briefs, applications, pitches, active work and
              project communication together so creators always know what is
              happening next.
            </p>

            <ul className="creator-landing-list">
              <li>
                <BadgeCheck size={19} />
                Project briefs with clear roles and requirements
              </li>
              <li>
                <BadgeCheck size={19} />
                Application and proposal tracking
              </li>
              <li>
                <BadgeCheck size={19} />
                Milestones, submissions and revision history
              </li>
              <li>
                <BadgeCheck size={19} />
                Verified credits when projects are completed
              </li>
            </ul>
          </div>

          <div className="creator-opportunity-stack">
            <article>
              <div className="creator-opportunity-icon">
                <FileAudio size={22} />
              </div>

              <div>
                <span>Original music</span>
                <h3>Composer for an immersive audio series</h3>
                <p>Remote · Contract · Applications open</p>
              </div>
            </article>

            <article>
              <div className="creator-opportunity-icon">
                <Users size={22} />
              </div>

              <div>
                <span>Visual storytelling</span>
                <h3>Illustrator for a new cultural experience</h3>
                <p>Collaborative project · Portfolio required</p>
              </div>
            </article>

            <article>
              <div className="creator-opportunity-icon">
                <Lightbulb size={22} />
              </div>

              <div>
                <span>Original concept</span>
                <h3>Pitch a new Plekxa experience</h3>
                <p>Open submission · Multiple disciplines</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="creator-landing-section creator-landing-earnings"
        id="earnings"
      >
        <div className="creator-landing-container creator-earnings-grid">
          <div className="creator-earnings-card">
            <span>Contribution value</span>
            <strong>More than a one-off payment.</strong>

            <div className="creator-earnings-lines">
              <div>
                <span>Project fees</span>
                <strong>Tracked</strong>
              </div>

              <div>
                <span>Royalty participation</span>
                <strong>Connected</strong>
              </div>

              <div>
                <span>PPR activity</span>
                <strong>Measured</strong>
              </div>

              <div>
                <span>Asset usage</span>
                <strong>Recorded</strong>
              </div>
            </div>
          </div>

          <div>
            <span className="creator-landing-section-label">
              Visibility into creative value
            </span>

            <h2>Understand how your work contributes after delivery.</h2>

            <p>
              Creator Studio is being designed to connect each submitted asset
              to the projects and experiences where it is used. That gives
              creators a clearer view of their credits, earnings, royalties and
              performance.
            </p>

            <p>
              As Plekxa grows, this history becomes a professional record of
              your contribution across the platform.
            </p>
          </div>
        </div>
      </section>

      <section className="creator-landing-final-cta">
        <div className="creator-landing-container creator-final-cta-inner">
          <div>
            <span>Bring your talent to Plekxa</span>
            <h2>Your next original project could start here.</h2>
          </div>

          <div className="creator-final-cta-actions">
            <Link href="/signup" className="creator-landing-button">
              Join as a creator
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="creator-landing-button creator-landing-button-secondary"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="creator-landing-footer">
        <div className="creator-landing-container creator-landing-footer-inner">
          <div>
            <strong>Plekxa Creator Studio</strong>
            <span>Original work. Connected opportunities. Lasting value.</span>
          </div>

          <div>
            <a href="https://plekxa.com/about">About Plekxa</a>
            <a href="https://plekxa.com/contact">Contact</a>
            <a href="https://plekxa.com/privacy">Privacy</a>
            <a href="https://plekxa.com/terms">Terms</a>
          </div>

          <span>© 2026 Plekxa Group Limited.</span>
        </div>
      </footer>
    </main>
  );
}