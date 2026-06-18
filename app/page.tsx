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
  ArrowRight
} from "lucide-react";
import { animate, stagger, createTimeline } from "animejs";
import LandingNav from "./(landing)/components/LandingNav";
import EmailCTA from "./(landing)/components/EmailCTA";
import styles from "./(landing)/landing.module.css";

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
      icon: <Building2 className={styles.featureCardIcon} />,
      title: "Institution Management",
      desc: "Manage your institution profile, invite members, and assign roles (Owner, Lecturer, Admission) from a unified console.",
    },
    {
      icon: <BookOpen className={styles.featureCardIcon} />,
      title: "Smart Class Management",
      desc: "Link subjects to institutions, schedule lectures, assign instructors, and easily coordinate student enrollments.",
    },
    {
      icon: <ShieldAlert className={styles.featureCardIcon} />,
      title: "Role-Based Permissions",
      desc: "Granular access controls built directly into every screen. Give administrators, lecturers, and students exactly the access they need.",
    },
    {
      icon: <FolderOpen className={styles.featureCardIcon} />,
      title: "File Organization",
      desc: "Upload, categorize, search, and bulk-delete institutional documents, academic syllabi, maps, and campus assets securely.",
    },
    {
      icon: <Calendar className={styles.featureCardIcon} />,
      title: "Live Event Calendar",
      desc: "An interactive planner displaying automatically generated lecture schedules, assignable tasks, and exam deadlines.",
    },
    {
      icon: <Layers className={styles.featureCardIcon} />,
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
            <Link href="/register" className="lp-btn lp-btn--primary lp-btn--lg">
              <span className="lp-btn__text-container">
                <span className="lp-btn__text-track">
                  <span className="lp-btn__text-normal">Get Started Free</span>
                  <span className="lp-btn__text-hover">Get Started Free</span>
                </span>
              </span>
              <ArrowRight className="lp-btn__icon w-4 h-4 ml-1" />
            </Link>
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
              <Link href="/register" className="lp-btn lp-btn--ghost lp-btn--full" style={{ marginTop: "auto" }}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Get Started</span>
                    <span className="lp-btn__text-hover">Get Started</span>
                  </span>
                </span>
              </Link>
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
              <Link href="/register" className="lp-btn lp-btn--primary lp-btn--full" style={{ marginTop: "auto" }}>
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Start 14-Day Free Trial</span>
                    <span className="lp-btn__text-hover">Start 14-Day Free Trial</span>
                  </span>
                </span>
              </Link>
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
              <Link href="/" className={styles.footerLogo}>
                <img 
                  src="/vloatty - Logo Only.png" 
                  alt="Vloatty Logo" 
                  className={styles.footerLogoImg} 
                />
                <span className={styles.footerLogoText}>Vloatty</span>
              </Link>
              <p className={styles.footerTagline}>
                Unlock your learning and campus management potential with our unified LMS ecosystem.
              </p>
              <div className={styles.footerSocials}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn} aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              </div>
            </div>

            <div className={styles.footerLinksGrid}>
              <div className={styles.footerLinksCol}>
                <h4>Platform</h4>
                <a href="#features" className={styles.footerLink}>Features</a>
                <a href="#pricing" className={styles.footerLink}>Pricing</a>
                <a href="/login" className={styles.footerLink}>Sign In</a>
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
