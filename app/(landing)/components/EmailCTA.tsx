"use client";

import { useState } from "react";
import Link from "next/link";

export default function EmailCTA() {
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
            Get Started Free
          </button>
        </form>
      )}
      <p className="lp-cta-form__note">
        No credit card required &bull; Free forever plan available
      </p>
    </div>
  );
}
