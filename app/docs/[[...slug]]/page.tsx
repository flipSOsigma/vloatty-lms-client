"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Check,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  User,
  Users,
  ChevronRight,
  Search,
  Menu,
  X,
  ArrowRight,
  Key,
  GraduationCap,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  FileText,
  Settings,
  Layers,
  Link2,
  DollarSign
} from "lucide-react";
import LandingNav from "../../../components/views/LandingNav";
import Footer from "../../../components/views/Footer";
import docsData from "../docsData.json";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

const routeMap: Record<string, string> = {
  subject: "subjects",
  subjects: "subjects",
  lesson: "lessons",
  lessons: "lessons",
  module: "modules",
  modules: "modules",
  storage: "storage",
  "getting-started": "getting-started",
  "ai-system": "ai-systems",
  "ai-systems": "ai-systems",
  calendar: "calendar",
  "pricing-tier": "pricing-tiers",
  "pricing-tiers": "pricing-tiers",
  intro: "intro"
};

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

const resolveSubSectionId = (sectionId: string, subSlug: string): string | undefined => {
  if (!subSlug) return undefined;
  
  const section = docsData.find((s) => s.id === sectionId);
  if (!section) return undefined;
  
  const normalizedSlug = subSlug.toLowerCase().trim();
  
  const aliasMap: Record<string, string> = {
    definition: "concept",
    definiton: "concept",
    intro: "concept",
    welcome: "welcome",
    role: "roles"
  };
  
  const targetWord = aliasMap[normalizedSlug] || normalizedSlug;
  
  // 1. Exact match in sub-section IDs
  let found = section.subSections.find((sub) => sub.id.toLowerCase() === normalizedSlug);
  if (found) return found.id;
  
  // 2. Ends with targetWord or normalizedSlug
  found = section.subSections.find((sub) => {
    const subIdLower = sub.id.toLowerCase();
    return subIdLower.endsWith("-" + targetWord) || subIdLower.endsWith("-" + normalizedSlug) || subIdLower === targetWord;
  });
  if (found) return found.id;

  // 3. Contains targetWord or normalizedSlug
  found = section.subSections.find((sub) => {
    const subIdLower = sub.id.toLowerCase();
    return subIdLower.includes(targetWord) || subIdLower.includes(normalizedSlug);
  });
  if (found) return found.id;
  
  // 4. Matches subSection titles
  found = section.subSections.find((sub) => {
    return sub.title.toLowerCase().includes(targetWord) || sub.title.toLowerCase().includes(normalizedSlug);
  });
  if (found) return found.id;

  return undefined;
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "HelpCircle": return <HelpCircle className="w-4 h-4" />;
    case "ShieldAlert": return <ShieldAlert className="w-4 h-4" />;
    case "ArrowRight": return <ArrowRight className="w-4 h-4" />;
    case "GraduationCap": return <GraduationCap className="w-4 h-4" />;
    case "Layers": return <Layers className="w-4 h-4" />;
    case "BookOpen": return <BookOpen className="w-4 h-4" />;
    case "Sparkles": return <Sparkles className="w-4 h-4 text-amber-600" />;
    case "Calendar": return <Calendar className="w-4 h-4" />;
    case "DollarSign": return <DollarSign className="w-4 h-4" />;
    case "FileText": return <FileText className="w-4 h-4" />;
    default: return <HelpCircle className="w-4 h-4" />;
  }
};

const renderBlock = (block: any) => {
  switch (block.type) {
    case "banner":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 p-6 bg-[#facc15]/5 rounded-3xl border border-[#facc15]/20 mb-6">
          <h3 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#d97706]" /> {block.title}
          </h3>
          <p className="text-[13px] text-zinc-655 leading-relaxed font-medium">
            {block.text}
          </p>
        </div>
      );
    case "text":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-600 leading-relaxed font-medium">
            {block.text}
          </p>
        </div>
      );
    case "list":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-600 leading-relaxed font-medium">
            {block.text}
          </p>
          <ul className="list-disc pl-5 text-[12px] text-zinc-600 space-y-2 font-medium">
            {block.items.map((item: any, idx: number) => (
              <li key={idx}>
                <span className="font-bold text-zinc-855">{item.bold}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      );
    case "steps":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-855 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-600 leading-relaxed font-medium">
            {block.text}
          </p>
          <ol className="list-decimal pl-5 text-[12px] text-zinc-600 space-y-2 font-medium">
            {block.items.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </div>
      );
    case "roles_list":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[13px] text-zinc-655 leading-relaxed font-medium">
            {block.text}
          </p>
          <div className="space-y-3 pt-2">
            {block.items.map((item: any, idx: number) => {
              let Icon = User;
              let bgClass = "bg-amber-500/5 border-amber-500/20 text-[#b45309]";
              if (item.role === "owner") {
                Icon = Key;
                bgClass = "bg-zinc-900 text-white";
              } else if (item.role === "student") {
                Icon = Users;
                bgClass = "bg-emerald-500/5 border-emerald-500/20 text-emerald-700";
              }
              return (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-zinc-200/65 bg-white/40">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-855">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case "lockout_info":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-600 leading-relaxed font-medium">
            {block.text}
          </p>
          <ul className="list-disc pl-5 text-[12px] text-zinc-655 space-y-2 font-medium">
            <li>
              <span className="font-bold text-[#b45309] mr-1">Restricted:</span> Closes the submission box immediately at the deadline. Late uploads are rejected.
            </li>
            <li>
              <span className="font-bold text-emerald-700 mr-1">Open Submission:</span> Students can upload homework after the close date, marked clearly as late in the grader console.
            </li>
          </ul>
        </div>
      );
    case "ai_tokens_info":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <div className="p-5 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-transparent rounded-2xl border border-amber-200/50 space-y-3">
            <h4 className="font-bold text-xs text-[#b45309] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> The Token Limits & Safety Guardrails
            </h4>
            <ul className="list-disc pl-5 text-[11.5px] text-zinc-650 space-y-2 leading-relaxed font-medium">
              <li>
                <span className="font-bold text-zinc-800">Daily Balance:</span> Every user has a daily AI token quota to run autofill actions or create quiz questions.
              </li>
              <li>
                <span className="font-bold text-zinc-800">Token Consumption:</span> A token is <strong>only consumed when AI generation completes successfully</strong>. If a request fails, is canceled, or experiences a network error, no tokens are deducted.
              </li>
              <li>
                <span className="font-bold text-zinc-800">Midnight Reset:</span> Quotas are <strong>reset automatically every day at UTC Midnight (00:00 UTC)</strong>, allowing you to use the AI generator features again the next day even without upgrading.
              </li>
              <li>
                <span className="font-bold text-zinc-800">Indicator Badge:</span> A dynamic tracker badge showing <code>✦ [Remaining] / [Max]</code> is rendered directly next to all AI buttons on form fields, keeping you updated on your current balances.
              </li>
            </ul>
          </div>
        </div>
      );
    case "comparison_table":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white/40">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-[11.5px] font-medium text-zinc-600">
              <thead className="bg-zinc-100 text-zinc-800 font-bold">
                <tr>
                  <th className="px-4 py-3">Features & Limits</th>
                  <th className="px-4 py-3 text-[#121212]">Basic (Free)</th>
                  <th className="px-4 py-3 text-[#d97706]">Professional</th>
                  <th className="px-4 py-3 text-zinc-900">Max (Enterprise)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 leading-relaxed">
                <tr>
                  <td className="px-4 py-3 font-bold text-zinc-800">Monthly Pricing</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3">$12/mo <span className="text-[9.5px] text-zinc-400 block font-normal">(or $9/mo billed yearly)</span></td>
                  <td className="px-4 py-3">Custom / Tailored</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-zinc-800">Active Subjects</td>
                  <td className="px-4 py-3">Up to 3</td>
                  <td className="px-4 py-3 text-emerald-700 font-bold">Unlimited</td>
                  <td className="px-4 py-3 text-emerald-700 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-zinc-800">Institution Links</td>
                  <td className="px-4 py-3">Up to 1 school</td>
                  <td className="px-4 py-3">Up to 3 schools</td>
                  <td className="px-4 py-3 text-emerald-700 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-zinc-800">Secure Storage</td>
                  <td className="px-4 py-3">Basic (100MB capacity)</td>
                  <td className="px-4 py-3 font-bold text-zinc-800">500MB Secure Cloud</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">1GB Secure Cloud</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-zinc-800">Timetable & Calendars</td>
                  <td className="px-4 py-3">Included</td>
                  <td className="px-4 py-3">Included</td>
                  <td className="px-4 py-3">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    case "pricing_cards":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-650 leading-relaxed font-medium">
            {block.text}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white/50 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Basic (Free)</span>
              <div className="text-xl font-extrabold text-zinc-850">5 Tokens</div>
              <p className="text-[10px] text-zinc-400 font-semibold leading-normal">Renewed every 24h. Perfect for individual trials.</p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-bold text-[#b45309] uppercase tracking-wide">Professional</span>
              <div className="text-xl font-extrabold text-[#d97706]">50 Tokens</div>
              <p className="text-[10px] text-zinc-400 font-semibold leading-normal">For lecturers managing multiple courses daily.</p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 text-white space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Max / Enterprise</span>
              <div className="text-xl font-extrabold text-white">200 Tokens</div>
              <p className="text-[10px] text-zinc-300 font-semibold leading-normal">For large departments or power users.</p>
            </div>
          </div>
        </div>
      );
    case "lesson_types":
      return (
        <div key={block.id} id={block.id} className="scroll-mt-36 space-y-3 mb-8">
          <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">{block.title}</h3>
          <p className="text-[12.5px] text-zinc-650 leading-relaxed font-medium">
            {block.text}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {block.items.map((item: any, idx: number) => {
              let Icon = BookOpen;
              let colorClass = "text-amber-700 bg-amber-500/5 border-amber-500/20";
              if (item.type === "learning") {
                Icon = BookOpen;
                colorClass = "text-amber-700 bg-amber-500/5 border-amber-500/20";
              } else if (item.type === "assignment") {
                Icon = FileText;
                colorClass = "text-indigo-700 bg-indigo-500/5 border-indigo-500/20";
              } else if (item.type === "quiz") {
                Icon = Sparkles;
                colorClass = "text-purple-700 bg-purple-500/5 border-purple-500/20";
              } else if (item.type === "presence") {
                Icon = Calendar;
                colorClass = "text-emerald-700 bg-emerald-500/5 border-emerald-500/20";
              }
              return (
                <div key={idx} className="flex flex-col p-5 rounded-2xl border border-zinc-200/60 bg-white/40 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${colorClass} mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-zinc-850 mb-1">{item.title}</h4>
                  <p className="text-[11.5px] text-zinc-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default function DocumentationPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams?.slug;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Resolve section and subsection IDs from URLs
  const sectionSlug = slug?.[0];
  const subSectionSlug = slug?.[1];

  const resolvedSectionId = sectionSlug ? (routeMap[sectionSlug] || "intro") : "intro";
  const resolvedSubSectionId = subSectionSlug ? resolveSubSectionId(resolvedSectionId, subSectionSlug) : undefined;
  const currentSection = docsData.find((s) => s.id === resolvedSectionId) || docsData[0];
  const categories = Array.from(new Set(docsData.map((s) => s.category))).filter(Boolean);

  // Smooth scroll to subSection when route slug changes
  useEffect(() => {
    if (resolvedSubSectionId) {
      const el = document.getElementById(resolvedSubSectionId);
      if (el) {
        const timer = setTimeout(() => {
          const y = el.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [resolvedSectionId, resolvedSubSectionId]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans select-none antialiased">
      {/* Documentation Header */}
      <LandingNav
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Documentation Area (Includes pt-20) */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex items-start relative px-4 md:px-8 py-8 gap-8 pt-20">
        
        {/* Left Sidebar (Desktop Navigation with separate scroll behavior) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start space-y-6 overflow-y-auto max-h-[calc(100vh-7rem)] pr-2 no-scrollbar">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-3 mb-2">{cat}</h4>
              <ul className="space-y-0.5">
                {docsData
                  .filter((sec) => sec.category === cat)
                  .map((sec) => {
                    const isActive = sec.id === resolvedSectionId;
                    return (
                      <li key={sec.id}>
                        <button
                          onClick={() => {
                            router.push(`/docs/${getSectionSlug(sec.id)}`);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isActive
                              ? "bg-zinc-900 text-white shadow-sm"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                          }`}
                        >
                          {getIcon(sec.icon)}
                          <span className="truncate">{sec.title}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Striped vertical divider container */}
        <div 
          className="hidden md:block w-10 self-stretch shrink-0 border-x border-zinc-200/60" 
          style={{ 
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(239, 236, 230, 0.45) 12px, rgba(239, 236, 230, 0.45) 24px)' 
          }} 
        />

        {/* Mobile Navigation Drawer Overlay (Browse Topics List) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white p-6 flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-extrabold text-sm text-zinc-800">Browse Topics</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-500 hover:text-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories list */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {categories.map((cat) => (
                <div key={cat} className="space-y-1">
                  <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-2">{cat}</h4>
                  <ul className="space-y-1">
                    {docsData
                      .filter((sec) => sec.category === cat)
                      .map((sec) => {
                        const isActive = sec.id === resolvedSectionId;
                        return (
                          <li key={sec.id}>
                            <button
                              onClick={() => {
                                router.push(`/docs/${getSectionSlug(sec.id)}`);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                                isActive
                                  ? "bg-zinc-900 text-white shadow-sm"
                                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-855"
                              }`}
                            >
                              {getIcon(sec.icon)}
                              <span>{sec.title}</span>
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Content Area */}
        <main className="flex-1 max-w-3xl p-4 md:p-6 min-h-[600px] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Mobile Chapters Trigger */}
            <div className="md:hidden flex items-center justify-between bg-zinc-150/40 border border-zinc-200/50 rounded-2xl p-3 mb-4">
              <span className="text-xs font-bold text-zinc-700">Topics</span>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-xs font-extrabold text-[#d97706] hover:text-[#b45309] cursor-pointer"
              >
                Browse Topics &rarr;
              </button>
            </div>

            {/* Category Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
              <span>{currentSection.category}</span>
              <ChevronRight className="w-3 h-3 text-zinc-300" />
              <span className="text-zinc-650">{currentSection.title}</span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                {getIcon(currentSection.icon)}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {currentSection.title}
              </h2>
            </div>

            {/* Section Content (Render Dynamic Blocks) */}
            <div className="prose max-w-none text-zinc-655 select-text">
              {currentSection.blocks.map((block: any) => renderBlock(block))}
            </div>
          </div>

          {/* Quick Footer Navigation */}
          <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div>
              {docsData.indexOf(currentSection) > 0 && (
                <button
                  onClick={() => {
                    const prevId = docsData[docsData.indexOf(currentSection) - 1].id;
                    router.push(`/docs/${getSectionSlug(prevId)}`);
                  }}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>
              )}
            </div>
            <div>
              {docsData.indexOf(currentSection) < docsData.length - 1 && (
                <button
                  onClick={() => {
                    const nextId = docsData[docsData.indexOf(currentSection) + 1].id;
                    router.push(`/docs/${getSectionSlug(nextId)}`);
                  }}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar (Table of Contents / Sub-sections) */}
        <aside className="hidden xl:block w-56 shrink-0 sticky top-36 self-start space-y-4 pr-2">
          <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-1">On this page</h5>
          <ul className="space-y-3 border-l border-zinc-200/80 pl-3">
            {currentSection.subSections.map((sub) => {
              const activeSubId = resolvedSubSectionId;
              const isActive = sub.id === activeSubId;
              return (
                <li key={sub.id}>
                  <button
                    onClick={() => {
                      router.push(`/docs/${getSectionSlug(currentSection.id)}/${getSubSectionSlug(sub.id)}`);
                    }}
                    className={`group flex items-center gap-1.5 text-[11px] font-bold transition-colors text-left ${
                      isActive ? "text-[#d97706]" : "text-zinc-400 hover:text-zinc-800"
                    }`}
                  >
                    <Link2 className={`w-3 h-3 transition-opacity shrink-0 ${
                      isActive ? "opacity-100 text-[#d97706]" : "opacity-0 group-hover:opacity-100 text-zinc-450"
                    }`} />
                    <span className="truncate">{sub.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
