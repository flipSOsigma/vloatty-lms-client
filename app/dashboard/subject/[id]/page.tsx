"use client";

import React, { useState } from "react";
import Header from "../../../../components/views/Header";
import EventModal from "../../../../components/views/EventModal";
import { useLms } from "../../../../context/LmsContext";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  UploadCloud,
  FileCheck,
  X,
  Calendar,
  Plus,
  Users,
  MoreHorizontal,
  User,
  Mail,
  UserCheck,
  UserMinus,
  Edit,
  Trash2,
} from "lucide-react";
import ContextMenu from "../../../../components/ui/ContextMenu";

interface PageProps {
  params: Promise<{ id: string }>;
}

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return isoString;
  }
};

export default function SubjectDetailPage({ params }: PageProps) {

  const { id } = React.use(params);
  const { subjects, currentUser, showToast, updateSubject } = useLms();

  const [uploadedFiles, setUploadedFiles] = useState<{ [lessonId: string]: { name: string; size: string } }>({});
  const [uploadingProgress, setUploadingProgress] = useState<{ [lessonId: string]: number }>({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<{ userId: string; name: string; email: string; role: string } | null>(null);

  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: any } | null>(null);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === id);

  const hasEditPermission = selectedSubject && currentUser && (selectedSubject.createdBy === currentUser.id || selectedSubject.lecturers.some((l) => l.userId === currentUser.id));

  const handleEditModule = (mod: any) => {
    setEditingModule({
      id: mod.id,
      title: mod.title,
      desc: mod.desc,
      date: mod.date.split("T")[0]
    });
    setShowEditModuleModal(true);
  };

  const handleSaveModule = async () => {
    if (!selectedSubject || !editingModule || !editingModule.title.trim()) return;
    const updatedModules = selectedSubject.modules.map((m) =>
      m.id === editingModule.id ? { ...m, title: editingModule.title.trim(), desc: editingModule.desc.trim(), date: new Date(editingModule.date).toISOString() } : m
    );
    const updatedSubject = { ...selectedSubject, modules: updatedModules };
    await updateSubject(updatedSubject);
    setShowEditModuleModal(false);
    setEditingModule(null);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedSubject) return;
    if (!confirm("Are you sure you want to delete this module?")) return;
    const updatedModules = selectedSubject.modules.filter((m) => m.id !== moduleId);
    const updatedSubject = { ...selectedSubject, modules: updatedModules };
    await updateSubject(updatedSubject);
  };

  const handleEditLesson = (moduleId: string, lesson: any) => {
    let openD = lesson.openDate;
    let closeD = lesson.closeDate;
    try {
      const openDateObj = new Date(lesson.openDate);
      const closeDateObj = new Date(lesson.closeDate);
      
      const formatToDateTimeLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      openD = formatToDateTimeLocal(openDateObj);
      closeD = formatToDateTimeLocal(closeDateObj);
    } catch (e) {}

    setEditingLesson({
      moduleId,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        desc: lesson.desc,
        type: lesson.type,
        openDate: openD,
        closeDate: closeD,
        closeType: lesson.closeType || "open"
      }
    });
    setShowEditLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!selectedSubject || !editingLesson || !editingLesson.lesson.title.trim()) return;
    const { moduleId, lesson } = editingLesson;
    const updatedModules = selectedSubject.modules.map((m) => {
      if (m.id === moduleId) {
        const updatedLessons = m.lessons.map((l) =>
          l.id === lesson.id ? {
            ...l,
            title: lesson.title.trim(),
            desc: lesson.desc.trim(),
            type: lesson.type,
            openDate: new Date(lesson.openDate).toISOString(),
            closeDate: new Date(lesson.closeDate).toISOString(),
            closeType: lesson.closeType
          } : l
        );
        return { ...m, lessons: updatedLessons };
      }
      return m;
    });
    const updatedSubject = { ...selectedSubject, modules: updatedModules };
    await updateSubject(updatedSubject);
    setShowEditLessonModal(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!selectedSubject) return;
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    const updatedModules = selectedSubject.modules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
      }
      return m;
    });
    const updatedSubject = { ...selectedSubject, modules: updatedModules };
    await updateSubject(updatedSubject);
  };

  const handleSimulatedUpload = (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";

    setUploadingProgress((prev) => ({ ...prev, [lessonId]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadingProgress((prev) => ({ ...prev, [lessonId]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadedFiles((prev) => ({ ...prev, [lessonId]: { name: fileName, size: fileSize } }));
          setUploadingProgress((prev) => {
            const copy = { ...prev };
            delete copy[lessonId];
            return copy;
          });
        }, 200);
      }
    }, 150);
  };

  const handleRemoveFile = (lessonId: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[lessonId];
      return copy;
    });
  };



  if (!selectedSubject) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Subject not found.</span>
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



  return (
    <>
      {}
      <Header />

      {}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
        {}
        <div className="flex items-center justify-between mt-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E1D8] rounded-full hover:bg-zinc-100 font-bold text-[12px] text-zinc-700 cursor-pointer transition-colors shadow-sm bg-white/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subjects</span>
        </Link>

        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Syllabus Detail
        </span>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
        {}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-0">
          <div className="bg-white/40 border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span
                className={`inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit ${
                  selectedSubject.color === "yellow"
                    ? "bg-amber-100 text-amber-800"
                    : selectedSubject.color === "blue"
                    ? "bg-blue-100 text-blue-800"
                    : !selectedSubject.color || selectedSubject.color.startsWith("#")
                    ? ""
                    : "bg-zinc-200 text-zinc-800"
                }`}
                style={
                  selectedSubject.color && selectedSubject.color.startsWith("#")
                    ? {
                        backgroundColor: `${selectedSubject.color}15`,
                        color: selectedSubject.color,
                        border: `1px solid ${selectedSubject.color}30`
                      }
                    : {}
                }
              >
                {selectedSubject.room || "Room Online"}
              </span>
              <h2 className="text-2xl font-black text-[#121212] tracking-tight mt-2 leading-tight">
                {selectedSubject.name}
              </h2>
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[13px] mt-1">
                <GraduationCap className="w-4 h-4" />
                <span>Lecturers: {selectedSubject.lecturers.map((l) => l.name).join(", ")}</span>
              </div>
            </div>

            {selectedSubject.description && (
              <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-[#FAF7F2]/50 p-4 border border-[#E5E1D8]/30 rounded-2xl">
                {selectedSubject.description}
              </p>
            )}

            {}
            {selectedSubject.schedules && selectedSubject.schedules.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                  Class Schedule
                </span>
                <div className="flex flex-col gap-1.5">
                  {selectedSubject.schedules.map((sch, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[12px] font-bold text-zinc-700 bg-[#FAF7F2]/50 px-3.5 py-2 border border-[#E5E1D8]/30 rounded-xl"
                    >
                      <span>{sch.day}</span>
                      <span className="text-zinc-500 text-[11px]">{sch.startTime} - {sch.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSubject && currentUser && selectedSubject.createdBy === currentUser.id && (
              <Link
                href={`/dashboard/subject/${selectedSubject.id}/manage`}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-[#f25c88] hover:bg-[#d84b72] text-white font-bold text-[12px] rounded-2xl transition-all cursor-pointer shadow-sm active:scale-[0.98] mt-2 text-center"
              >
                <span>Manage Subject</span>
              </Link>
            )}
          </div>

          {(() => {
            interface CourseMember {
              userId: string;
              name: string;
              email: string;
              role: "Owner" | "Lecturer" | "Participant";
            }
            const courseMembers: CourseMember[] = [];
            if (selectedSubject.createdBy) {
              courseMembers.push({
                userId: selectedSubject.createdBy,
                name: selectedSubject.creatorName || "Subject Owner",
                email: selectedSubject.creatorEmail || "",
                role: "Owner"
              });
            }
            if (selectedSubject.lecturers) {
              selectedSubject.lecturers.forEach((l) => {
                if (l.userId !== selectedSubject.createdBy && !courseMembers.some(m => m.userId === l.userId)) {
                  courseMembers.push({
                    userId: l.userId,
                    name: l.name,
                    email: l.email || "",
                    role: "Lecturer"
                  });
                }
              });
            }
            if (selectedSubject.participants) {
              selectedSubject.participants.forEach((p) => {
                if (p.userId !== selectedSubject.createdBy && !courseMembers.some(m => m.userId === p.userId)) {
                  courseMembers.push({
                    userId: p.userId,
                    name: p.name,
                    email: p.email || "",
                    role: "Participant"
                  });
                }
              });
            }

            return (
              <div className="bg-white/40 border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5E1D8]/45 pb-2">
                  <h3 className="text-[14px] font-extrabold text-[#121212] flex items-center gap-2 tracking-tight">
                    <Users className="w-4.5 h-4.5 text-[#f25c88]" />
                    Course Members
                  </h3>
                  <span className="bg-zinc-800 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {courseMembers.length}
                  </span>
                </div>

                {courseMembers.length === 0 ? (
                  <div className="text-center py-4">
                    <span className="text-[11.5px] text-zinc-400 font-semibold">No members found.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {courseMembers.map((member) => {
                      const initials = member.name
                        ? member.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                        : "?";
                      
                      return (
                        <div key={member.userId} className="flex items-center justify-between p-1 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0"
                              style={{
                                backgroundColor: selectedSubject.color && selectedSubject.color.startsWith("#")
                                  ? `${selectedSubject.color}15`
                                  : "rgba(242, 92, 136, 0.08)",
                                color: selectedSubject.color && selectedSubject.color.startsWith("#")
                                  ? selectedSubject.color
                                  : "#f25c88",
                                borderColor: selectedSubject.color && selectedSubject.color.startsWith("#")
                                  ? `${selectedSubject.color}20`
                                  : "rgba(242, 92, 136, 0.12)"
                              }}
                            >
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12.5px] font-bold text-zinc-950 truncate">
                                {member.name}
                              </span>
                              {member.email && (
                                <span className="text-[10px] text-zinc-400 font-semibold truncate -mt-0.5">
                                  {member.email}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pl-2">
                            {member.role === "Owner" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#f25c88]/10 text-[#f25c88] border border-[#f25c88]/15 uppercase tracking-wide">
                                Owner
                              </span>
                            )}
                            {member.role === "Lecturer" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50 uppercase tracking-wide">
                                Lecturer
                              </span>
                            )}
                            {member.role === "Participant" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50 uppercase tracking-wide">
                                Student
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSelectedMember(member);
                                setMenuPos({ x: e.clientX, y: e.clientY });
                                setMenuOpen(true);
                              }}
                              className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h3 className="text-[17px] font-extrabold text-[#121212] tracking-tight">
              Course Modules & Lessons
            </h3>
            {selectedSubject && currentUser && (selectedSubject.createdBy === currentUser.id || selectedSubject.lecturers.some((l) => l.userId === currentUser.id)) && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/module/create`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E1D8] hover:bg-zinc-100 font-bold text-[11px] text-[#f25c88] cursor-pointer transition-colors shadow-sm bg-white/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </Link>
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/lesson/create`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E1D8] hover:bg-zinc-100 font-bold text-[11px] text-[#f25c88] cursor-pointer transition-colors shadow-sm bg-white/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </Link>
              </div>
            )}
          </div>

          {selectedSubject.modules.length === 0 ? (
            <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl">
              <span className="text-[13px] text-zinc-400 font-semibold">No modules registered yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {selectedSubject.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white/40 border border-[#E5E1D8]/50 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#E5E1D8]/40 pb-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/dashboard/subject/${selectedSubject.id}/module/${mod.id}`}
                        className="hover:text-[#f25c88] transition-colors"
                      >
                        <h4 className="text-[16px] font-extrabold text-[#121212]">
                          {mod.title}
                        </h4>
                      </Link>
                      <p className="text-[11.5px] text-zinc-500 font-semibold leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasEditPermission && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditModule(mod)}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#f25c88] bg-[#f25c88]/10 px-3 py-1 rounded-full w-fit">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(mod.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    {mod.lessons.map((lesson) => {
                      const isUploading = uploadingProgress[lesson.id] !== undefined;
                      const progress = uploadingProgress[lesson.id] || 0;
                      const isUploaded = uploadedFiles[lesson.id] !== undefined;
                      const fileInfo = uploadedFiles[lesson.id];

                      return (
                        <div
                          key={lesson.id}
                          className="bg-[#FAF7F2]/60 border border-[#E5E1D8]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-6"
                        >
                          <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-start justify-between w-full">
                              <div className="flex flex-col items-start gap-1.5">
                                <span className="p-1 bg-[#121212] rounded text-white text-[9px] font-bold uppercase tracking-wide w-fit">
                                  {lesson.type || "learning"}
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="hover:text-[#f25c88] transition-colors"
                                >
                                  <h5 className="text-[13.5px] font-bold text-zinc-950">
                                    {lesson.title}
                                  </h5>
                                </Link>
                              </div>
                              {hasEditPermission && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditLesson(mod.id, lesson)}
                                    className="p-1 rounded-lg hover:bg-[#FAF7F2] text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                    className="p-1 rounded-lg hover:bg-[#FAF7F2] text-zinc-400 hover:text-red-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                              {lesson.desc}
                            </p>
                          </div>

                          <div className="w-full md:w-[260px] flex flex-col gap-2">
                            {lesson.type === "learning" ? (
                              <>
                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                  Study Material
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-3 flex items-center justify-center gap-2 text-zinc-700 font-bold text-[12px] transition-all"
                                >
                                  <span>View Lesson</span>
                                </Link>
                              </>
                            ) : lesson.type === "quizzes" ? (
                              <>
                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                  Quiz Launchpad
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-3 flex items-center justify-center gap-2 text-zinc-700 font-bold text-[12px] transition-all"
                                >
                                  <span>Open Quiz</span>
                                </Link>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                  Homework Submission
                                </span>

                                {isUploading ? (
                                  <div className="border border-[#E5E1D8] bg-white rounded-xl p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                                      <span>Uploading file...</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-100">
                                      <div
                                        className="h-full bg-[#f25c88] rounded-full transition-all duration-150"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : isUploaded && fileInfo ? (
                                  <div className="border border-emerald-500/25 bg-emerald-500/[0.03] rounded-xl p-3 flex items-center justify-between gap-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-bold text-zinc-800 truncate">
                                          {fileInfo.name}
                                        </span>
                                        <span className="text-[9px] text-zinc-400 font-semibold">
                                          {fileInfo.size} • Submitted
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(lesson.id)}
                                      className="p-1 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleSimulatedUpload(lesson.id, e)}
                                    />
                                    <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[11px] font-bold text-zinc-800">
                                        Click to upload PDF
                                      </span>
                                      <span className="text-[9px] text-zinc-400 mt-0.5">
                                        Max size: 10MB
                                      </span>
                                    </div>
                                  </label>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      </div>

      <ContextMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        x={menuPos.x}
        y={menuPos.y}
        options={[
          {
            label: "See Profile",
            icon: User,
            onClick: () => {
              if (selectedMember) {
                showToast(`Viewing profile of ${selectedMember.name}`, "success");
              }
            }
          },
          {
            label: "Contact",
            icon: Mail,
            onClick: () => {
              if (selectedMember) {
                if (selectedMember.email) {
                  showToast(`Opening contact channel for ${selectedMember.email}`, "success");
                } else {
                  showToast(`No email found for ${selectedMember.name}`, "error");
                }
              }
            }
          },
          ...(selectedSubject.createdBy === currentUser?.id && selectedMember && selectedMember.role !== "Owner"
            ? [
                {
                  label: "Change Role",
                  icon: UserCheck,
                  onClick: () => {
                    if (selectedMember) {
                      showToast(`Role change flow initiated for ${selectedMember.name}`, "success");
                    }
                  }
                },
                {
                  label: "Kick User",
                  icon: UserMinus,
                  danger: true,
                  onClick: async () => {
                    if (selectedMember) {
                      if (selectedMember.role === "Lecturer") {
                        showToast(`Cannot kick lecturers from here. Manage lecturers in edit page.`, "error");
                        return;
                      }
                      
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                      const token = localStorage.getItem("token");
                      
                      try {
                        const res = await fetch(`${API_BASE_URL}/subjects/${selectedSubject.id}/participants/${selectedMember.userId}`, {
                          method: "DELETE",
                          headers: {
                            ...(token ? { "Authorization": `Bearer ${token}` } : {})
                          }
                        });
                        if (!res.ok) {
                          const errorData = await res.json().catch(() => ({}));
                          throw new Error(errorData.error || "Failed to kick participant");
                        }
                        showToast(`Successfully kicked ${selectedMember.name} from the subject!`, "success");
                        setTimeout(() => {
                          window.location.reload();
                        }, 800);
                      } catch (err: any) {
                        showToast(err.message || "Failed to kick participant", "error");
                      }
                    }
                  }
                }
              ]
            : [])
        ]}
      />

      <EventModal />

      {showEditModuleModal && editingModule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E1D8]/50">
              <h3 className="text-[16px] font-black text-[#121212]">Edit Module</h3>
              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                }}
                className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Title</label>
                <input
                  type="text"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                  value={editingModule.desc}
                  onChange={(e) => setEditingModule({ ...editingModule, desc: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Date</label>
                <input
                  type="date"
                  value={editingModule.date}
                  onChange={(e) => setEditingModule({ ...editingModule, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5E1D8]/50">
              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                }}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModule}
                className="px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditLessonModal && editingLesson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E1D8]/50">
              <h3 className="text-[16px] font-black text-[#121212]">Edit Lesson</h3>
              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Title</label>
                <input
                  type="text"
                  value={editingLesson.lesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, title: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                  value={editingLesson.lesson.desc}
                  onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, desc: e.target.value } })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Type</label>
                <select
                  value={editingLesson.lesson.type}
                  onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, type: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="learning">Learning Material</option>
                  <option value="assignment">Assignment</option>
                  <option value="quizzes">Quiz</option>
                </select>
              </div>
              {editingLesson.lesson.type !== "learning" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase">Open Date</label>
                    <input
                      type="datetime-local"
                      value={editingLesson.lesson.openDate}
                      onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, openDate: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase">Close Date</label>
                    <input
                      type="datetime-local"
                      value={editingLesson.lesson.closeDate}
                      onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, closeDate: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase">Submission Restriction</label>
                    <select
                      value={editingLesson.lesson.closeType}
                      onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, closeType: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-[13px] bg-[#FAF9F5] focus:bg-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="open">Open (Accept Late Submissions)</option>
                      <option value="restrict">Strict (Block Late Submissions)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5E1D8]/50">
              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="px-4 py-2 bg-zinc-150 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
