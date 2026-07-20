import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="container marketing-footer-grid">
        <div className="marketing-footer-intro">
          <Image
            src="/images/plekxa-logo2.png"
            alt="Plekxa"
            width={397}
            height={65}
            className="marketing-footer-logo"
          />

          <p>
            Original music, visual stories and creator-led experiences made
            for real moments.
          </p>
        </div>

        <div>
          <h3>Discover</h3>
          <Link href="/browse">Start listening</Link>
          <Link href="/explore">Explore experiences</Link>
          <Link href="/search">Search Plekxa</Link>
        </div>

        <div>
          <h3>Creators</h3>
          <Link href="/signup">Join as a creator</Link>
          <Link href="/login">Creator sign in</Link>
          <Link href="/creator-studio/projects">Open opportunities</Link>
          <Link href="/creator-studio/dashboard">Creator Studio</Link>
        </div>

        <div>
          <h3>Company and support</h3>
          <Link href="/about">About Plekxa</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
      </div>

      <div className="container marketing-footer-bottom">
        <span>
          © 2026 Plekxa Group Limited. All rights reserved.
        </span>

        <a href="mailto:info@plekxa.com">
          info@plekxa.com
        </a>
      </div>
    </footer>
  );
}