import Link from "next/link";

export default function Page() {
  return (
    <section className="inner-hero">
      <div className="container inner-card">
        <span className="eyebrow">PLEKXA</span>
        <h1>Creator Studio</h1>
        <p>The professional side of Plekxa for creators, collaborators and commissioned projects.</p>
        <p className="portal-note">This area is separate from the listener product. It is accessed by creators and partners, not promoted as the main Plekxa experience.</p>
        <div className="hero-actions">
          <Link className="button" href="/explore">Explore Plekxa</Link>
          <Link className="button button-secondary" href="/">Back home</Link>
        </div>
      </div>
    </section>
  );
}
