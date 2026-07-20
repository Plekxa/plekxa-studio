import Link from "next/link";
import {
  AudioLines,
  Clapperboard,
  Globe2,
  Handshake,
  Layers3,
  Sparkles,
  UsersRound,
} from "lucide-react";

const values = [
  {
    icon: Sparkles,
    title: "Original by design",
    description:
      "Plekxa develops distinct music, visual and narrative experiences rather than simply repackaging existing content.",
  },
  {
    icon: UsersRound,
    title: "Creators at the centre",
    description:
      "We give creators structured ways to pitch ideas, join productions, develop their work and build long-term creative relationships.",
  },
  {
    icon: Layers3,
    title: "Built as experiences",
    description:
      "Music, stories, visuals and technology are brought together around a feeling, moment, purpose or cultural idea.",
  },
  {
    icon: Handshake,
    title: "Collaborative production",
    description:
      "Artists, producers, filmmakers, writers, researchers and creative teams can contribute their specialist strengths to shared projects.",
  },
];

const ecosystem = [
  {
    icon: AudioLines,
    title: "Music",
    text: "Original recordings, listening projects and emotionally designed audio experiences.",
  },
  {
    icon: Clapperboard,
    title: "Stories and visual media",
    text: "Films, conversations, documentaries and visual storytelling created around meaningful ideas.",
  },
  {
    icon: Globe2,
    title: "Culture and community",
    text: "Projects that explore identity, memory, place, wellbeing and the experiences that shape everyday life.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div>
            <span className="eyebrow">ABOUT PLEKXA</span>

            <h1>
              We create original entertainment that people do not just
              consume—they experience.
            </h1>

            <p>
              Plekxa is an experience-led music, media and creative platform.
              We bring together creators, original ideas and production
              opportunities to develop music, stories and cultural projects
              designed around real moments, emotions and communities.
            </p>

            <div className="about-hero-actions">
              <Link className="button" href="/browse">
                Start listening
              </Link>

              <Link
                className="button button-secondary"
                href="/signup"
              >
                Join as a creator
              </Link>
            </div>
          </div>

          <div className="about-hero-card">
            <span>OUR PURPOSE</span>

            <h2>
              To make original creative work more meaningful for audiences and
              more valuable for the people who create it.
            </h2>

            <p>
              Plekxa is building the infrastructure through which ideas can be
              proposed, teams can be formed, projects can be produced and
              completed experiences can reach audiences.
            </p>
          </div>
        </div>
      </section>

      <section className="about-statement">
        <div className="container about-statement-grid">
          <span className="eyebrow">WHY WE EXIST</span>

          <div>
            <h2>
              Streaming made content easier to access. We want to make it more
              meaningful to experience.
            </h2>

            <p>
              Audiences are surrounded by endless content, while many creators
              struggle to find structured opportunities to develop ambitious
              original work. Plekxa connects those two challenges.
            </p>

            <p>
              We commission and develop projects that can be experienced as
              complete creative worlds—not only as individual songs, videos or
              episodes.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values-section">
        <div className="container">
          <div className="about-section-heading">
            <span className="eyebrow">OUR APPROACH</span>
            <h2>How Plekxa works differently.</h2>
          </div>

          <div className="about-values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <article className="about-value-card" key={title}>
                <span className="about-value-icon">
                  <Icon size={22} />
                </span>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-ecosystem-section">
        <div className="container">
          <div className="about-section-heading">
            <span className="eyebrow">THE PLEKXA ECOSYSTEM</span>
            <h2>One platform for ideas, creators and audiences.</h2>
            <p>
              Plekxa supports the full journey from an early concept to a
              completed experience.
            </p>
          </div>

          <div className="about-ecosystem-grid">
            {ecosystem.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={27} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-creator-section">
        <div className="container about-creator-grid">
          <div>
            <span className="eyebrow">FOR CREATORS</span>
            <h2>A place to pitch, collaborate and build.</h2>

            <p>
              Creators can propose their own projects or apply to join Plekxa
              productions across music, film, podcasts, documentary and visual
              storytelling.
            </p>

            <p>
              Creator Studio provides one place to maintain a professional
              profile, submit proposals, track applications and manage active
              project milestones.
            </p>
          </div>

          <div className="about-creator-actions">
            <Link className="button" href="/creator-studio/projects">
              View opportunities
            </Link>

            <Link
              className="button button-secondary"
              href="/creator-studio/pitch"
            >
              Pitch a project
            </Link>
          </div>
        </div>
      </section>

      <section className="about-vision-section">
        <div className="container about-vision-card">
          <span className="eyebrow">OUR VISION</span>

          <h2>
            To become a trusted home for original experiences and the creators
            who bring them to life.
          </h2>

          <p>
            We are building Plekxa as a long-term creative ecosystem—one that
            supports discovery, collaboration, production, ownership and the
            continued development of original work.
          </p>
        </div>
      </section>

      <section className="about-final-cta">
        <div className="container about-final-cta-inner">
          <div>
            <span className="eyebrow">DISCOVER PLEKXA</span>
            <h2>Experience something original.</h2>
          </div>

          <div>
            <Link className="button" href="/browse">
              Start listening
            </Link>

            <Link
              className="button button-secondary"
              href="/contact"
            >
              Contact Plekxa
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}