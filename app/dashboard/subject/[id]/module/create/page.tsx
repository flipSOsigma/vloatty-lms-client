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
  const { subjects, currentUser, updateSubject } = useLms();
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

  const isOwner = subject && currentUser && (subject.createdBy === currentUser.id || subject.lecturers.some((l) => l.userId === currentUser.id));

  if (!subject) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/40 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Subject not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] hover:bg-zinc-800 transition-all shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-red-200 rounded-3xl p-6 bg-red-50/20 select-none">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[14px] text-red-600 font-bold">Access Denied.</span>
          <span className="text-[12px] text-zinc-500 font-medium mt-1">
            Only the subject creator or lecturer has permissions to create new modules.
          </span>
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] hover:bg-zinc-800 transition-all shadow-sm"
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

      {}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        {}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center text-zinc-600 hover:bg-white hover:border-zinc-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Create New Module
            </h1>
          </div>
        </div>

        {}
        {successMessage && (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Column - Form Card */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full lg:pl-12">
            <div className="flex flex-col gap-1">
              <h3 className="text-[15px] font-extrabold text-[#121212] flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-[#f25c88]" />
                Module Details
              </h3>
              <p className="text-[12px] text-zinc-400 font-medium pl-6">
                Add a new module to organize your subject lessons and syllabus.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pl-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Module Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Module 1: Introduction to Mechanics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-1 py-2 bg-transparent border-b text-[14px] font-medium focus:outline-none transition-colors duration-200 ${
                    errorFields.title ? "border-red-400" : "border-zinc-200"
                  }`}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f25c88";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                />
                {errorFields.title && (
                  <span className="text-[11px] text-red-500 font-bold">{errorFields.title}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Module Description</label>
                <textarea
                  placeholder="Brief summary or objectives of this module..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 resize-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f25c88";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Start / Release Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f25c88";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                />
              </div>

              <div className="flex items-center gap-3 justify-end mt-2">
                <Link
                  href={`/dashboard/subject/${subject.id}`}
                  className="px-6 py-2.5 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-full text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
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

          {/* Right Column - Info Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6 text-left self-start w-full">
            <div className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
              <div className="flex flex-col gap-1 border-b border-[#E5E1D8]/40 pb-3">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                  Target Subject
                </span>
                <span
                  className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit mb-2"
                  style={{
                    backgroundColor: "#f25c8815",
                    color: "#f25c88",
                    border: "1px solid #f25c8830",
                  }}
                >
                  {subject.room || "Room Online"}
                </span>
                <h2 className="text-[18px] font-black text-[#121212] tracking-tight leading-tight">
                  {subject.name}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[11px] mt-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Lecturers: {subject.lecturers.map((l) => l.name).join(", ")}</span>
                </div>
              </div>

              {subject.description && (
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium bg-[#FAF7F2]/50 p-3.5 border border-[#E5E1D8]/30 rounded-2xl">
                  {subject.description}
                </p>
              )}

              {subject.schedules && subject.schedules.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mb-0.5">
                    Class Schedule
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {subject.schedules.map((sch, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-[11px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3 py-2 border border-[#E5E1D8]/30 rounded-xl"
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {sch.day}
                        </span>
                        <span className="text-zinc-500 text-[10px]">{sch.startTime} - {sch.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E1D8]/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[13px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Info className="w-4.5 h-4.5 text-[#f25c88]" />
                Module Guidelines
              </h3>

              <div className="flex flex-col gap-4 text-[12px] text-zinc-600 font-medium">
                <div className="flex gap-2.5 items-start bg-[#f25c88]/5 p-3 rounded-2xl border border-[#f25c88]/10 text-zinc-800">
                  <Lightbulb className="w-4 h-4 text-[#f25c88] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[12px] block text-[#f25c88] mb-0.5">Syllabus Structure</span>
                    Modules act as structural chapters of your course, containing lessons, reading materials, and homework submission folders.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-zinc-950">Release Dates</span>
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
