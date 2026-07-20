import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <Image
              src="/images/plekxa-logo2.png"
              alt="Plekxa"
              width={395}
              height={65}
            />
          </div>

          <p>Original music and visual experiences for real life.</p>
        </div>

        <div>
          <h3>Discover</h3>
          <Link href="/explore">Explore</Link>
          <Link href="/experiences">Experiences</Link>
          <Link href="/watch">Watch</Link>
        </div>

        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div>
          <h3>Work with Plekxa</h3>
          <Link href="/creator-studio">Creator Studio</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Plekxa Group Limited.</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}