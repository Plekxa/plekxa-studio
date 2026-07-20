"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="marketing-header">
      <div className="container marketing-header-inner">
        <Link href="/" aria-label="Plekxa home" onClick={closeMenu}>
          <Image
            src="/images/plekxa-logo2.png"
            alt="Plekxa"
            width={397}
            height={65}
            className="marketing-header-logo"
            priority
          />
        </Link>

        <div className="marketing-header-actions">
          <Link href="/login">Sign in</Link>

          <Link className="button button-small" href="/browse">
            Start listening
          </Link>
        </div>

        <button
          className="marketing-menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen ? (
        <nav className="marketing-mobile-menu" aria-label="Mobile navigation">
          <div className="container marketing-mobile-menu-inner">
            <Link href="/login" onClick={closeMenu}>
              Sign in
            </Link>

            <Link className="button" href="/browse" onClick={closeMenu}>
              Start listening
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}