import React from "react";
import styles from "../../app/landing.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <a href="#" className={styles.footerLogo}>
              <img
                src="/vloatty - Logo Only.png"
                alt="Vloatty Logo"
                className={styles.footerLogoImg}
                width={28}
                height={28}
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
              <a href="/#features" className={styles.footerLink}>Features</a>
              <a href="/#pricing" className={styles.footerLink}>Pricing</a>
              <a href="/login" className={styles.footerLink}>Sign In</a>
            </div>
            <div className={styles.footerLinksCol}>
              <h4>Company</h4>
              <a href="/#testimonials" className={styles.footerLink}>About Us</a>
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
  );
}
