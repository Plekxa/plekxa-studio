import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight, Headphones, Film, Heart, Sparkles, Moon, Sun, CloudRain } from "lucide-react";

const experienceCards = [
  { title: "A Bittersweet Memory", type: "Music Experience", description: "For love, loss and everything left unsaid.", cls: "card-one" },
  { title: "Late Night Reflections", type: "Music Experience", description: "For the thoughts that arrive when the world goes quiet.", cls: "card-two" },
  { title: "Dancing in the Rain", type: "Visual Music Experience", description: "A little joy for imperfect days.", cls: "card-three" },
  { title: "Stories & Moonlight", type: "Audio Series", description: "Slow stories for quiet evenings.", cls: "card-four" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">PLEKXA ORIGINALS</span>
            <h1>Find something that <span>meets you where you are.</span></h1>
            <p className="hero-text">
              Listen, watch and step into original experiences made for the moments,
              memories and feelings that shape your life.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/explore">Explore now <ArrowRight size={17}/></Link>
              <Link className="button button-secondary" href="/experiences"><Play size={16} fill="currentColor"/> Play featured experience</Link>
            </div>
            <div className="hero-proof">
              <span>Original music</span><span>Visual stories</span><span>Curated experiences</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="image-frame">
              <Image
                src="/plekxa-listener-home.png"
                alt="A listener enjoying a Plekxa original experience"
                fill priority className="hero-image"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
            <div className="now-playing">
              <div className="cover"><Moon size={23}/></div>
              <div><small>NOW PLAYING</small><strong>Butterflies</strong><span>A Bittersweet Memory</span></div>
              <button aria-label="Play"><Play size={17} fill="currentColor"/></button>
            </div>
          </div>
        </div>
      </section>

      <section className="value-strip">
        <div className="container value-grid">
          <article><Headphones/><div><strong>Listen deeply</strong><span>Complete experiences, not endless noise.</span></div></article>
          <article><Film/><div><strong>Watch differently</strong><span>Music, stories and visuals in one place.</span></div></article>
          <article><Sparkles/><div><strong>Discover originals</strong><span>Content you cannot find anywhere else.</span></div></article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">FEATURED NOW</span><h2>Choose an experience</h2></div>
            <Link href="/experiences">View all <ArrowRight size={16}/></Link>
          </div>
          <div className="experience-grid">
            {experienceCards.map((item) => (
              <Link href="/experiences" key={item.title} className={`experience-card ${item.cls}`}>
                <span className="type-label">{item.type}</span>
                <span className="play-badge"><Play size={17} fill="currentColor"/></span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section feeling-section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">START WITH HOW YOU FEEL</span><h2>What do you need right now?</h2></div>
          </div>
          <div className="feeling-grid">
            <Link href="/explore"><Heart/><span>Love</span></Link>
            <Link href="/explore"><CloudRain/><span>Heartbreak</span></Link>
            <Link href="/explore"><Moon/><span>Late night</span></Link>
            <Link href="/explore"><Sun/><span>Feel good</span></Link>
            <Link href="/explore"><Headphones/><span>Focus</span></Link>
            <Link href="/explore"><Sparkles/><span>Healing</span></Link>
          </div>
        </div>
      </section>

      <section className="section audience-section">
        <div className="container audience-card">
          <div>
            <span className="eyebrow">ONE PLACE. MANY WORLDS.</span>
            <h2>Your next favourite experience may not be a playlist.</h2>
            <p>
              Plekxa is a destination for original music, visual storytelling and
              emotionally designed listening experiences.
            </p>
          </div>
          <Link className="button" href="/explore">Enter Plekxa <ArrowRight size={17}/></Link>
        </div>
      </section>
    </>
  );
}
