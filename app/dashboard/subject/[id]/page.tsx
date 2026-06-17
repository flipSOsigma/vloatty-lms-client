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
  Trophy,
} from "lucide-react";
import ContextMenu from "../../../../components/ui/ContextMenu";
import ConfirmModal from "../../../../components/ui/ConfirmModal";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SubjectDetailPage({ params }: PageProps) {

  const { id } = React.use(params);
  const { subjects, currentUser, showToast, updateSubject } = useLms();

  const [uploadedFiles, setUploadedFiles] = useState<{ [lessonId: string]: { name: string; size: string } }>({});
  const [uploadingProgress, setUploadingProgress] = useState<{ [lessonId: string]: number }>({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<{ userId: string; name: string; email: string; role: string } | null>(null);

  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [deleteLessonInfo, setDeleteLessonInfo] = useState<{ moduleId: string; lessonId: string; title: string } | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [deleteModuleInfo, setDeleteModuleInfo] = useState<{ moduleId: string; title: string } | null>(null);
  const [isDeletingModule, setIsDeletingModule] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === id);

  const [quizzesData, setQuizzesData] = useState<{ [lessonId: string]: { settings: any, attempts: any[] } }>({});

  React.useEffect(() => {
    if (!selectedSubject) return;
    const quizLessons = selectedSubject.modules.flatMap(m => m.lessons).filter(l => l.type === "quizzes");
    if (quizLessons.length === 0) return;

    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
      const dataMap: any = {};

      await Promise.all(quizLessons.map(async (lesson) => {
        try {
          const quizRes = await fetch(`${API_BASE_URL}/lessons/${lesson.id}/quiz`, { headers });
          if (quizRes.ok) {
            const quiz = await quizRes.json();
            
            let attempts: any[] = [];
            const isCreator = selectedSubject.createdBy === currentUser?.id;
            const isLecturer = selectedSubject.lecturers?.some((l: any) => l.userId === currentUser?.id);
            const canEdit = isCreator || isLecturer;

            if (quiz.showLeaderboard || canEdit) {
              const attemptsRes = await fetch(`${API_BASE_URL}/lessons/${lesson.id}/quiz/attempts`, { headers });
              if (attemptsRes.ok) {
                attempts = await attemptsRes.json();
              }
            }
            dataMap[lesson.id] = { settings: quiz, attempts };
          }
        } catch (e) {
          console.error(`Error fetching quiz data for lesson ${lesson.id}:`, e);
        }
      }));

      setQuizzesData(dataMap);
    };

    fetchAll();
  }, [selectedSubject, currentUser]);

  React.useEffect(() => {
    if (selectedSubject) {
      document.title = `${selectedSubject.name} - VLOATTY Learning Management System`;
    }
  }, [selectedSubject]);

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

  const confirmDeleteLesson = async () => {
    if (!selectedSubject || !deleteLessonInfo) return;
    setIsDeletingLesson(true);
    try {
      const { moduleId, lessonId } = deleteLessonInfo;
      const updatedModules = selectedSubject.modules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
        }
        return m;
      });
      const updatedSubject = { ...selectedSubject, modules: updatedModules };
      await updateSubject(updatedSubject);
      showToast("Lesson deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete lesson.", "error");
    } finally {
      setIsDeletingLesson(false);
      setDeleteLessonInfo(null);
    }
  };

  const confirmDeleteModule = async () => {
    if (!selectedSubject || !deleteModuleInfo) return;
    setIsDeletingModule(true);
    try {
      const { moduleId } = deleteModuleInfo;
      const updatedModules = selectedSubject.modules.filter((m) => m.id !== moduleId);
      const updatedSubject = { ...selectedSubject, modules: updatedModules };
      await updateSubject(updatedSubject);
      showToast("Module deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete module.", "error");
    } finally {
      setIsDeletingModule(false);
      setDeleteModuleInfo(null);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedSubject || !currentUser) return;
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};

      const assignmentLessons: string[] = [];
      selectedSubject.modules.forEach((mod) => {
        mod.lessons.forEach((les) => {
          if (les.type === "assignment") {
            assignmentLessons.push(les.id);
          }
        });
      });

      const tempUploadedFiles: { [lessonId: string]: { name: string; size: string; path?: string } } = {};
      
      await Promise.all(
        assignmentLessons.map(async (lessonId) => {
          try {
            const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/my-submission`, { headers });
            if (res.ok) {
              const data = await res.json();
              if (data) {
                tempUploadedFiles[lessonId] = {
                  name: data.fileName,
                  size: (data.fileSize / 1024).toFixed(1) + " KB",
                  path: data.filePath,
                };
              }
            }
          } catch (e) {
            console.error("Error fetching submission for lesson:", lessonId, e);
          }
        })
      );

      setUploadedFiles(tempUploadedFiles);
    } catch (e) {
      console.error("Error in fetchSubmissions:", e);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, [selectedSubject, currentUser]);

  const handleSimulatedUpload = async (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let moduleName = "module";
    let lessonName = "lesson";
    if (selectedSubject) {
      for (const mod of selectedSubject.modules) {
        const les = mod.lessons.find((l) => l.id === lessonId);
        if (les) {
          moduleName = mod.title;
          lessonName = les.title;
          break;
        }
      }
    }

    const extension = file.name.split(".").pop() || "";
    const studentName = currentUser?.name || "student";
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const newFileName = `${sanitize(studentName)}-${sanitize(moduleName)}-${sanitize(lessonName)}-${dateStr}-${id}.${extension}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);

    setUploadingProgress((prev) => ({ ...prev, [lessonId]: 0 }));
    try {
      const token = localStorage.getItem("token");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/lessons/${lessonId}/assignment/submit`, true);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadingProgress((prev) => ({ ...prev, [lessonId]: progress }));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 201) {
          showToast("Assignment submitted successfully!", "success");
          fetchSubmissions();
        } else {
          let errMsg = "Failed to submit assignment";
          try {
            const errBody = JSON.parse(xhr.responseText);
            errMsg = errBody.error || errMsg;
          } catch (err) {}
          showToast(errMsg, "error");
        }
        setUploadingProgress((prev) => {
          const copy = { ...prev };
          delete copy[lessonId];
          return copy;
        });
      };

      xhr.onerror = () => {
        showToast("Network error occurred during upload.", "error");
        setUploadingProgress((prev) => {
          const copy = { ...prev };
          delete copy[lessonId];
          return copy;
        });
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred", "error");
      setUploadingProgress((prev) => {
        const copy = { ...prev };
        delete copy[lessonId];
        return copy;
      });
    }
  };

  const handleRemoveFile = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/submit`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (res.ok) {
        showToast("Submission deleted successfully!", "success");
        fetchSubmissions();
      } else {
        const errBody = await res.json().catch(() => ({}));
        showToast(errBody.error || "Failed to delete submission", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete submission", "error");
    }
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
          <div className="flex flex-col gap-5 w-full">
            {selectedSubject.thumbnail && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#E5E1D8]/60 shadow-sm shrink-0">
                <img
                  src={selectedSubject.thumbnail}
                  alt={selectedSubject.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span
                className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit"
                style={{
                  backgroundColor: "#f25c8815",
                  color: "#f25c88",
                  border: "1px solid #f25c8830"
                }}
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
              <div className="flex flex-col gap-4 w-full">
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
                                backgroundColor: "rgba(242, 92, 136, 0.08)",
                                color: "#f25c88",
                                borderColor: "rgba(242, 92, 136, 0.12)"
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

          {selectedSubject && currentUser && selectedSubject.createdBy === currentUser.id && (
            <Link
              href={`/dashboard/subject/${selectedSubject.id}/manage`}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-[#f25c88] hover:bg-[#d84b72] text-white font-bold text-[12px] rounded-2xl transition-all cursor-pointer shadow-sm active:scale-[0.98] mt-2 text-center"
            >
              <span>Manage Subject</span>
            </Link>
          )}
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
                  className="rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-1">
                    <div className="flex flex-col gap-1 max-w-xl md:max-w-2xl">
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
                            onClick={() => setDeleteModuleInfo({ moduleId: mod.id, title: mod.title })}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-red-500 cursor-pointer"
                            title="Delete Module"
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

                  <div className="flex flex-col gap-8 ml-2.5 mt-4 pb-2">
                    {(() => {
                      const sortedLessons = [...mod.lessons].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                      return sortedLessons.map((lesson, idx) => {
                        const isUploading = uploadingProgress[lesson.id] !== undefined;
                        const progress = uploadingProgress[lesson.id] || 0;
                        const isUploaded = uploadedFiles[lesson.id] !== undefined;
                        const fileInfo = uploadedFiles[lesson.id];

                        return (
                          <div
                            key={lesson.id}
                            className="relative pl-8 flex flex-col md:flex-row md:items-start justify-between gap-6 w-full"
                          >
                            <div className="absolute left-0 -translate-x-1/2 top-[6px] w-3 h-3 rounded-full border-2 border-[#FAF7F2] bg-[#f25c88] z-10 shadow-sm" />
                            {idx < sortedLessons.length - 1 && (
                              <div className="absolute left-0 top-[12px] bottom-[-40px] w-[2px] bg-zinc-300 -translate-x-1/2 z-0" />
                            )}
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
                                  <Link
                                    href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}?edit=true`}
                                    className="p-1 rounded-lg hover:bg-zinc-200/50 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => setDeleteLessonInfo({ moduleId: mod.id, lessonId: lesson.id, title: lesson.title })}
                                    className="p-1 rounded-lg hover:bg-zinc-200/50 text-zinc-400 hover:text-red-500 cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-[11.5px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                              {lesson.desc}
                            </p>

                            {(() => {
                              if (lesson.type !== "quizzes") return null;
                              const quizData = quizzesData[lesson.id];
                              if (!quizData) return null;

                              const isOwnerOrLecturer = hasEditPermission;
                              const showLboard = quizData.settings?.showLeaderboard || isOwnerOrLecturer;
                              const top3 = (quizData.attempts || []).slice(0, 3);

                              if (!showLboard || top3.length === 0) return null;

                              return (
                                <div className="flex flex-col gap-2 mt-4 bg-white/40 border border-white/50 backdrop-blur-sm rounded-2xl p-4 w-full animate-in fade-in duration-200 text-left">
                                  <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <Trophy className="w-3.5 h-3.5 text-[#f25c88]" /> Quiz Leaderboard (Top 3 Participants)
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {top3.map((att: any, idx: number) => {
                                      const name = att.userId ? (att.user?.name || "Student") : att.guestName;
                                      const medals = ["🏆 1st Place", "🥈 2nd Place", "🥉 3rd Place"];
                                      const medalColors = [
                                        "bg-amber-500/10 text-amber-800 border-amber-500/20",
                                        "bg-zinc-500/10 text-zinc-800 border-zinc-500/20",
                                        "bg-orange-500/10 text-orange-800 border-orange-500/20"
                                      ];
                                      const pct = Math.round((att.score / att.totalPoints) * 100);
                                      const isMe = (currentUser && att.userId === currentUser.id) || (!currentUser && !att.userId && localStorage.getItem(`quiz_guestName_${lesson.id}`) === att.guestName);

                                      return (
                                        <div
                                          key={att.id}
                                          className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                                            isMe
                                              ? "bg-gradient-to-br from-[#f25c88]/10 to-white/70 border-[#f25c88]/30 shadow-sm shadow-[#f25c88]/5"
                                              : "bg-white/60 hover:bg-white/85 border-white/50 shadow-sm shadow-black/[0.01]"
                                          }`}
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${medalColors[idx]}`}>
                                              {medals[idx]}
                                            </span>
                                            <span className="text-[12px] font-black text-[#f25c88] tracking-tight">{pct}%</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1 min-w-0">
                                            <div className="w-5 h-5 rounded-full bg-zinc-200/50 flex items-center justify-center text-[9px] font-black text-zinc-500 uppercase shrink-0">
                                              {name.charAt(0)}
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              {!att.userId && (
                                                <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1 rounded border border-amber-200 uppercase shrink-0">Guest</span>
                                              )}
                                              <span className={`text-[12.5px] truncate ${isMe ? "font-bold text-zinc-950" : "font-semibold text-zinc-800"}`} title={name}>
                                                {name}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex justify-between items-center text-[9.5px] text-zinc-400 font-bold border-t border-zinc-100/50 pt-2 mt-1">
                                            <span>Score</span>
                                            <span className="text-zinc-650 font-extrabold">{att.score} / {att.totalPoints}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
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

                                {(() => {
                                  const quizData = quizzesData[lesson.id];
                                  if (!quizData) return null;

                                  const isOwnerOrLecturer = hasEditPermission;
                                  const showGrade = quizData.settings?.allowViewGrade && !isOwnerOrLecturer;
                                  const showLboard = quizData.settings?.showLeaderboard || isOwnerOrLecturer;

                                  let myAttemptObj: any = null;
                                  const userIdSuffix = currentUser ? currentUser.id : "guest";
                                  const localAttemptStr = typeof window !== "undefined" ? localStorage.getItem(`quiz_attempt_${lesson.id}_${userIdSuffix}`) : null;
                                  if (localAttemptStr) {
                                    try {
                                      myAttemptObj = JSON.parse(localAttemptStr);
                                    } catch (e) {}
                                  }
                                  if (!myAttemptObj && currentUser && quizData.attempts) {
                                    const found = quizData.attempts.find((att: any) => att.userId === currentUser.id);
                                    if (found) {
                                      myAttemptObj = { score: found.score, totalPoints: found.totalPoints };
                                    }
                                  }

                                  const top3 = (quizData.attempts || []).slice(0, 3);

                                  return (
                                    showGrade && myAttemptObj && (
                                      <div className="flex justify-between items-center bg-emerald-500/[0.03] border border-emerald-500/15 rounded-xl px-3 py-1 mt-1 w-full animate-in fade-in duration-200">
                                        <span className="text-[10px] font-bold text-zinc-650">Your Grade</span>
                                        <span className="text-[10.5px] font-extrabold text-emerald-600">
                                          {myAttemptObj.score} / {myAttemptObj.totalPoints}
                                        </span>
                                      </div>
                                    )
                                  );
                                })()}
                              </>
                            ) : lesson.type === "presencion" ? (
                              <>
                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                  Attendance Tracker
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-3 flex items-center justify-center gap-2 text-zinc-700 font-bold text-[12px] transition-all"
                                >
                                  <span>View Attendance</span>
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
                    });
                  })()}
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

      <ConfirmModal
        isOpen={deleteLessonInfo !== null}
        onClose={() => setDeleteLessonInfo(null)}
        onConfirm={confirmDeleteLesson}
        title="Delete Lesson"
        message={deleteLessonInfo ? `Are you sure you want to delete "${deleteLessonInfo.title}"? This action is permanent and cannot be undone.` : ""}
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeletingLesson}
      />

      <ConfirmModal
        isOpen={deleteModuleInfo !== null}
        onClose={() => setDeleteModuleInfo(null)}
        onConfirm={confirmDeleteModule}
        title="Delete Module"
        message={deleteModuleInfo ? `Are you sure you want to delete "${deleteModuleInfo.title}"? This action is permanent and cannot be undone.` : ""}
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeletingModule}
      />
    </>
  );
}
