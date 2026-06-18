"use client";

import React, { useState, Suspense } from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  GraduationCap,
  Calendar,
  Info,
  Lightbulb,
  FileCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { Lesson } from "../../../../../../types/subject";

interface PageProps {
  params: Promise<{ id: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function CreateLessonInner({ params }: PageProps) {
  const { id } = React.use(params);
  const { subjects, currentUser, updateSubject, showToast } = useLms();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryModuleId = searchParams ? searchParams.get("moduleId") : null;

  const subject = subjects.find((s) => s.id === id);

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [openDate, setOpenDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [closeDate, setCloseDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const year = nextWeek.getFullYear();
    const month = String(nextWeek.getMonth() + 1).padStart(2, "0");
    const day = String(nextWeek.getDate()).padStart(2, "0");
    const hours = String(nextWeek.getHours()).padStart(2, "0");
    const minutes = String(nextWeek.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [closeType, setCloseType] = useState<"restrict" | "open">("open");
  const [type, setType] = useState<"assignment" | "learning" | "quizzes" | "presencion">("learning");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (queryModuleId) {
      setSelectedModuleId(queryModuleId);
    } else if (subject && subject.modules && subject.modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(subject.modules[0].id);
    }
  }, [subject, selectedModuleId, queryModuleId]);

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
            Only the subject creator or lecturer has permissions to create lessons.
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

  if (!subject.modules || subject.modules.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <Header />
        <div className="flex-1 pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/subject/${subject.id}`}
              className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">
                Create New Lesson
              </h1>
            </div>
          </div>

          <div className="w-full border border-dashed border-amber-300 rounded-3xl p-8 bg-amber-50/30 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                            <span className="text-[15px] text-zinc-800 font-semibold">No Modules Found</span>
            <span className="text-[12px] text-zinc-500 font-medium max-w-md mt-1 mb-5">
              Before adding a lesson, you must create at least one course module to house it.
            </span>
            <Link
              href={`/dashboard/subject/${subject.id}/module/create`}
              className="px-6 py-2.5 bg-[#facc15] text-white font-bold rounded-full text-[12px] shadow-md hover:bg-[#d84b72] transition-all"
            >
              Create a Module first
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;
    const newFiles: File[] = [];
    const allowedExtensions = [
      "pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx",
      "png", "jpg", "jpeg", "webp", "txt", "zip", "rar"
    ];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(ext)) {
        showToast(`Invalid file format: ${file.name}. Only PDF, Word, Excel, CSV, PowerPoint, Images, TXT, or ZIP/RAR files are allowed.`, "error");
        continue;
      }
      newFiles.push(file);
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFields({});

    const errors: { [key: string]: string } = {};
    if (!selectedModuleId) {
      errors.moduleId = "Please select a target module.";
    }
    if (!title.trim()) {
      errors.title = "Lesson title is required.";
    }
    if (type !== "learning" && openDate && closeDate && openDate > closeDate) {
      errors.dates = "Open date cannot be later than close date.";
    }

    if (Object.keys(errors).length > 0) {
      setErrorFields(errors);
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

    const newLesson: Lesson = {
      id: newId,
      title: title.trim(),
      desc: desc.trim(),
      type,
      openDate: type !== "learning" ? new Date(openDate).toISOString() : now,
      closeDate: type !== "learning" ? new Date(closeDate).toISOString() : now,
      closeType: type !== "learning" ? closeType : "open",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const updatedModules = subject.modules.map((mod) => {
      if (mod.id === selectedModuleId) {
        return {
          ...mod,
          lessons: [...(mod.lessons || []), newLesson],
        };
      }
      return mod;
    });

    const updatedSubject = {
      ...subject,
      modules: updatedModules,
    };

    setTimeout(async () => {
      await updateSubject(updatedSubject);

      if (selectedFiles.length > 0) {
        try {
          const token = localStorage.getItem("token");
          await Promise.all(selectedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "Attachment");
            const res = await fetch(`${API_BASE_URL}/subjects/${subject.id}/lessons/${newId}/files`, {
              method: "POST",
              headers: token ? { "Authorization": `Bearer ${token}` } : {},
              body: formData,
            });
            if (!res.ok) {
              throw new Error(`Failed to upload ${file.name}`);
            }
          }));
          showToast("Lesson created and files attached successfully!", "success");
        } catch (uploadErr: any) {
          console.error(uploadErr);
          showToast(uploadErr.message || "Failed to upload files, but lesson was created", "error");
        }
      } else {
        showToast("Lesson created successfully!", "success");
      }

      setIsSaving(false);
      setSuccessMessage("Lesson created successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push(`/dashboard/subject/${subject.id}`);
      }, 1000);
    }, 600);
  };

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/subject/${subject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">
              Create New Lesson
            </h1>
          </div>
        </div>

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
              <h3 className="text-[15px] font-semibold text-zinc-800 flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-[#d97706]" />
                Lesson Details
              </h3>
              <p className="text-[12px] text-zinc-400 font-medium pl-6">
                Create and structure learning content inside a designated module.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pl-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Select Target Module *</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none"
                >
                  {subject.modules.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.title}
                    </option>
                  ))}
                </select>
                {errorFields.moduleId && (
                  <span className="text-[11px] text-red-500 font-bold">{errorFields.moduleId}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Lesson Type *</label>
                <div className="grid grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setType("learning")}
                    className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                      type === "learning"
                        ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                        : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    Learning
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("assignment")}
                    className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                      type === "assignment"
                        ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                        : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("quizzes")}
                    className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                      type === "quizzes"
                        ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                        : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    Quizzes
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("presencion")}
                    className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                      type === "presencion"
                        ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                        : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    Presence
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lesson 1.1: Velocity and Acceleration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 bg-zinc-50 border text-[13px] font-semibold text-zinc-800 focus:outline-none rounded-xl ${
                    errorFields.title ? "border-red-400" : "border-[#E5E1D8]/70 focus:border-[#f97316]/50"
                  }`}
                />
                {errorFields.title && (
                  <span className="text-[11px] text-red-500 font-bold">{errorFields.title}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Lesson Description</label>
                <textarea
                  placeholder="Core topics covered, learning outcomes, or reading assignments..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none resize-none"
                />
              </div>

              {/* Lesson Materials / Attachments Section */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
                  Lesson Materials / Attachments
                </label>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mb-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="border border-[#E5E1D8]/70 bg-zinc-50 rounded-xl p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-semibold text-zinc-800 truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-rose-600 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="border-2 border-dashed border-[#E5E1D8]/70 hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-zinc-700">
                      Attach slide decks, PDF, or resources
                    </span>
                    <span className="text-[9px] text-zinc-400 mt-0.5">Formats up to 50MB</span>
                  </div>
                </label>
              </div>

              {type !== "learning" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Open Date</label>
                      <input
                        type="datetime-local"
                        value={openDate}
                        onChange={(e) => setOpenDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Close Date</label>
                      <input
                        type="datetime-local"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none"
                      />
                    </div>
                  </div>
                  {errorFields.dates && (
                    <span className="text-[11px] text-red-500 font-bold">{errorFields.dates}</span>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Submission Restriction</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCloseType("open")}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          closeType === "open"
                            ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950 font-bold"
                            : "border-[#E5E1D8] bg-transparent text-zinc-500 font-semibold hover:border-zinc-300"
                        }`}
                      >
                        <Unlock className="w-4.5 h-4.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-[11px]">Open Submission</span>
                          <span className="text-[8.5px] text-zinc-400 font-semibold mt-0.5 text-center leading-tight">Allows late uploads</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCloseType("restrict")}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          closeType === "restrict"
                            ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950 font-bold"
                            : "border-[#E5E1D8] bg-transparent text-zinc-500 font-semibold hover:border-zinc-300"
                        }`}
                      >
                        <Lock className="w-4.5 h-4.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-[11px]">Restricted</span>
                          <span className="text-[8.5px] text-zinc-400 font-semibold mt-0.5 text-center leading-tight">Locks after close date</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 justify-end mt-2">
                <Link
                  href={`/dashboard/subject/${subject.id}`}
                  className="px-6 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 font-semibold text-[11px] bg-white transition-all cursor-pointer"
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
                  Create Lesson
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Info Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6 text-left self-start w-full">
            <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-[#E5E1D8]/70 pb-3">
                <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider mb-1">
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
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium bg-zinc-50 p-3.5 border border-[#E5E1D8]/70 rounded-2xl">
                  {subject.description}
                </p>
              )}

              {subject.modules && subject.modules.length > 0 && (
                <div className="flex flex-col gap-2 pt-1 border-t border-[#E5E1D8]/70 mt-1">
                  <span className="text-[9px] font-semibold text-zinc-800 uppercase tracking-wider mb-0.5">
                    Current Modules ({subject.modules.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {subject.modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex justify-between items-center text-[10.5px] font-semibold text-zinc-800 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl"
                      >
                        <span className="truncate pr-2">{mod.title}</span>
                        <span className="text-zinc-400 text-[9px] flex-shrink-0">
                          {mod.lessons ? mod.lessons.length : 0} lessons
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-4">
              <h3 className="text-[13px] font-semibold text-zinc-800 flex items-center gap-2 pb-2 border-b border-[#E5E1D8]/70">
                <Info className="w-4.5 h-4.5 text-[#d97706]" />
                Lesson Guidelines
              </h3>

              <div className="flex flex-col gap-4 text-[12px] text-zinc-600 font-medium">
                <div className="flex gap-2.5 items-start bg-[#facc15]/5 p-3 rounded-2xl border border-[#f97316]/10 text-zinc-800">
                  <Lightbulb className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[12px] block text-[#d97706] mb-0.5">Lesson Placement</span>
                    Lessons must reside inside a module segment. They act as actual lecture dates containing materials, notes, and file upload dropzones.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-zinc-50 p-3 rounded-2xl border border-[#E5E1D8]/70">
                  <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-800">Locking Policy</span>
                    By enabling *Restricted Submission*, the submission slot locks down automatically on the close date, rejecting any late files from students.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-zinc-50 p-3 rounded-2xl border border-[#E5E1D8]/70">
                  <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-800">Submissions</span>
                    Students can submit their assignments directly within the lesson row in the main syllabus detail view.
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

export default function CreateLessonPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-[14px] text-zinc-500 font-bold">Loading lesson creation...</div>}>
      <CreateLessonInner params={params} />
    </Suspense>
  );
}
