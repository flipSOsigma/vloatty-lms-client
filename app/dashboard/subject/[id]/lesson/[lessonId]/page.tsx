"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  Unlock,
  BookOpen,
  FileCheck,
  UploadCloud,
  X,
  GraduationCap,
  Check,
  AlertTriangle,
  Lightbulb,
  Pencil,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  } catch (e) {
    return isoString;
  }
};

function LessonDetailInner({ params }: PageProps) {
  const { id, lessonId } = React.use(params);
  const { subjects, currentUser, updateSubject } = useLms();
  const searchParams = useSearchParams();
  const shouldEdit = searchParams ? searchParams.get("edit") === "true" : false;

  const selectedSubject = subjects.find((s) => s.id === id);
  let selectedModule: any = null;
  let selectedLesson: any = null;

  if (selectedSubject) {
    for (const mod of selectedSubject.modules) {
      const les = mod.lessons.find((l) => l.id === lessonId);
      if (les) {
        selectedModule = mod;
        selectedLesson = les;
        break;
      }
    }
  }

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [attachingProgress, setAttachingProgress] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("");
  const [editOpenDate, setEditOpenDate] = useState("");
  const [editCloseDate, setEditCloseDate] = useState("");
  const [editCloseType, setEditCloseType] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`attached_file_${lessonId}`);
    if (saved) {
      try {
        setAttachedFile(JSON.parse(saved));
      } catch (e) {}
    }
  }, [lessonId]);

  const saveAttachedFile = (file: { name: string; size: string } | null) => {
    setAttachedFile(file);
    if (file) {
      localStorage.setItem(`attached_file_${lessonId}`, JSON.stringify(file));
    } else {
      localStorage.removeItem(`attached_file_${lessonId}`);
    }
  };

  const isLocked =
    selectedLesson &&
    selectedLesson.type === "assignment" &&
    selectedLesson.closeType === "restrict" &&
    new Date(selectedLesson.closeDate) < new Date();

  const isCreator = selectedSubject && currentUser?.id === selectedSubject.createdBy;
  const isLecturer = selectedSubject && selectedSubject.lecturers.some((l) => l.userId === currentUser?.id);
  const canEdit = isCreator || isLecturer;

  const startEditing = () => {
    if (!selectedLesson) return;
    setEditTitle(selectedLesson.title);
    setEditDesc(selectedLesson.desc);
    setEditType(selectedLesson.type);
    try {
      setEditOpenDate(new Date(selectedLesson.openDate).toISOString().slice(0, 16));
    } catch (e) {
      setEditOpenDate("");
    }
    try {
      setEditCloseDate(new Date(selectedLesson.closeDate).toISOString().slice(0, 16));
    } catch (e) {
      setEditCloseDate("");
    }
    setEditCloseType(selectedLesson.closeType);
    setIsEditing(true);
  };

  useEffect(() => {
    if (shouldEdit && canEdit && selectedLesson && !isEditing) {
      startEditing();
    }
  }, [shouldEdit, canEdit, selectedLesson]);

  if (!selectedSubject || !selectedLesson) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Lesson not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-[#121212] text-white font-bold rounded-full text-[12px] shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";

    setUploadingProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadedFile({ name: fileName, size: fileSize });
          setUploadingProgress(null);
        }, 200);
      }
    }, 150);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedSubject) return;

    const updatedLessons = selectedModule.lessons.map((l: any) =>
      l.id === selectedLesson.id
        ? {
            ...l,
            title: editTitle,
            desc: editDesc,
            type: editType,
            openDate: new Date(editOpenDate).toISOString(),
            closeDate: new Date(editCloseDate).toISOString(),
            closeType: editCloseType,
          }
        : l
    );

    const updatedModules = selectedSubject.modules.map((m: any) =>
      m.id === selectedModule.id ? { ...m, lessons: updatedLessons } : m
    );

    const updatedSubject = {
      ...selectedSubject,
      modules: updatedModules,
    };

    await updateSubject(updatedSubject);
    setIsEditing(false);
  };

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mt-1">
          <Link
            href={`/dashboard/subject/${selectedSubject.id}`}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E1D8] rounded-full hover:bg-zinc-100 font-bold text-[12px] text-zinc-700 cursor-pointer transition-colors shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Subject</span>
          </Link>

          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] cursor-pointer transition-colors shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Lesson</span>
              </button>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Lesson Detail
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isEditing ? (
              <form
                onSubmit={handleSave}
                className="bg-white border border-[#EBE8E0] rounded-3xl p-8 shadow-sm flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lesson Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                  >
                    <option value="learning">Learning Material</option>
                    <option value="assignment">Assignment</option>
                    <option value="quizzes">Quiz</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={6}
                    className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lesson Materials / Attachments
                  </label>
                  {attachingProgress !== null ? (
                    <div className="border border-[#E5E1D8] bg-white rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[11px] font-bold text-zinc-500">
                        <span>Attaching file...</span>
                        <span>{attachingProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-100">
                        <div
                          className="h-full bg-[#f25c88] rounded-full transition-all duration-150"
                          style={{ width: `${attachingProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : attachedFile ? (
                    <div className="border border-[#E5E1D8] bg-[#FAF7F2]/40 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-5 h-5 text-zinc-500 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold text-zinc-800 truncate">
                            {attachedFile.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {attachedFile.size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveAttachedFile(null)}
                        className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const name = file.name;
                          const size = (file.size / 1024).toFixed(1) + " KB";
                          setAttachingProgress(0);
                          let progress = 0;
                          const interval = setInterval(() => {
                            progress += 25;
                            setAttachingProgress(progress);
                            if (progress >= 100) {
                              clearInterval(interval);
                              setTimeout(() => {
                                saveAttachedFile({ name, size });
                                setAttachingProgress(null);
                              }, 200);
                            }
                          }, 100);
                        }}
                      />
                      <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-zinc-700">
                          Attach slide decks, PDF, or resources
                        </span>
                        <span className="text-[9px] text-zinc-400 mt-0.5">Formats up to 50MB</span>
                      </div>
                    </label>
                  )}
                </div>

                {(editType === "assignment" || editType === "quizzes") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Open Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editOpenDate}
                        onChange={(e) => setEditOpenDate(e.target.value)}
                        required
                        className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Close Date
                      </label>
                      <input
                        type="datetime-local"
                        value={editCloseDate}
                        onChange={(e) => setEditCloseDate(e.target.value)}
                        required
                        className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Restricting Policy
                      </label>
                      <select
                        value={editCloseType}
                        onChange={(e) => setEditCloseType(e.target.value)}
                        className="px-4 py-3 border border-[#E5E1D8] rounded-xl text-[14px] font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                      >
                        <option value="open">Open Submission Policy (Allows late submissions)</option>
                        <option value="restrict">Strict Deadline Restriction (Locks on due date)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[12px] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-[#EBE8E0] rounded-3xl p-8 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#121212] text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                      {selectedLesson.type || "learning"}
                    </span>
                    {selectedModule && (
                      <span className="text-[12px] font-bold text-zinc-400">
                        Module: {selectedModule.title}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-black text-[#121212] tracking-tight leading-tight mt-1">
                    {selectedLesson.title}
                  </h2>
                </div>

                <div className="text-[14px] text-zinc-600 leading-relaxed font-medium bg-[#FAF7F2]/40 p-6 border border-[#E5E1D8]/20 rounded-2xl whitespace-pre-wrap">
                  {selectedLesson.desc || "No description provided for this lesson."}
                </div>

                {attachedFile && (
                  <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6">
                    <h3 className="text-[12px] font-extrabold text-[#121212] tracking-tight uppercase">
                      Lesson Materials / Attachments
                    </h3>
                    <div className="border border-[#E5E1D8] bg-[#FAF7F2]/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="w-5 h-5 text-zinc-500 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-zinc-800 truncate">
                            {attachedFile.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {attachedFile.size}
                          </span>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("File downloading simulated!");
                        }}
                        className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[11px] shadow-sm transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {selectedLesson.type === "learning" && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                    <div className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[#f25c88]" />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-zinc-800">
                            Learning Completion
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Mark this material as read when finished studying.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCompleted(!isCompleted)}
                        className={`px-5 py-2.5 rounded-full font-bold text-[12px] transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCompleted
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                            : "border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{isCompleted ? "Completed" : "Mark as Completed"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedLesson.type === "assignment" && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                    <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight mb-2">
                      Submit Homework
                    </h3>

                    {isLocked ? (
                      <div className="border border-red-200 bg-red-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-[14px] text-red-600 font-bold">Submission Closed</span>
                        <span className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1">
                          This assignment was locked on {formatDate(selectedLesson.closeDate)} and is
                          no longer accepting submissions.
                        </span>
                      </div>
                    ) : uploadingProgress !== null ? (
                      <div className="border border-[#E5E1D8] bg-white rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[12px] font-bold text-zinc-500">
                          <span>Uploading document...</span>
                          <span>{uploadingProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-100">
                          <div
                            className="h-full bg-[#f25c88] rounded-full transition-all duration-150"
                            style={{ width: `${uploadingProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : uploadedFile ? (
                      <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-zinc-800 truncate">
                              {uploadedFile.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {uploadedFile.size} • Submitted successfully
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleSimulatedUpload}
                        />
                        <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                        <div className="flex flex-col items-center">
                          <span className="text-[12px] font-bold text-zinc-800">
                            Click to upload your assignment
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            PDF or Document formats up to 10MB
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                )}

                {selectedLesson.type === "quizzes" && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                    <div className="border border-[#E5E1D8] bg-[#FAF9F5]/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                      <BookOpen className="w-10 h-10 text-[#f25c88] mb-3" />
                      <span className="text-[15px] text-zinc-800 font-bold">Online Quiz Launchpad</span>
                      <span className="text-[12px] text-zinc-500 font-medium max-w-md mt-1.5 mb-5">
                        This lesson contains an online quiz. The Quiz Maker and Quiz Portal are being
                        prepared and will be available soon.
                      </span>
                      <button
                        disabled
                        className="px-6 py-2.5 bg-zinc-200 text-zinc-400 font-bold rounded-full text-[12px] cursor-not-allowed"
                      >
                        Quiz Launchpad (Coming Soon)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white/40 border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-[#E5E1D8]/40 pb-2">
                Lesson Meta Info
              </span>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Subject Name
                  </span>
                  <span className="text-[13px] font-bold text-zinc-800">
                    {selectedSubject.name}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lecturers
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-[12px]">
                    <GraduationCap className="w-4 h-4 text-zinc-400" />
                    <span>{selectedSubject.lecturers.map((l) => l.name).join(", ")}</span>
                  </div>
                </div>

                {selectedLesson.type !== "learning" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Availability Window
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-[12px]">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span>Open: {formatDate(selectedLesson.openDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-[12px]">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>Due: {formatDate(selectedLesson.closeDate)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Restricting Policy
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-[12px]">
                        {selectedLesson.closeType === "restrict" ? (
                          <>
                            <Lock className="w-4 h-4 text-[#f25c88]" />
                            <span>Strict Deadline Restriction</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 text-emerald-600" />
                            <span>Open Submission Policy</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#EBE8E0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[13px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Lightbulb className="w-4 h-4 text-[#f25c88]" />
                Resource Tips
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                Use your desktop or mobile device to upload files directly. Submissions are tracked
                and recorded automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LessonDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-[14px] text-zinc-500 font-bold">Loading lesson details...</div>}>
      <LessonDetailInner params={params} />
    </Suspense>
  );
}
