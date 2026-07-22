import Link from "next/link";
import {
  AudioLines,
  CircleDollarSign,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getCreatorExperiences } from "@/lib/creator-studio-data";
import styles from "../creator-pages.module.css";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function ExperiencesPage() {
  const experiences = await getCreatorExperiences();

  const liveExperiences = experiences.filter(
    (experience) => experience.status === "live"
  ).length;

  const totalPlays = experiences.reduce(
    (total, experience) => total + experience.totalPlays,
    0
  );

  const totalRevenue = experiences.reduce(
    (total, experience) => total + experience.revenueGenerated,
    0
  );

  const creatorEarnings = experiences.reduce(
    (total, experience) => total + experience.creatorEarnings,
    0
  );

  const currency = experiences[0]?.currency ?? "GBP";

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Published collaborations</span>
          <h1>My experiences</h1>
          <p>
            Track the interactive experiences you contributed to, their
            audience performance and your creator royalty earnings.
          </p>
        </div>

        <Link href="/pitch" className={styles.primaryButton}>
          <Sparkles size={17} />
          Pitch an idea
        </Link>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Radio size={20} />
          </div>
          <span className={styles.statLabel}>Live experiences</span>
          <strong className={styles.statValue}>{liveExperiences}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AudioLines size={20} />
          </div>
          <span className={styles.statLabel}>Total plays</span>
          <strong className={styles.statValue}>
            {formatNumber(totalPlays)}
          </strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <span className={styles.statLabel}>Revenue generated</span>
          <strong className={styles.statValue}>
            {formatCurrency(totalRevenue, currency)}
          </strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <CircleDollarSign size={20} />
          </div>
          <span className={styles.statLabel}>Your earnings</span>
          <strong className={styles.statValue}>
            {formatCurrency(creatorEarnings, currency)}
          </strong>
        </article>
      </section>

      {experiences.length === 0 ? (
        <section className={styles.panel}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Sparkles size={28} />
            </div>

            <h2>No published experiences yet</h2>
            <p>
              When a project you contributed to becomes a live Plekxa
              experience, its performance and royalty information will
              appear here.
            </p>

            <Link href="/pitch" className={styles.primaryButton}>
              Pitch your first experience
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.experienceGrid}>
          {experiences.map((experience) => (
            <article
              key={experience.id}
              className={styles.experienceCard}
            >
              <div className={styles.experienceCover}>
                {experience.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={experience.coverUrl} alt="" />
                ) : (
                  <Sparkles
                    size={44}
                    className={styles.coverFallback}
                  />
                )}

                <span
                  className={`${styles.status} ${
                    experience.status === "live"
                      ? styles.statusLive
                      : experience.status === "upcoming"
                        ? styles.statusUpcoming
                        : styles.statusEnded
                  } ${styles.experienceStatus}`}
                >
                  {experience.status}
                </span>
              </div>

              <div className={styles.experienceBody}>
                <h2>{experience.title}</h2>
                <p className={styles.experienceMeta}>
                  {experience.brandName} · {experience.role}
                </p>

                <div className={styles.experienceMetrics}>
                  <div className={styles.metric}>
                    <span>Royalty</span>
                    <strong>
                      {experience.royaltyPercentage.toFixed(2)}%
                    </strong>
                  </div>

                  <div className={styles.metric}>
                    <span>Total plays</span>
                    <strong>
                      {formatNumber(experience.totalPlays)}
                    </strong>
                  </div>

                  <div className={styles.metric}>
                    <span>Revenue</span>
                    <strong>
                      {formatCurrency(
                        experience.revenueGenerated,
                        experience.currency
                      )}
                    </strong>
                  </div>

                  <div className={styles.metric}>
                    <span>Your earnings</span>
                    <strong>
                      {formatCurrency(
                        experience.creatorEarnings,
                        experience.currency
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}