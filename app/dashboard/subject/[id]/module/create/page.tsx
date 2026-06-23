"use client";

import React, { useState } from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  AlertTriangle,
  GraduationCap,
  Calendar,
  MapPin,
  Lightbulb,
  Info,
} from "lucide-react";
import { Module } from "../../../../../../types/subject";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CreateModulePage({ params }: PageProps) {
  const { id } = React.use(params);
  const { subjects, currentUser, updateSubject, showToast } = useLms();
  const router = useRouter();

  const subject = subjects.find((s) => s.id === id);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; 
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAutofilled, setHasAutofilled] = useState(false);

  const triggerAutofill = async (inputTitle: string) => {
    if (!inputTitle.trim()) return;
    if (desc.trim() && !hasAutofilled) return;

    setIsGenerating(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/ai/generate-module-desc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: inputTitle.trim(),
          subjectName: subject?.name,
          subjectDesc: subject?.description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate description");
      }

      const data = await res.json();
      if (data.description) {
        setDesc(data.description);
        setHasAutofilled(true);
      }
    } catch (err: any) {
      console.error("AI Autofill failed:", err);
      let userFriendlyMessage = err.message || "";
      const msgLower = userFriendlyMessage.toLowerCase();

      if (msgLower.includes("failed to fetch") || msgLower.includes("network")) {
        userFriendlyMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (msgLower.includes("api_key") || msgLower.includes("api key") || msgLower.includes("unconfigured")) {
        userFriendlyMessage = "AI generator is temporarily offline due to setup issues. Please try again later.";
      } else if (msgLower.includes("busy") || msgLower.includes("503") || msgLower.includes("overloaded") || msgLower.includes("rate") || msgLower.includes("quota") || msgLower.includes("exhausted")) {
        userFriendlyMessage = "AI is currently busy handling other requests. Please wait a few seconds and try again.";
      } else {
        userFriendlyMessage = "We couldn't generate the description. Please try again or type it manually.";
      }

      showToast(userFriendlyMessage, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const isOwner = subject && currentUser && (subject.createdBy === currentUser.id || subject.lecturers.some((l) => l.userId === currentUser.id));

  if (!subject) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8]/70 rounded-3xl p-6 bg-white/40 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Subject not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-3xl p-6 bg-red-50/20 select-none">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[14px] text-red-600 font-semibold">Access Denied.</span>
          <span className="text-[12px] text-zinc-500 font-medium mt-1">
            Only the subject creator or lecturer has permissions to create new modules.
          </span>
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all"
          >
            Go back to Subject
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFields({});

    if (!title.trim()) {
      setErrorFields({ title: "Module title is required." });
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();
    const newId = typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });

    const newModule: Module = {
      id: newId,
      title: title.trim(),
      desc: desc.trim(),
      date: new Date(date).toISOString(),
      lessons: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const updatedSubject = {
      ...subject,
      modules: [...(subject.modules || []), newModule],
    };

    setTimeout(() => {
      updateSubject(updatedSubject);
      setIsSaving(false);
      setSuccessMessage("Module created successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push(`/dashboard/subject/${subject.id}`);
      }, 1000);
    }, 600);
  };

  return (
    <>
      <Header />

      {/* Main container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-8 text-left select-none w-full">
        {/* Header section */}
        <div className="flex items-center gap-3 mt-1">
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none">
              Create New Module
            </h1>
          </div>
        </div>

        {successMessage && (
          <div className="w-full bg-emerald-50 border border-emerald-250 text-emerald-800 text-[13px] font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">
          {/* Left Column - Form Card */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full lg:pl-[53px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Module Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Module 1: Introduction to Mechanics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-1 py-2.5 bg-transparent border-b text-[13px] font-semibold text-zinc-800 focus:outline-none rounded-none transition-all duration-200 ${
                    errorFields.title ? "border-red-400 focus:border-red-500" : "border-[#E5E1D8] focus:border-zinc-850"
                  }`}
                  onBlur={(e) => {
                    triggerAutofill(e.target.value);
                  }}
                />
                {errorFields.title && (
                  <span className="text-[11px] text-red-500 font-bold">{errorFields.title}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Module Description</label>
                  {title.trim() && (
                    <button
                      type="button"
                      onClick={() => triggerAutofill(title)}
                      disabled={isGenerating}
                      className="text-[10px] font-bold text-[#d97706] hover:text-[#b45309] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 select-none"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3 h-3 rounded-full border border-[#d97706]/20 border-t-[#d97706] animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ AI Autofill</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Brief summary or objectives of this module..."
                  value={desc}
                  onChange={(e) => {
                    setDesc(e.target.value);
                    if (hasAutofilled) setHasAutofilled(false);
                  }}
                  rows={4}
                  className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13px] focus:outline-none resize-none transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Start / Release Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-1 py-2.5 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13px] focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 justify-end mt-4">
                <Link
                  href={`/dashboard/subject/${subject.id}`}
                  className="px-6 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 font-semibold text-[11px] bg-white hover:bg-zinc-50 transition-all cursor-pointer"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Create Module
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Info Panels */}
          <div className="lg:col-span-5 flex flex-col gap-8 sticky top-6 text-left self-start w-full lg:border-l lg:border-[#E5E1D8]/45 lg:pl-10">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-1 pb-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Target Subject
                </span>
                <span
                  className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit mb-2"
                  style={{
                    backgroundColor: "#facc1515",
                    color: "#facc15",
                    border: "1px solid #facc1530",
                  }}
                >
                  {subject.room || "Room Online"}
                </span>
                <h2 className="text-[18px] font-semibold text-zinc-800 tracking-tight leading-tight">
                  {subject.name}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[11px] mt-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Lecturers: {subject.lecturers.map((l) => l.name).join(", ")}</span>
                </div>
              </div>

              {subject.description && (
                <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium">
                  {subject.description}
                </p>
              )}

              {subject.schedules && subject.schedules.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40">
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                    Class Schedule
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {subject.schedules.map((sch, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-[11.5px] font-semibold text-zinc-700 bg-transparent py-1.5 px-0.5 border-b border-[#E5E1D8]/30 last:border-b-0"
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {sch.day}
                        </span>
                        <span className="text-zinc-500 text-[10.5px]">{sch.startTime} - {sch.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[13px] font-semibold text-zinc-850 flex items-center gap-2 pb-1">
                <Info className="w-4.5 h-4.5 text-[#d97706]" />
                Module Guidelines
              </h3>

              <div className="flex flex-col gap-4 text-[12px] text-zinc-650 font-medium">
                <div className="flex gap-2.5 items-start bg-[#facc15]/5 p-3.5 rounded-2xl border border-[#facc15]/20 text-zinc-800">
                  <Lightbulb className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[11.5px] block text-[#d97706] mb-0.5">Syllabus Structure</span>
                    Modules act as structural chapters of your course, containing lessons, reading materials, and homework submission folders.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-white/50 p-3.5 rounded-2xl border border-[#E5E1D8]/70">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-850 mb-0.5">Release Dates</span>
                    Set a start/release date to let students know when they should expect to cover this module's topics.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
