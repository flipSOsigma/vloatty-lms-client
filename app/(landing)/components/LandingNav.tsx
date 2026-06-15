"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="lp-nav__inner">
        {/* Logo */}
        <Link href="/" className="lp-logo" aria-label="Vloatty Home">
          <span className="lp-logo__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#f25c88" />
              <path d="M7 9L14 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 9L14 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </span>
          <span className="lp-logo__text">Vloatty</span>
        </Link>

        {/* Desktop Links */}
        <ul className="lp-nav__links" role="list">
          <li><a href="#features" className="lp-nav__link">Features</a></li>
          <li><a href="#pricing" className="lp-nav__link">Pricing</a></li>
          <li><a href="#testimonials" className="lp-nav__link">About</a></li>
        </ul>

        {/* Desktop CTA */}
        <div className="lp-nav__cta">
          <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--sm">
            Sign In
          </Link>
          <Link href="/register" className="lp-btn lp-btn--primary lp-btn--sm">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`lp-nav__hamburger${menuOpen ? " lp-nav__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle mobile menu"
          id="mobile-menu-button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="lp-nav__drawer" role="menu" aria-label="Mobile navigation">
          <ul role="list">
            <li><a href="#features" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">Features</a></li>
            <li><a href="#pricing" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">Pricing</a></li>
            <li><a href="#testimonials" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">About</a></li>
          </ul>
          <div className="lp-nav__drawer-cta">
            <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
            <Link href="/register" className="lp-btn lp-btn--primary lp-btn--full" onClick={() => setMenuOpen(false)}>
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
