import React from "react";
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
import LandingNav from "./(landing)/components/LandingNav";
import EmailCTA from "./(landing)/components/EmailCTA";
import styles from "./(landing)/landing.module.css";

export default function RootPage() {
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
      color: "#f25c88",
    },
    {
      quote: "The file organization section makes distributing syllabus templates and guidelines to lecturers effortless.",
      author: "Marcus Aurelius",
      role: "Academic Registrar",
      initials: "MA",
      color: "#823cff",
    },
    {
      quote: "Students love the central event calendar and modules. We saw a 35% reduction in missed deadlines in the first semester.",
      author: "Prof. Alan Turing",
      role: "Department Coordinator",
      initials: "AT",
      color: "#34d399",
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
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span className={styles.heroBadgeText}>Next-Gen LMS Platform</span>
          </div>

          <h1 className={styles.heroH1}>
            The Modern <span>Learning Management System</span>
          </h1>

          <p className={styles.heroSub}>
            Empower institutions, lecturers, and students with a unified platform for courses, schedules, and collaboration.
          </p>

          <div className={styles.heroCTAs}>
            <Link href="/register" className="lp-btn lp-btn--primary lp-btn--lg">
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <a href="#features" className="lp-btn lp-btn--ghost lp-btn--lg">
              See Features
            </a>
          </div>
        </div>

        {/* Hero Mockups */}
        <div className={styles.heroMockup}>
          {/* Card 1: Members */}
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardIcon}>🏫</div>
              <div>
                <div className={styles.heroCardTitle}>Institution Members</div>
                <div className={styles.heroCardSub}>Vloatty University</div>
              </div>
            </div>
            <div className={styles.heroCardRow}>
              <div className={styles.heroCardAvatar} style={{ background: "#f25c88" }}>JD</div>
              <div className={styles.heroCardRowText}>
                <div className={styles.heroCardRowName}>Dr. Jane Doe</div>
                <div className={styles.heroCardRowRole}>Dean of Science</div>
              </div>
              <span className={`${styles.heroCardBadge} ${styles.heroCardBadgePink}`}>Owner</span>
            </div>
            <div className={styles.heroCardRow}>
              <div className={styles.heroCardAvatar} style={{ background: "#34d399" }}>AS</div>
              <div className={styles.heroCardRowText}>
                <div className={styles.heroCardRowName}>Albert Smith</div>
                <div className={styles.heroCardRowRole}>Lecturer</div>
              </div>
              <span className={`${styles.heroCardBadge} ${styles.heroCardBadgeGreen}`}>Lecturer</span>
            </div>
            <div className={styles.heroCardRow}>
              <div className={styles.heroCardAvatar} style={{ background: "#a78bfa" }}>EM</div>
              <div className={styles.heroCardRowText}>
                <div className={styles.heroCardRowName}>Emily Miller</div>
                <div className={styles.heroCardRowRole}>Admission Office</div>
              </div>
              <span className={`${styles.heroCardBadge} ${styles.heroCardBadgePurple}`}>Admission</span>
            </div>
          </div>

          {/* Card 2: Subject Metrics */}
          <div className={`${styles.heroCard} ${styles.heroCardB} hidden sm:block`}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardIcon} style={{ background: "linear-gradient(135deg, #823cff, #a78bfa)" }}>📚</div>
              <div>
                <div className={styles.heroCardTitle}>Database & Systems</div>
                <div className={styles.heroCardSub}>CS-302 • Classroom A</div>
              </div>
            </div>
            <div className={styles.heroStatBar}>
              <div className={styles.heroStatLabel}>
                <span>Student Attendance</span>
                <span>92%</span>
              </div>
              <div className={styles.heroStatTrack}>
                <div className={styles.heroStatFill} style={{ width: "92%" }}></div>
              </div>
            </div>
            <div className={styles.heroStatBar}>
              <div className={styles.heroStatLabel}>
                <span>Syllabus Progress</span>
                <span>74%</span>
              </div>
              <div className={styles.heroStatTrack}>
                <div className={styles.heroStatFill} style={{ width: "74%", background: "linear-gradient(90deg, #823cff, #a78bfa)" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>3,000+</div>
            <div className={styles.statLabel}>Active Students</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>500+</div>
            <div className={styles.statLabel}>Institutions</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>98%</div>
            <div className={styles.statLabel}>Uptime SLA</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>50+</div>
            <div className={styles.statLabel}>Countries</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Features</div>
          <h2 className={styles.sectionH2}>
            Everything you need to <span>run your institution</span>
          </h2>
          <p className={styles.sectionDesc}>
            Vloatty provides a comprehensive suite of tools designed specifically for modern academic and clinical learning environments.
          </p>

          <div className={styles.featuresGrid}>
            {features.map((feat, idx) => (
              <div className={styles.featureCard} key={idx}>
                {feat.icon}
                <h3 className={styles.featureCardTitle}>{feat.title}</h3>
                <p className={styles.featureCardDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel} style={{ color: "#fff" }}>Pricing</div>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2Light}`}>
            Simple, transparent <span>pricing</span>
          </h2>
          <p className={`${styles.sectionDesc} ${styles.sectionDescLight}`}>
            Start free and scale as your institution grows. Cancel at any time.
          </p>

          <div className={styles.pricingGrid}>
            {/* Free */}
            <div className={styles.pricingCard}>
              <h3 className={styles.pricingTier}>Free</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>$</span>
                <span className={styles.pricingAmount}>0</span>
                <span className={styles.pricingPeriod}>/mo</span>
              </div>
              <p className={styles.pricingDesc}>Perfect for small classes and testing out the platform.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Up to 3 subjects
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> 1 institution link
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Basic file sharing
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Community support
                </li>
              </ul>
              <Link href="/register" className="lp-btn lp-btn--ghost lp-btn--full" style={{ marginTop: "auto" }}>
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className={`${styles.pricingCard} ${styles.pricingCardHighlight}`}>
              <div className={styles.pricingBadge}>Most Popular</div>
              <h3 className={styles.pricingTier}>Professional</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>$</span>
                <span className={styles.pricingAmount}>12</span>
                <span className={styles.pricingPeriod}>/mo</span>
              </div>
              <p className={styles.pricingDesc} style={{ color: "rgba(255,255,255,0.7)" }}>Empower departments with advanced scheduling and modules.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Unlimited subjects
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Up to 3 institutions
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> 10GB secure storage
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Priority email support
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Real-time search & filter
                </li>
              </ul>
              <Link href="/register" className="lp-btn lp-btn--primary lp-btn--full" style={{ marginTop: "auto" }}>
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className={styles.pricingCard}>
              <h3 className={styles.pricingTier}>Enterprise</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount} style={{ fontSize: "2.25rem" }}>Custom</span>
              </div>
              <p className={styles.pricingDesc}>Designed for large universities requiring dedicated infrastructure.</p>
              <div className={styles.pricingDivider} />
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Unlimited institutions
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Unlimited storage
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> Custom domain & SSO
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> 24/7 dedicated support
                </li>
                <li className={styles.pricingFeature}>
                  <Check className={styles.pricingFeatureCheck} /> SLA & custom integration
                </li>
              </ul>
              <a href="mailto:sales@vloatty.com" className="lp-btn lp-btn--ghost lp-btn--full" style={{ marginTop: "auto" }}>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Testimonials</div>
          <h2 className={styles.sectionH2}>
            Loved by <span>educators & administrators</span>
          </h2>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, idx) => (
              <div className={styles.testimonialCard} key={idx}>
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

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaSectionInner}>
          <h2 className={styles.sectionH2} style={{ color: "#fff", textAlign: "center", marginBottom: "16px" }}>
            Ready to transform your <span>learning experience?</span>
          </h2>
          <p className={styles.sectionDesc} style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            Join hundreds of institutions already using Vloatty to power their campus workflows and course planning.
          </p>
          <EmailCTA />
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#f25c88" />
              <path d="M7 9L14 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.footerLogoText}>Vloatty</span>
          </div>

          <div className={styles.footerLinks}>
            <a href="#features" className={styles.footerLink}>Features</a>
            <a href="#pricing" className={styles.footerLink}>Pricing</a>
            <a href="/login" className={styles.footerLink}>Dashboard</a>
            <a href="mailto:support@vloatty.com" className={styles.footerLink}>Support</a>
          </div>

          <p className={styles.footerCopy}>
            &copy; {new Date().getFullYear()} Vloatty. All rights reserved. Vloatty Learning Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}
