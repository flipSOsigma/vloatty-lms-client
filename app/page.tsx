"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  ShieldAlert,
  FolderOpen,
  Calendar,
  Layers,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { animate, stagger, createTimeline } from "animejs";
import styles from "./landing.module.css";

function RollingNumber({ value }: { value: string }) {
  const digits = value.split("");
  return (
    <span className="inline-flex select-none">
      {digits.map((d, i) => {
        const digitVal = parseInt(d);
        const isDigit = !isNaN(digitVal);

        if (!isDigit) {
          return <span key={i} className="inline-block px-[0.1em]">{d}</span>;
        }

        return (
          <span
            key={i}
            className="inline-block relative h-[1em] w-[0.62em] overflow-hidden"
            style={{ lineHeight: "1" }}
          >
            <span
              className="absolute left-0 top-0 flex flex-col rolling-digit-track"
              data-digit={digitVal}
              style={{ transform: "translateY(0%)", display: "flex", flexDirection: "column" }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="h-[1em] flex items-center justify-center" style={{ height: "1em", lineHeight: "1" }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function TypingTitle({ baseText, accentText, className, style }: { baseText: string; accentText: string; className?: string; style?: React.CSSProperties }) {
  const [typedBase, setTypedBase] = useState("");
  const [typedAccent, setTypedAccent] = useState("");
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Reset
          setTypedBase("");
          setTypedAccent("");

          const animObj = { baseLen: 0, accentLen: 0 };
          const tl = createTimeline();

          tl.add(animObj, {
            baseLen: baseText.length,
            duration: baseText.length * 25, // 25ms per char
            ease: "linear",
            onUpdate: () => {
              setTypedBase(baseText.slice(0, Math.floor(animObj.baseLen)));
            }
          })
            .add(animObj, {
              accentLen: accentText.length,
              duration: accentText.length * 25,
              ease: "linear",
              onUpdate: () => {
                setTypedAccent(accentText.slice(0, Math.floor(animObj.accentLen)));
              }
            });
        } else {
          // Reset state when scrolled out so it types again when scrolled back
          setTypedBase("");
          setTypedAccent("");
        }
      });
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [baseText, accentText]);

  return (
    <h2 ref={containerRef} className={className} style={style}>
      {typedBase}
      <span className={styles.titleAccent}>{typedAccent}</span>
      <span className={styles.cursor}>|</span>
    </h2>
  );
}

function GeminiLogo({ idPrefix, className }: { idPrefix: string; className?: string }) {
  return (
    <svg viewBox="0 0 296 298" fill="none" className={className}>
      <mask id={`${idPrefix}__gemini__a`} width="296" height="298" x="0" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
        <path fill="#3186FF" d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"/>
      </mask>
      <g mask={`url(#${idPrefix}__gemini__a)`}>
        <g filter={`url(#${idPrefix}__gemini__b)`}><ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159"/></g>
        <g filter={`url(#${idPrefix}__gemini__c)`}><ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5"/></g>
        <g filter={`url(#${idPrefix}__gemini__d)`}><ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5"/></g>
        <g filter={`url(#${idPrefix}__gemini__e)`}><path fill="#FA4340" d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"/></g>
        <g filter={`url(#${idPrefix}__gemini__f)`}><path fill="#FA4340" d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"/></g>
        <g filter={`url(#${idPrefix}__gemini__g)`}><path fill="#14BB69" d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"/></g>
        <g filter={`url(#${idPrefix}__gemini__h)`}><path fill="#14BB69" d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"/></g>
      </g>
      <defs>
        <filter id={`${idPrefix}__gemini__b`} width="464" height="390" x="-69" y="-46" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="18"/>
        </filter>
        <filter id={`${idPrefix}__gemini__c`} width="265" height="273" x="-99" y="6" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
        <filter id={`${idPrefix}__gemini__d`} width="265" height="273" x="-113" y="12" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
        <filter id={`${idPrefix}__gemini__e`} width="299.5" height="329" x="-41.5" y="-130" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
        <filter id={`${idPrefix}__gemini__f`} width="299.5" height="329" x="-45" y="-153" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
        <filter id={`${idPrefix}__gemini__g`} width="299.5" height="329" x="-41" y="91" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
        <filter id={`${idPrefix}__gemini__h`} width="299.5" height="329" x="-39" y="132" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/>
        </filter>
      </defs>
    </svg>
  );
}

function AntigravityLogo({ idPrefix, className }: { idPrefix: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 15" fill="none" className={className}>
      <mask id={`${idPrefix}__antigravity__mask0_111_52`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="15">
        <path d="M14.0777 13.984C14.945 14.6345 16.2458 14.2008 15.0533 13.0084C11.476 9.53949 12.2349 0 7.79033 0C3.34579 0 4.10461 9.53949 0.527295 13.0084C-0.773543 14.3092 0.635692 14.6345 1.50293 13.984C4.86344 11.7076 4.64663 7.69664 7.79033 7.69664C10.934 7.69664 10.7172 11.7076 14.0777 13.984Z" fill="black"/>
      </mask>
      <g mask={`url(#${idPrefix}__antigravity__mask0_111_52)`}>
        <g filter={`url(#${idPrefix}__antigravity__filter0_f_111_52)`}><path d="M-0.658907 -3.2306C-0.922679 -0.906781 1.07986 1.22861 3.81388 1.53894C6.54791 1.84927 8.97811 0.217009 9.24188 -2.10681C9.50565 -4.43063 7.50312 -6.56602 4.76909 -6.87635C2.03506 -7.18667 -0.395135 -5.55442 -0.658907 -3.2306Z" fill="#FFE432"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter1_f_111_52)`}><path d="M9.88233 4.36642C10.5673 7.31568 13.566 9.13902 16.5801 8.43896C19.5942 7.73891 21.4823 4.78056 20.7973 1.83131C20.1123 -1.11795 17.1136 -2.94128 14.0995 -2.24123C11.0854 -1.54118 9.19733 1.41717 9.88233 4.36642Z" fill="#FC413D"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter2_f_111_52)`}><path d="M-8.05291 6.34512C-7.18736 9.38883 -3.28925 10.9473 0.653774 9.82598C4.5968 8.7047 7.09158 5.32829 6.22603 2.28458C5.36048 -0.759142 1.46236 -2.31758 -2.48066 -1.19629C-6.42368 -0.0750048 -8.91846 3.3014 -8.05291 6.34512Z" fill="#00B95C"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter3_f_111_52)`}><path d="M-8.05291 6.34512C-7.18736 9.38883 -3.28925 10.9473 0.653774 9.82598C4.5968 8.7047 7.09158 5.32829 6.22603 2.28458C5.36048 -0.759142 1.46236 -2.31758 -2.48066 -1.19629C-6.42368 -0.0750048 -8.91846 3.3014 -8.05291 6.34512Z" fill="#00B95C"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter4_f_111_52)`}><path d="M-4.92402 8.86746C-2.75421 11.0837 0.982691 10.9438 3.42257 8.55507C5.86246 6.1663 6.08139 2.43321 3.91158 0.216963C1.74177 -1.99928 -1.99513 -1.85942 -4.43501 0.529349C-6.87489 2.91812 -7.09383 6.65122 -4.92402 8.86746Z" fill="#00B95C"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter5_f_111_52)`}><path d="M6.42819 17.2263C7.10197 20.1273 9.91278 21.953 12.7063 21.3042C15.4998 20.6553 17.2182 17.7777 16.5444 14.8767C15.8707 11.9757 13.0599 10.15 10.2663 10.7988C7.47281 11.4477 5.75441 14.3253 6.42819 17.2263Z" fill="#3186FF"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter6_f_111_52)`}><path d="M1.66508 -5.94539C0.254213 -2.80254 1.7978 0.951609 5.11277 2.43973C8.42774 3.92785 12.2588 2.58642 13.6696 -0.556431C15.0805 -3.69928 13.5369 -7.45343 10.222 -8.94155C6.90699 -10.4297 3.07594 -9.08824 1.66508 -5.94539Z" fill="#FBBC04"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter7_f_111_52)`}><path d="M-2.11428 24.3903C-5.52984 23.0496 0.307266 12.0177 1.75874 8.32038C3.21024 4.62304 7.15576 2.71272 10.5713 4.05357C13.9869 5.39442 18.0354 12.7796 16.5838 16.477C15.1323 20.1743 1.30129 25.7311 -2.11428 24.3903Z" fill="#3186FF"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter8_f_111_52)`}><path d="M18.5814 10.6598C17.6669 11.727 15.2806 11.1828 13.2514 9.44417C11.2222 7.70556 10.3185 5.43097 11.2329 4.3637C12.1473 3.29646 14.5336 3.84069 16.5628 5.57928C18.592 7.31789 19.4958 9.59249 18.5814 10.6598Z" fill="#749BFF"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter9_f_111_52)`}><path d="M11.7552 5.22715C15.5162 7.77124 19.8471 7.93838 21.4286 5.60045C23.0101 3.26253 21.2433 -0.695128 17.4823 -3.23922C13.7213 -5.78331 9.39044 -5.95044 7.80896 -3.61252C6.22747 -1.27459 7.99428 2.68306 11.7552 5.22715Z" fill="#FC413D"/></g>
        <g filter={`url(#${idPrefix}__antigravity__filter10_f_111_52)`}><path d="M-0.592149 1.08896C-1.5239 3.33663 -1.21959 5.59799 0.0875457 6.13985C1.39468 6.68171 3.20966 5.29888 4.14141 3.05121C5.07316 0.803541 4.76885 -1.45782 3.46171 -1.99968C2.15458 -2.54154 0.339602 -1.15871 -0.592149 1.08896Z" fill="#FFEE48"/></g>
      </g>
      <defs>
        <filter id={`${idPrefix}__antigravity__filter0_f_111_52`} x="-2.12817" y="-8.35998" width="12.8393" height="11.383" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="0.722959" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter1_f_111_52`} x="2.75168" y="-9.38089" width="25.1763" height="24.96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="3.49513" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter2_f_111_52`} x="-14.1669" y="-7.50196" width="26.5068" height="23.6338" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.97119" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter3_f_111_52`} x="-14.1669" y="-7.50196" width="26.5068" height="23.6338" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.97119" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter4_f_111_52`} x="-12.3607" y="-7.29981" width="23.709" height="23.6846" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.97119" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter5_f_111_52`} x="0.634962" y="5.02095" width="21.7027" height="22.0616" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.82351" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter6_f_111_52`} x="-3.97547" y="-14.6666" width="23.2857" height="22.8313" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.5589" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter7_f_111_52`} x="-7.7407" y="-0.945408" width="29.1982" height="30.1105" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.2852" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter8_f_111_52`} x="6.78641" y="-0.27231" width="16.2415" height="15.5681" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.04485" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter9_f_111_52`} x="3.77526" y="-8.71693" width="21.687" height="19.4212" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="1.72712" result="effect1_foregroundBlur_111_52"/>
        </filter>
        <filter id={`${idPrefix}__antigravity__filter10_f_111_52`} x="-5.40727" y="-6.39238" width="14.3639" height="16.9254" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="2.1376" result="effect1_foregroundBlur_111_52"/>
        </filter>
      </defs>
    </svg>
  );
}

function LandingNav() {
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
        <a href="#" className="lp-logo" aria-label="Vloatty Home">
          <img
            src="/vloatty - Logo Only.png"
            alt="Vloatty Logo"
            width={28}
            height={28}
            style={{ filter: "brightness(0)", objectFit: "contain", marginRight: "4px" }}
          />
          <span className="lp-logo__text">Vloatty</span>
        </a>

        {/* Desktop Links */}
        <ul className="lp-nav__links" role="list">
          <li><a href="#features" className="lp-nav__link">Features</a></li>
          <li><a href="#pricing" className="lp-nav__link">Pricing</a></li>
          <li><a href="#testimonials" className="lp-nav__link">About</a></li>
        </ul>

        {/* Desktop CTA */}
        <div className="lp-nav__cta">
          <a href="#" className="lp-btn lp-btn--ghost lp-btn--sm">
            <span className="lp-btn__text-container">
              <span className="lp-btn__text-track">
                <span className="lp-btn__text-normal">Sign In</span>
                <span className="lp-btn__text-hover">Sign In</span>
              </span>
            </span>
          </a>
          <a href="#" className="lp-btn lp-btn--primary lp-btn--sm">
            <span className="lp-btn__text-container">
              <span className="lp-btn__text-track">
                <span className="lp-btn__text-normal">Get Started Free</span>
                <span className="lp-btn__text-hover">Get Started Free</span>
              </span>
            </span>
          </a>
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
            <a href="#" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Sign In</span>
                  <span className="lp-btn__text-hover">Sign In</span>
                </span>
              </span>
            </a>
            <a href="#" className="lp-btn lp-btn--primary lp-btn--full" onClick={() => setMenuOpen(false)}>
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Get Started Free</span>
                  <span className="lp-btn__text-hover">Get Started Free</span>
                </span>
              </span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function EmailCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="lp-cta-form">
      {submitted ? (
        <div className="lp-cta-success" role="alert" aria-live="polite">
          <span className="lp-cta-success__icon" aria-hidden="true">🎉</span>
          <p>You&apos;re on the list! We&apos;ll be in touch soon.</p>
        </div>
      ) : (
        <form
          className="lp-cta-form__inner"
          onSubmit={handleSubmit}
          aria-label="Email signup form"
        >
          <input
            id="cta-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email"
            required
            className="lp-cta-form__input"
            aria-label="Work email address"
          />
          <button
            id="cta-submit-button"
            type="submit"
            className="lp-btn lp-btn--primary lp-btn--lg"
          >
            <span className="lp-btn__text-container">
              <span className="lp-btn__text-track">
                <span className="lp-btn__text-normal">Get Started Free</span>
                <span className="lp-btn__text-hover">Get Started Free</span>
              </span>
            </span>
          </button>
        </form>
      )}
      <p className="lp-cta-form__note">
        No credit card required &bull; Free forever plan available
      </p>
    </div>
  );
}

export default function RootPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can I use Vloatty for free?",
      a: "Yes, our basic plan is free forever. It supports up to 3 subjects, 1 institution membership, and basic file storage—perfect for individual lecturers and small student groups."
    },
    {
      q: "How does the institution management system work?",
      a: "Vloatty allows you to create or join multiple institutions. As an Owner, you can invite lecturers and staff via secure codes, and define their roles and class link permissions."
    },
    {
      q: "Can we upload and share academic syllabus materials?",
      a: "Absolutely. Vloatty features a secure file organization repository. Instructors can upload policy templates, syllabus sheets, and links directly into learning modules for students."
    },
    {
      q: "Is there a limit on student enrollments?",
      a: "No, there are no caps on student enrollments. Whether you are teaching a seminar of 10 students or a lecture hall of 500, Vloatty manages schedules and rosters effortlessly."
    },
    {
      q: "How secure is the platform and user data?",
      a: "Security is our top priority. We use industry-standard HTTPS encryption, secure database instances, and robust role-based access tokens to ensure academic files and transcripts are safe."
    }
  ];

  useEffect(() => {
    // 0. Force scrollability on HTML/Body when landing page is active
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    const originalHtmlOverflow = htmlEl.style.overflow;
    const originalHtmlHeight = htmlEl.style.height;
    const originalBodyOverflow = bodyEl.style.overflow;
    const originalBodyHeight = bodyEl.style.height;

    htmlEl.style.overflow = "auto";
    htmlEl.style.height = "auto";
    bodyEl.style.overflow = "auto";
    bodyEl.style.height = "auto";

    // 1. Initial Page Entrance Animations (Hero)
    animate(".hero-animate", {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(120),
      duration: 1200,
      easing: "easeOutExpo",
    });

    // 2. Scroll Reveal Animations (Intersection Observer + anime.js)
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;

          animate(target, {
            opacity: [0, 1],
            translateY: [35, 0],
            duration: 900,
            easing: "easeOutQuad",
          });

          // Animate rolling number tracks inside this element if any exist
          const tracks = target.querySelectorAll(".rolling-digit-track");
          if (tracks.length > 0) {
            tracks.forEach((track) => {
              const digit = parseInt(track.getAttribute("data-digit") || "0");
              animate(track, {
                translateY: ["0%", `-${digit * 10}%`],
                duration: 1800 + Math.random() * 600,
                easing: "easeOutQuart",
              });
            });
          }

          observer.unobserve(target); // Animate once
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".scroll-animate");
    animatedElements.forEach((el) => {
      // Set initial styles in JS to avoid layout shift before hydration
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(35px)";
      observer.observe(el);
    });

    // 3. Smooth Anchor Scroll Animations
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;

          const scrollObj = { y: window.scrollY };
          animate(scrollObj, {
            y: targetPosition - 80, // Offset to account for sticky navbar height
            duration: 1000,
            easing: "easeOutQuint",
            onUpdate: () => {
              window.scrollTo(0, scrollObj.y);
            }
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleAnchorClick);

      // Restore original styles
      htmlEl.style.overflow = originalHtmlOverflow;
      htmlEl.style.height = originalHtmlHeight;
      bodyEl.style.overflow = originalBodyOverflow;
      bodyEl.style.height = originalBodyHeight;
    };
  }, []);

  useEffect(() => {
    // Animate price figure transitions on toggle
    animate(".price-amount", {
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 350,
      easing: "easeOutQuad",
    });
  }, [billingPeriod]);

  const features = [
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Institution Management",
      desc: "Manage your institution profile, invite members, and assign roles (Owner, Lecturer, Admission) from a unified console.",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Smart Class Management",
      desc: "Link subjects to institutions, schedule lectures, assign instructors, and easily coordinate student enrollments.",
    },
    {
      icon: <ShieldAlert className="w-5 h-5" />,
      title: "Role-Based Permissions",
      desc: "Granular access controls built directly into every screen. Give administrators, lecturers, and students exactly the access they need.",
    },
    {
      icon: <FolderOpen className="w-5 h-5" />,
      title: "File Organization",
      desc: "Upload, categorize, search, and bulk-delete institutional documents, academic syllabi, maps, and campus assets securely.",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Live Event Calendar",
      desc: "An interactive planner displaying automatically generated lecture schedules, assignable tasks, and exam deadlines.",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Student Modules & Lessons",
      desc: "Organize subjects into clean modular units with structured assignments, learning lessons, files, and deadlines.",
    },
  ];

  const testimonials = [
    {
      quote: "Vloatty completely revolutionized how we organize our class schedules. The permissions system works flawlessly.",
      author: "Dr. Sarah Jenkins",
      role: "Dean of Computer Science",
      initials: "SJ",
      color: "#facc15",
    },
    {
      quote: "The file organization section makes distributing syllabus templates and guidelines to lecturers effortless.",
      author: "Marcus Aurelius",
      role: "Academic Registrar",
      initials: "MA",
      color: "#121212",
    },
    {
      quote: "Students love the central event calendar and modules. We saw a 35% reduction in missed deadlines in the first semester.",
      author: "Prof. Alan Turing",
      role: "Department Coordinator",
      initials: "AT",
      color: "#facc15",
    },
  ];

  return (
    <div className={styles.lpWrapper}>
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroMesh} />
          <div className={styles.heroGrid} />
        </div>

        <div className={styles.heroContent}>
          <div className={`${styles.heroBadge} hero-animate`}>
            <span className={styles.heroBadgeDot} />
            <span className={styles.heroBadgeText}>Next-Gen LMS Platform</span>
          </div>

          <h1 className={`${styles.heroH1} hero-animate`}>
            The Modern <span>Learning Management System</span>
          </h1>

          <p className={`${styles.heroSub} hero-animate`}>
            Empower institutions, lecturers, and students with a unified platform for courses, schedules, and collaboration.
          </p>

          <div className={`${styles.heroCTAs} hero-animate`}>
            <a href="#" className="lp-btn lp-btn--primary lp-btn--lg">
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Get Started Free</span>
                  <span className="lp-btn__text-hover">Get Started Free</span>
                </span>
              </span>
              <ArrowRight className="lp-btn__icon w-4 h-4 ml-1" />
            </a>
            <a href="#features" className="lp-btn lp-btn--ghost lp-btn--lg">
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">See Features</span>
                  <span className="lp-btn__text-hover">See Features</span>
                </span>
              </span>
            </a>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statItem} scroll-animate`}>
            <div className={styles.statValue}>
              <RollingNumber value="3,000" /><span>+</span>
            </div>
            <div className={styles.statLabel}>Active Students</div>
          </div>
          <div className={`${styles.statItem} scroll-animate`}>
            <div className={styles.statValue}>
              <RollingNumber value="500" /><span>+</span>
            </div>
            <div className={styles.statLabel}>Institutions</div>
          </div>
          <div className={`${styles.statItem} scroll-animate`}>
            <div className={styles.statValue}>
              <RollingNumber value="98" /><span>%</span>
            </div>
            <div className={styles.statLabel}>Uptime SLA</div>
          </div>
          <div className={`${styles.statItem} scroll-animate`}>
            <div className={styles.statValue}>
              <RollingNumber value="50" /><span>+</span>
            </div>
            <div className={styles.statLabel}>Countries</div>
          </div>
        </div>
      </section>

      {/* Rolling Sponsorships */}
      <section className={styles.sponsorships}>
        <div className={styles.sponsorshipsInner}>
          {[1, 2, 3, 4].map((setIdx) => {
            const prefix = `track-${setIdx}`;
            return (
              <div key={setIdx} className={styles.sponsorshipsTrack}>
                <div className={styles.sponsorItem}>
                  <AntigravityLogo idPrefix={prefix} className={styles.sponsorLogo} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">Antigravity</span>
                    <span className="text-[10px] opacity-60 font-semibold tracking-wide leading-none">AI Pair Programmer</span>
                  </div>
                </div>
                <div className={styles.sponsorItem}>
                  <GeminiLogo idPrefix={prefix} className={styles.sponsorLogo} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">Gemini</span>
                    <span className="text-[10px] opacity-60 font-semibold tracking-wide leading-none">AI Model Provider</span>
                  </div>
                </div>
                <div className={styles.sponsorItem}>
                  <svg viewBox="0 0 256 222" preserveAspectRatio="xMidYMid" className={styles.sponsorLogo}>
                    <path fill="currentColor" d="m128 0 128 221.705H0z"/>
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">Vercel</span>
                    <span className="text-[10px] opacity-60 font-semibold tracking-wide leading-none">Hosting & Deployment</span>
                  </div>
                </div>
                <div className={styles.sponsorItem}>
                  <svg viewBox="0 0 256 310" preserveAspectRatio="xMidYMid" className={styles.sponsorLogo}>
                    <path fill="rgb(19, 184, 167)" d="M254.313 235.519L148 9.749A17.063 17.063 0 00133.473.037a16.87 16.87 0 00-15.533 8.052L2.633 194.848a17.465 17.465 0 00.193 18.747L59.2 300.896a18.13 18.13 0 0020.363 7.489l163.599-48.392a17.929 17.929 0 0011.26-9.722 17.542 17.542 0 00-.101-14.76l-.008.008zm-23.802 9.683l-138.823 41.05c-4.235 1.26-8.3-2.411-7.419-6.685l49.598-237.484c.927-4.443 7.063-5.147 9.003-1.035l91.814 194.973a6.63 6.63 0 01-4.18 9.18h.007z"/>
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">PrismaDB</span>
                    <span className="text-[10px] opacity-60 font-semibold tracking-wide leading-none">Database ORM</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionLabel} scroll-animate`}>Features</div>
          <TypingTitle
            baseText="Everything you need to "
            accentText="run your institution"
            className={`${styles.sectionH2} scroll-animate`}
          />
          <p className={`${styles.sectionDesc} scroll-animate`}>
            Vloatty provides a comprehensive suite of tools designed specifically for modern academic and clinical learning environments.
          </p>

          <div className={styles.featuresGrid}>
            {/* 1. Left Card (Tall): Smart Class Management */}
            <div className={`${styles.bentoCard} ${styles.bentoCardTall} scroll-animate`}>
              <div className={styles.bentoCardGridBg} />
              <div>
                <div className={styles.featureCardIcon}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className={styles.featureCardTitle}>Smart Class Management</h3>
                <p className={styles.featureCardDesc} style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                  Link subjects to institutions, schedule lectures, assign instructors, and easily coordinate student enrollments in a single panel.
                </p>
              </div>
              <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Sync</span>
                <div className={styles.bentoToggle}>
                  <div className={styles.bentoToggleDot} />
                </div>
              </div>
            </div>

            {/* 2. Top Middle Card (Wide): Role-Based Permissions */}
            <div className={`${styles.bentoCard} ${styles.bentoCardWide} scroll-animate`}>
              <div style={{ maxWidth: "60%" }}>
                <h3 className={styles.featureCardTitle}>Role-Based Permissions</h3>
                <p className={styles.featureCardDesc} style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  Granular dashboard access controls for Owners, Lecturers, Admission teams, and Students.
                </p>
              </div>
              <div className={styles.bentoAvatars}>
                <div className={styles.bentoAvatar} style={{ background: "#facc15", zIndex: 4 }}>OW</div>
                <div className={styles.bentoAvatar} style={{ background: "#121212", zIndex: 3 }}>LE</div>
                <div className={styles.bentoAvatar} style={{ background: "#71717a", zIndex: 2 }}>AD</div>
                <div className={styles.bentoAvatar} style={{ background: "#ff8fab", zIndex: 1 }}>ST</div>
              </div>
            </div>

            {/* 3. Middle Middle Card (Square): Student Modules & Progress */}
            <div className={`${styles.bentoCard} ${styles.bentoCardSquare} scroll-animate`}>
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className={styles.featureCardTitle}>Course Modules</h3>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                    Learning Progress Analytics
                  </p>
                </div>
                <span className={styles.bentoBadge}>Completion Ratio</span>
              </div>

              <div className="flex items-baseline gap-2 my-2">
                <span className={styles.bentoBigValue}>78%</span>
                <span className="text-xs font-bold text-[#d97706]">▲ 12% this week</span>
              </div>

              <div className="flex justify-between text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pt-2 border-t border-zinc-50">
                <span>Maximum progress</span>
                <span>Active semester</span>
              </div>
            </div>

            {/* 4. Bottom Middle Card (Shortcut): Event Calendar Shortcuts */}
            <div className={`${styles.bentoCard} ${styles.bentoCardShortcut} scroll-animate`}>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#d97706]" />
                <div>
                  <h3 className={styles.featureCardTitle} style={{ marginBottom: "2px" }}>Live Event Calendar</h3>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.8rem" }}>
                    Exam schedules & class task quick links
                  </p>
                </div>
              </div>
              <div className={styles.bentoKeys}>
                <span className={styles.bentoKey}>Ctrl</span>
                <span>+</span>
                <span className={styles.bentoKey}>Shift</span>
                <span>+</span>
                <span className={styles.bentoKey}>C</span>
              </div>
            </div>

            {/* 5. Right Card (Tall): Secure File Organization */}
            <div className={`${styles.bentoCard} ${styles.bentoCardTall} scroll-animate`}>
              <div className={styles.bentoCardDotBg} />
              <div className="flex justify-between items-start w-full">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cloud Storage</span>
                <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] flex items-center justify-center border border-zinc-200">
                  <FolderOpen className="w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div className="my-4">
                <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">Allocated Volume</div>
                <div className="text-5xl font-black text-[#121212] tracking-tight">10GB+</div>
                <div className="text-[11px] font-medium text-zinc-500 mt-2">Shared template folders.</div>
              </div>

              <div>
                <h3 className={styles.featureCardTitle}>File Hub & Policy Vault</h3>
                <p className={styles.featureCardDesc} style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                  Upload, organize, search, and bulk-delete academic templates, syllabus files, and assets securely.
                </p>
              </div>
            </div>
          </div>

          {/* AI Powerhouse Section */}
          <div className="scroll-animate" style={{ marginTop: "120px" }}>
            <div className={styles.sectionLabel}>AI Powerhouse</div>
            <TypingTitle
              baseText="Next-Gen AI capabilities for "
              accentText="smart learning"
              className={styles.sectionH2}
            />
            <p className={styles.sectionDesc}>
              Vloatty integrates state-of-the-art Gemini AI models directly into your daily academic tasks, making course planning and student evaluation faster than ever.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "40px" }}>
              {/* Card 1: AI Quiz Generator */}
              <div className={`${styles.bentoCard} scroll-animate`} style={{ minHeight: "220px", justifyContent: "space-between" }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={styles.featureCardIcon} style={{ marginBottom: 0 }}>
                      <Sparkles className="w-6 h-6 text-[#d97706]" />
                    </div>
                    <span className={styles.bentoBadge}>AI Assistant</span>
                  </div>
                  <h3 className={styles.featureCardTitle} style={{ fontSize: "1.20rem", fontWeight: 700 }}>Custom AI Quiz Generator</h3>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.85rem", marginTop: "8px", color: "#555555" }}>
                    Instantly compile quizzes from your course context. Choose the question count (up to 10), difficulty level (easy, medium, hard), and preferred language in one click.
                  </p>
                </div>
              </div>

              {/* Card 2: AI Autofill Descriptions */}
              <div className={`${styles.bentoCard} scroll-animate`} style={{ minHeight: "220px", justifyContent: "space-between" }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={styles.featureCardIcon} style={{ marginBottom: 0 }}>
                      <BookOpen className="w-6 h-6 text-[#d97706]" />
                    </div>
                    <span className={styles.bentoBadge}>Automated Outline</span>
                  </div>
                  <h3 className={styles.featureCardTitle} style={{ fontSize: "1.20rem", fontWeight: 700 }}>AI Syllabus & Module Planner</h3>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.85rem", marginTop: "8px", color: "#555555" }}>
                    Generate professional syllabus summaries and lesson outlines automatically using title context. Simply type your lecture title and let Gemini do the writing.
                  </p>
                </div>
              </div>

              {/* Card 3: Interactive Evaluations */}
              <div className={`${styles.bentoCard} scroll-animate`} style={{ minHeight: "220px", justifyContent: "space-between" }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={styles.featureCardIcon} style={{ marginBottom: 0 }}>
                      <Layers className="w-6 h-6 text-[#d97706]" />
                    </div>
                    <span className={styles.bentoBadge}>Student Analytics</span>
                  </div>
                  <h3 className={styles.featureCardTitle} style={{ fontSize: "1.20rem", fontWeight: 700 }}>Quiz Management Hub</h3>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.85rem", marginTop: "8px", color: "#555555" }}>
                    Rearrange questions dynamically with reordering controls, view questions with alternating striped styles, and manage detailed student submission leaderboards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core platform capabilities directory */}
          <div className="scroll-animate" style={{ marginTop: "120px" }}>
            <div className={styles.sectionLabel}>Full Directory</div>
            <TypingTitle
              baseText="A complete ecosystem for "
              accentText="academic workflows"
              className={styles.sectionH2}
            />
            <p className={styles.sectionDesc}>
              Explore all the features packed into Vloatty designed to simplify course management, file storage, and team communication.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "40px" }}>
              {features.map((f, idx) => (
                <div className={`${styles.bentoCard} scroll-animate`} key={idx} style={{ minHeight: "180px" }}>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={styles.featureCardIcon} style={{ marginBottom: 0, width: "42px", height: "42px", borderRadius: "12px" }}>
                      {f.icon}
                    </div>
                    <h3 className={styles.featureCardTitle} style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 0 }}>
                      {f.title}
                    </h3>
                  </div>
                  <p className={styles.featureCardDesc} style={{ fontSize: "0.82rem", color: "#555555", lineHeight: "1.5" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionLabel} scroll-animate`}>Pricing</div>
          <TypingTitle
            baseText="Simple, transparent "
            accentText="pricing"
            className={`${styles.sectionH2} scroll-animate`}
          />
          <p className={`${styles.sectionDesc} scroll-animate`} style={{ marginBottom: "32px" }}>
            Start free and scale as your institution grows. Cancel at any time.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12 scroll-animate">
            <span className={`text-[13px] font-bold ${billingPeriod === "monthly" ? "text-[#121212]" : "text-zinc-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="w-12 h-6 rounded-full p-1 relative flex items-center transition-colors focus:outline-none cursor-pointer"
              style={{ backgroundColor: billingPeriod === "yearly" ? "#facc15" : "#e4e4e7" }}
            >
              <div
                className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
                style={{ transform: billingPeriod === "yearly" ? "translateX(24px)" : "translateX(0)" }}
              />
            </button>
            <span className={`text-[13px] font-bold ${billingPeriod === "yearly" ? "text-[#121212]" : "text-zinc-400"}`}>
              Yearly <span className="text-[10px] text-[#d97706] bg-[#facc15]/10 px-1.5 py-0.5 rounded-full ml-1">Save 20%</span>
            </span>
          </div>

          <div className={styles.pricingGrid}>
            {/* Free */}
            <div className={`${styles.pricingCard} scroll-animate`}>
              <div className={styles.pricingHeader}>
                <span className={`${styles.planBadge} ${styles.planBadgeFree}`}>Basic</span>
                <h3 className={styles.pricingTier}>Free</h3>
              </div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>$</span>
                <span className={`${styles.pricingAmount} price-amount`}>0</span>
                <span className={styles.pricingPeriod}>/mo</span>
              </div>
              <p className={styles.pricingDesc}>Perfect for small classes and testing out the platform.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Up to 3 subjects
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> 1 institution link
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Basic file sharing
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Community support
                </li>
              </ul>
              <a href="#" className="lp-btn lp-btn--ghost lp-btn--full" style={{ marginTop: "auto" }}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Get Started</span>
                    <span className="lp-btn__text-hover">Get Started</span>
                  </span>
                </span>
              </a>
            </div>

            {/* Pro */}
            <div className={`${styles.pricingCard} ${styles.pricingCardHighlight} scroll-animate`}>
              <div className={styles.pricingBadge}>Most Popular</div>
              <div className={styles.pricingHeader}>
                <span className={`${styles.planBadge} ${styles.planBadgePro}`}>Popular</span>
                <h3 className={styles.pricingTier}>Professional</h3>
              </div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>$</span>
                <span className={`${styles.pricingAmount} price-amount`}>
                  {billingPeriod === "monthly" ? "12" : "9"}
                </span>
                <span className={styles.pricingPeriod}>/mo</span>
              </div>
              {billingPeriod === "yearly" ? (
                <div className="text-[11px] font-medium -mt-2 mb-4 text-zinc-400">Billed annually ($108)</div>
              ) : (
                <div className="text-[11px] font-medium -mt-2 mb-4 text-zinc-500">Billed monthly</div>
              )}
              <p className={styles.pricingDesc}>Empower departments with advanced scheduling and modules.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Unlimited subjects
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Up to 3 institutions
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> 10GB secure storage
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Priority email support
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Real-time search & filter
                </li>
              </ul>
              <a href="#" className="lp-btn lp-btn--primary lp-btn--full" style={{ marginTop: "auto" }}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Start 14-Day Free Trial</span>
                    <span className="lp-btn__text-hover">Start 14-Day Free Trial</span>
                  </span>
                </span>
              </a>
            </div>

            {/* Enterprise */}
            <div className={`${styles.pricingCard} scroll-animate`}>
              <div className={styles.pricingHeader}>
                <span className={`${styles.planBadge} ${styles.planBadgeEnt}`}>Scale</span>
                <h3 className={styles.pricingTier}>Enterprise</h3>
              </div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount} style={{ fontSize: "2.5rem" }}>Custom</span>
              </div>
              <p className={styles.pricingDesc}>Designed for large universities requiring dedicated infrastructure.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Unlimited institutions
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Unlimited storage
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> Custom domain & SSO
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> 24/7 dedicated support
                </li>
                <li className={styles.pricingFeature}>
                  <span className={styles.pricingFeatureCheck}><Check className="w-3.5 h-3.5" /></span> SLA & custom integration
                </li>
              </ul>
              <a href="mailto:sales@vloatty.com" className="lp-btn lp-btn--ghost lp-btn--full" style={{ marginTop: "auto" }}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Contact Sales</span>
                    <span className="lp-btn__text-hover">Contact Sales</span>
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionLabel} scroll-animate`}>Testimonials</div>
          <TypingTitle
            baseText="Loved by "
            accentText="educators & administrators"
            className={`${styles.sectionH2} scroll-animate`}
          />

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, idx) => (
              <div className={`${styles.testimonialCard} scroll-animate`} key={idx}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <blockquote className={styles.testimonialQuote}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className={styles.testimonialAuthor}>
                  <div
                    className={styles.testimonialAvatar}
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className={styles.testimonialName}>{t.author}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.faq}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionLabel} scroll-animate`}>Support</div>
          <TypingTitle
            baseText="Frequently Asked "
            accentText="Questions"
            className={`${styles.sectionH2} scroll-animate`}
          />
          <p className={`${styles.sectionDesc} scroll-animate`}>
            Got questions about Vloatty? Find quick answers about our LMS capabilities, billing, and system features below.
          </p>

          <div className={styles.faqGrid}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""} scroll-animate`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveFaq(isOpen ? null : idx); }}
                >
                  <div className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    <span className={styles.faqIcon} style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>+</span>
                  </div>
                  <div
                    className={styles.faqAnswer}
                    style={{
                      maxHeight: isOpen ? "200px" : "0px",
                      opacity: isOpen ? 1 : 0
                    }}
                  >
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaSectionInner}>
          <TypingTitle
            baseText="Ready to transform your "
            accentText="learning experience?"
            className={`${styles.sectionH2} scroll-animate`}
            style={{ color: "#fff", textAlign: "center", marginBottom: "16px" }}
          />
          <p className={`${styles.sectionDesc} scroll-animate`} style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            Join hundreds of institutions already using Vloatty to power their campus workflows and course planning.
          </p>
          <div className="scroll-animate">
            <EmailCTA />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrandCol}>
              <a href="#" className={styles.footerLogo}>
                <img
                  src="/vloatty - Logo Only.png"
                  alt="Vloatty Logo"
                  className={styles.footerLogoImg}
                />
                <span className={styles.footerLogoText}>Vloatty</span>
              </a>
              <p className={styles.footerTagline}>
                Unlock your learning and campus management potential with our unified LMS ecosystem.
              </p>
              <div className={styles.footerSocials}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
              </div>
            </div>

            <div className={styles.footerLinksGrid}>
              <div className={styles.footerLinksCol}>
                <h4>Platform</h4>
                <a href="#features" className={styles.footerLink}>Features</a>
                <a href="#pricing" className={styles.footerLink}>Pricing</a>
                <a href="#" className={styles.footerLink}>Sign In</a>
              </div>
              <div className={styles.footerLinksCol}>
                <h4>Company</h4>
                <a href="#testimonials" className={styles.footerLink}>About Us</a>
                <a href="mailto:support@vloatty.com" className={styles.footerLink}>Support</a>
                <a href="#" className={styles.footerLink}>Security</a>
              </div>
              <div className={styles.footerLinksCol}>
                <h4>Legal</h4>
                <a href="#" className={styles.footerLink}>Terms of Service</a>
                <a href="#" className={styles.footerLink}>Privacy Policy</a>
                <a href="#" className={styles.footerLink}>Status</a>
              </div>
            </div>
          </div>

          <div className={styles.footerBigBrand}>
            Vloatty
          </div>

          <p className={styles.footerCopy}>
            &copy; {new Date().getFullYear()} Vloatty. All rights reserved. Vloatty Learning Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}
