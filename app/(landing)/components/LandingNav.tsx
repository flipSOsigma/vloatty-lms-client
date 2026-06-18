"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLms } from "@/context/LmsContext";

export default function LandingNav() {
  const { currentUser } = useLms();
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
          <img 
            src="/vloatty - Logo Only.png" 
            alt="Vloatty Logo" 
            width={28} 
            height={28} 
            style={{ filter: "brightness(0)", objectFit: "contain", marginRight: "4px" }} 
          />
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
          {currentUser ? (
            <Link href="/dashboard" className="lp-btn lp-btn--ghost lp-btn--sm">
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">{currentUser.name}</span>
                  <span className="lp-btn__text-hover">{currentUser.name}</span>
                </span>
              </span>
            </Link>
          ) : (
            <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--sm">
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Sign In</span>
                  <span className="lp-btn__text-hover">Sign In</span>
                </span>
              </span>
            </Link>
          )}
          <Link href="/register" className="lp-btn lp-btn--primary lp-btn--sm">
            <span className="lp-btn__text-container">
              <span className="lp-btn__text-track">
                <span className="lp-btn__text-normal">Get Started Free</span>
                <span className="lp-btn__text-hover">Get Started Free</span>
              </span>
            </span>
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
            {currentUser ? (
              <Link href="/dashboard" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">{currentUser.name}</span>
                    <span className="lp-btn__text-hover">{currentUser.name}</span>
                  </span>
                </span>
              </Link>
            ) : (
              <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Sign In</span>
                    <span className="lp-btn__text-hover">Sign In</span>
                  </span>
                </span>
              </Link>
            )}
            <Link href="/register" className="lp-btn lp-btn--primary lp-btn--full" onClick={() => setMenuOpen(false)}>
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Get Started Free</span>
                  <span className="lp-btn__text-hover">Get Started Free</span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
