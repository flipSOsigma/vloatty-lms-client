import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLms } from "../../context/LmsContext";
import docsData from "../../app/docs/docsData.json";

interface LandingNavProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function LandingNav({
  showSearch = false,
  searchQuery = "",
  onSearchChange
}: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const { currentUser } = useLms();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const quickLinks = [
    { id: "getting-started", title: "Getting Started", description: "Learn how to sign up & create institution" },
    { id: "subjects", title: "Subject Management", description: "Manage courses, roles & permissions" },
    { id: "ai-systems", title: "AI Token System", description: "Autofill rules, quiz tokens & safety" },
    { id: "storage", title: "Storage & Limits", description: "Free vs. paid storage allocations" },
    { id: "pricing-tiers", title: "Pricing & Plans", description: "Feature comparison matrix & options" }
  ];

  const getSectionSlug = (id: string): string => {
    if (id === "subjects") return "subject";
    if (id === "lessons") return "lesson";
    if (id === "modules") return "module";
    return id;
  };

  const getSubSectionSlug = (subId: string): string => {
    const parts = subId.split("-");
    if (parts.length > 1) {
      return parts.slice(1).join("-");
    }
    return subId;
  };

  // Compute Search Matches from docsData.json
  const matches: { sectionId: string; subId?: string; title: string; category: string; snippet: string }[] = [];

  if (searchQuery.trim()) {
    docsData.forEach((sec) => {
      // Match main section title
      if (sec.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push({
          sectionId: sec.id,
          title: sec.title,
          category: sec.category,
          snippet: "Main section guide"
        });
      }
      // Match sub sections
      sec.subSections.forEach((sub) => {
        if (sub.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          matches.push({
            sectionId: sec.id,
            subId: sub.id,
            title: sub.title,
            category: sec.title,
            snippet: "Sub-topic page"
          });
        }
      });
      // Match blocks text
      sec.blocks.forEach((block) => {
        if (
          block.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.text?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          matches.push({
            sectionId: sec.id,
            subId: block.id,
            title: block.title || sec.title,
            category: sec.title,
            snippet: block.text ? block.text.slice(0, 60) + "..." : "Syllabus details"
          });
        }
      });
    });
  }

  // Deduplicate matches
  const seen = new Set<string>();
  const uniqueMatches: typeof matches = [];
  matches.forEach((m) => {
    const key = `${m.sectionId}-${m.subId || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMatches.push(m);
    }
  });

  const handleMatchClick = (m: any) => {
    const secSlug = getSectionSlug(m.sectionId);
    if (m.subId) {
      const subSlug = getSubSectionSlug(m.subId);
      router.push(`/docs/${secSlug}/${subSlug}`);
    } else {
      router.push(`/docs/${secSlug}`);
    }
    setIsFocused(false);
    setMobileFocused(false);
  };

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
          <li><Link href="/#features" className="lp-nav__link">Features</Link></li>
          <li><Link href="/#pricing" className="lp-nav__link">Pricing</Link></li>
          <li><Link href="/#testimonials" className="lp-nav__link">About</Link></li>
          <li><Link href="/docs" className="lp-nav__link">Docs</Link></li>
        </ul>

        {/* Desktop CTA / Search */}
        <div className="lp-nav__cta">
          {showSearch ? (
            <div className="relative">
              <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200/60 rounded-full px-3.5 py-1.5 w-64 focus-within:w-80 transition-all duration-200">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="bg-transparent text-xs text-zinc-800 font-semibold focus:outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => onSearchChange?.("")} className="text-zinc-400 hover:text-zinc-650 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Desktop Dropdown Search Popup */}
              {isFocused && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl p-3 max-h-80 overflow-y-auto z-50 text-left">
                  {!searchQuery.trim() ? (
                    <div>
                      <h6 className="text-[9px] font-extrabold text-[#d97706] uppercase tracking-widest px-2 mb-2">Popular Topics</h6>
                      <div className="space-y-1">
                        {quickLinks.map((m, idx) => (
                          <button
                            key={idx}
                            onMouseDown={() => handleMatchClick({ sectionId: m.id })}
                            className="w-full text-left p-2 hover:bg-[#facc15]/5 hover:text-zinc-900 rounded-xl transition-all cursor-pointer flex flex-col group border border-transparent hover:border-[#facc15]/20"
                          >
                            <span className="font-bold text-zinc-850 text-[11px] group-hover:text-[#b45309] transition-colors">{m.title}</span>
                            <span className="text-[9.5px] text-zinc-400 font-semibold leading-tight mt-0.5">{m.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h6 className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest px-2 mb-2">Search Results ({uniqueMatches.length})</h6>
                      {uniqueMatches.length === 0 ? (
                        <p className="text-[11px] text-zinc-450 font-medium px-2 py-1">No matching topics found.</p>
                      ) : (
                        <div className="space-y-1">
                          {uniqueMatches.map((m, idx) => (
                            <button
                              key={idx}
                              onMouseDown={() => handleMatchClick(m)}
                              className="w-full text-left p-2 hover:bg-[#facc15]/5 rounded-xl transition-all cursor-pointer flex flex-col group border border-transparent hover:border-[#facc15]/20"
                            >
                              <span className="font-bold text-zinc-850 text-[11px] truncate group-hover:text-[#b45309] transition-colors">{m.title}</span>
                              <span className="text-[9.5px] text-zinc-450 font-semibold truncate leading-tight mt-0.5">{m.category} &bull; {m.snippet}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : currentUser ? (
            <>
              <Link href="/dashboard" className="lp-btn lp-btn--ghost lp-btn--sm">
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">{currentUser.name}</span>
                    <span className="lp-btn__text-hover">{currentUser.name}</span>
                  </span>
                </span>
              </Link>
              <Link href="/dashboard" className="lp-btn lp-btn--primary lp-btn--sm">
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Go to Dashboard</span>
                    <span className="lp-btn__text-hover">Go to Dashboard</span>
                  </span>
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--sm">
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Sign In</span>
                    <span className="lp-btn__text-hover">Sign In</span>
                  </span>
                </span>
              </Link>
              <Link href="/register" className="lp-btn lp-btn--primary lp-btn--sm">
                <span className="lp-btn__text-container">
                  <span className="lp-btn__text-track">
                    <span className="lp-btn__text-normal">Get Started Free</span>
                    <span className="lp-btn__text-hover">Get Started Free</span>
                  </span>
                </span>
              </Link>
            </>
          )}
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
        <div className="lp-nav__drawer bg-white border-b border-zinc-200" role="menu" aria-label="Mobile navigation">
          <ul role="list">
            <li><Link href="/#features" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">Features</Link></li>
            <li><Link href="/#pricing" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">Pricing</Link></li>
            <li><Link href="/#testimonials" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">About</Link></li>
            <li><Link href="/docs" className="lp-nav__drawer-link" onClick={() => setMenuOpen(false)} role="menuitem">Documentation</Link></li>
          </ul>
          <div className="lp-nav__drawer-cta">
            {showSearch ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-full px-4 py-2.5 w-full">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onFocus={() => setMobileFocused(true)}
                    onBlur={() => setTimeout(() => setMobileFocused(false), 200)}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="bg-transparent text-xs text-zinc-800 font-semibold focus:outline-none w-full"
                  />
                </div>
                {/* Mobile Search Matches inline */}
                {mobileFocused && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-2 max-h-60 overflow-y-auto space-y-1 mt-1 text-left">
                    {!searchQuery.trim() ? (
                      <div>
                        <h6 className="text-[9px] font-extrabold text-[#d97706] uppercase tracking-widest px-2 mb-1.5">Popular Topics</h6>
                        <div className="space-y-1">
                          {quickLinks.map((m, idx) => (
                            <button
                              key={idx}
                              onMouseDown={() => {
                                handleMatchClick({ sectionId: m.id });
                                setMenuOpen(false);
                              }}
                              className="w-full text-left p-2 hover:bg-zinc-50 rounded-xl text-xs flex flex-col cursor-pointer"
                            >
                              <span className="font-bold text-zinc-850 text-[11px]">{m.title}</span>
                              <span className="text-[9.5px] text-zinc-450 font-semibold leading-tight mt-0.5">{m.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h6 className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest px-2 mb-1.5">Search Results ({uniqueMatches.length})</h6>
                        {uniqueMatches.length === 0 ? (
                          <p className="text-[11px] text-zinc-450 font-medium px-2 py-1">No matching topics found.</p>
                        ) : (
                          <div className="space-y-1">
                            {uniqueMatches.map((m, idx) => (
                              <button
                                key={idx}
                                onMouseDown={() => {
                                  handleMatchClick(m);
                                  setMenuOpen(false);
                                }}
                                className="w-full text-left p-2 hover:bg-zinc-50 rounded-xl text-xs flex flex-col cursor-pointer"
                              >
                                <span className="font-bold text-zinc-850 text-[11px] truncate">{m.title}</span>
                                <span className="text-[9.5px] text-zinc-450 font-semibold truncate leading-tight mt-0.5">{m.category} &bull; {m.snippet}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : currentUser ? (
              <>
                <Link href="/dashboard" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
                  <span className="lp-btn__text-container">
                    <span className="lp-btn__text-track">
                      <span className="lp-btn__text-normal">{currentUser.name}</span>
                      <span className="lp-btn__text-hover">{currentUser.name}</span>
                    </span>
                  </span>
                </Link>
                <Link href="/dashboard" className="lp-btn lp-btn--primary lp-btn--full" onClick={() => setMenuOpen(false)}>
                  <span className="lp-btn__text-container">
                    <span className="lp-btn__text-track">
                      <span className="lp-btn__text-normal">Go to Dashboard</span>
                      <span className="lp-btn__text-hover">Go to Dashboard</span>
                    </span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--full" onClick={() => setMenuOpen(false)}>
                  <span className="lp-btn__text-container">
                    <span className="lp-btn__text-track">
                      <span className="lp-btn__text-normal">Sign In</span>
                      <span className="lp-btn__text-hover">Sign In</span>
                    </span>
                  </span>
                </Link>
                <Link href="/register" className="lp-btn lp-btn--primary lp-btn--full" onClick={() => setMenuOpen(false)}>
                  <span className="lp-btn__text-container">
                    <span className="lp-btn__text-track">
                      <span className="lp-btn__text-normal">Get Started Free</span>
                      <span className="lp-btn__text-hover">Get Started Free</span>
                    </span>
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
