"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import EventModal from "@/components/layout/EventModal";
import { useLms } from "../../../../context/LmsContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuiz, getAttempts } from "@/services/quiz.service";
import { getMySubmission, deleteSubmission } from "@/services/assignment.service";
import { kickParticipant, updateParticipantRole, leaveSubject as apiLeaveSubject } from "@/services/subject.service";
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
  BookOpen,
  Clock,
  MapPin,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import ContextMenu from "../../../../components/ui/ContextMenu";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import AccountPreview from "@/components/ui/AccountPreview";

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
  const router = useRouter();
  const { subjects, currentUser, showToast, updateSubject, refreshSubjects } = useLms();
  const selectedSubject = subjects.find((s) => s.id === id);

  const [activeTab, setActiveTab] = useState<"syllabus" | "details" | "forum">("syllabus");
  const [selectedPreviewUser, setSelectedPreviewUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    banner?: string | null;
    joinedAt?: string;
  } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleLeaveSubject = async () => {
    if (!selectedSubject) return;
    if (confirm("Are you sure you want to leave this subject?")) {
      try {
        await apiLeaveSubject(selectedSubject.id);
        showToast("Successfully left the subject", "success");
        router.push("/dashboard");
      } catch (err: any) {
        console.error("Failed to leave subject:", err);
        showToast(err.message || "Failed to leave subject", "error");
      }
    }
  };

  const scrollToAnchor = (elementId: string) => {
    const container = document.getElementById("subject-detail-scroll-container");
    const target = document.getElementById(elementId);
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - containerRect.top + container.scrollTop - 24; // 24px top margin offset
      container.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    }
  };

  React.useEffect(() => {
    refreshSubjects();
  }, []);

  React.useEffect(() => {
    if (!selectedSubject) return;
    try {
      const recentStr = localStorage.getItem("recent_subjects");
      let recents: { id: string; name: string; color?: string }[] = recentStr ? JSON.parse(recentStr) : [];
      
      // Filter out duplicate
      recents = recents.filter((item) => item.id !== selectedSubject.id);
      
      // Unshift new recent
      recents.unshift({
        id: selectedSubject.id,
        name: selectedSubject.name,
        color: selectedSubject.color || "cream",
      });
      
      // Keep max 3
      recents = recents.slice(0, 3);
      
      localStorage.setItem("recent_subjects", JSON.stringify(recents));
      window.dispatchEvent(new Event("recent_subjects_updated"));
    } catch (err) {
      console.error("Failed to update recent subjects", err);
    }
  }, [selectedSubject]);

  const [uploadedFiles, setUploadedFiles] = useState<{ [lessonId: string]: { name: string; size: string } }>({});
  const [uploadingProgress, setUploadingProgress] = useState<{ [lessonId: string]: number }>({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<{ userId: string; name: string; email: string; role: string } | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [deleteLessonInfo, setDeleteLessonInfo] = useState<{ moduleId: string; lessonId: string; title: string } | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [deleteModuleInfo, setDeleteModuleInfo] = useState<{ moduleId: string; title: string } | null>(null);
  const [isDeletingModule, setIsDeletingModule] = useState(false);

  // selectedSubject declared above

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
          const quiz = await getQuiz(lesson.id);
          
          let attempts: any[] = [];
          const isCreator = selectedSubject.createdBy === currentUser?.id;
          const isLecturer = selectedSubject.lecturers?.some((l: any) => l.userId === currentUser?.id);
          const canEdit = isCreator || isLecturer;

          if (quiz.showLeaderboard || canEdit) {
            attempts = await getAttempts(lesson.id);
          }
          dataMap[lesson.id] = { settings: quiz, attempts };
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
            const data = await getMySubmission(lessonId);
            if (data) {
              tempUploadedFiles[lessonId] = {
                name: data.fileName,
                size: (data.fileSize / 1024).toFixed(1) + " KB",
                path: data.filePath,
              };
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
      await deleteSubmission(lessonId);
      showToast("Submission deleted successfully!", "success");
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete submission", "error");
    }
  };



  if (!selectedSubject) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col text-left select-none w-full h-full bg-[#FAF9F5]/30">
        <Header />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-xl mx-auto w-full select-none text-center">
          {/* Big 404 Text */}
          <div className="relative mb-4">
            <h1 className="text-[100px] sm:text-[120px] font-black leading-none text-zinc-950/5 tracking-tighter">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400/80 uppercase tracking-widest bg-[#FAF9F6] px-3 py-1 rounded-full border border-[#E5E1D8]/30">
                Not Found
              </span>
            </div>
          </div>

          {/* Title Text */}
          <h2 className="text-lg sm:text-xl font-black text-zinc-955 tracking-tight mb-2">
            Subject Not Found
          </h2>

          {/* Description */}
          <p className="text-[12px] sm:text-[13px] text-zinc-500 font-semibold leading-relaxed mb-8 max-w-sm">
            The subject syllabus you are looking for might have been deleted, renamed, or is temporarily unavailable. Double check the ID or choose one of the options below.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] hover:bg-zinc-900 text-white font-extrabold rounded-2xl text-[11.5px] shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Go to Dashboard</span>
            </Link>
            <Link
              href="/dashboard/subjects"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#FAF9F5] border border-zinc-200 text-zinc-700 hover:text-zinc-900 font-extrabold rounded-2xl text-[11.5px] transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-zinc-450" />
              <span>Browse Subjects</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }



  return (
    <>
      {}
      <Header />

      <div id="subject-detail-scroll-container" className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <div className="w-full px-3 sm:px-6 md:px-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 w-full select-none">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button 
                type="button"
                onClick={() => setActiveTab("syllabus")} 
                className={`pb-1 text-[13px] font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "syllabus" 
                    ? "border-zinc-800 text-zinc-800 font-extrabold" 
                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                }`}
              >
                Syllabus Detail
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("details")} 
                className={`pb-1 text-[13px] font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "details" 
                    ? "border-zinc-800 text-zinc-800 font-extrabold" 
                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                }`}
              >
                Subject Details
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("forum")} 
                className={`pb-1 text-[13px] font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "forum" 
                    ? "border-zinc-800 text-zinc-800 font-extrabold" 
                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                }`}
              >
                Discussion Forum
              </button>
            </div>
          </div>

      {activeTab === "syllabus" && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <h3 className="text-[16px] font-semibold text-zinc-800 tracking-tight">
              Course Modules & Lessons
            </h3>
            {selectedSubject && currentUser && (selectedSubject.createdBy === currentUser.id || selectedSubject.lecturers.some((l) => l.userId === currentUser.id)) && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/module/create`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E1D8]/70 rounded-xl hover:bg-zinc-100 font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </Link>
                <Link
                  href={`/dashboard/subject/${selectedSubject.id}/lesson/create`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E1D8]/70 rounded-xl hover:bg-zinc-100 font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </Link>
              </div>
            )}
          </div>

          {selectedSubject.modules.length === 0 ? (
            <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl bg-white/40">
              <span className="text-[13px] text-zinc-400 font-semibold">No modules registered yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
              {/* Left Column: Modules list (takes 3 of 4 columns) */}
              <div className="lg:col-span-3 flex flex-col gap-6 w-full">
                {selectedSubject.modules.map((mod, index) => (
                  <div
                    id={`module-${mod.id}`}
                    key={mod.id}
                    className="bg-transparent border-b border-[#E5E1D8]/50 last:border-b-0 pb-8 flex flex-col gap-4 scroll-mt-6"
                  >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-1">
                    <div className="flex flex-col gap-1 max-w-xl md:max-w-2xl">
                      <Link
                        href={`/dashboard/subject/${selectedSubject.id}/module/${mod.id}`}
                        className="hover:text-[#d97706] transition-colors"
                      >
                        <h4 className="text-[16px] font-semibold text-zinc-800">
                          Module {index + 1}: {mod.title}
                        </h4>
                      </Link>
                      <p className="text-[11.5px] text-zinc-500 font-semibold leading-relaxed max-w-lg">
                        {mod.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      {hasEditPermission && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/subject/${selectedSubject.id}/lesson/create?moduleId=${mod.id}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E5E1D8] text-zinc-700 hover:text-zinc-850 hover:bg-zinc-50 font-bold text-[10px] cursor-pointer transition-all bg-white shadow-2xs mr-1 select-none shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Lesson</span>
                          </Link>
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
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#d97706] bg-[#facc15]/10 px-3 py-1 rounded-full w-fit">
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
                            id={`lesson-${lesson.id}`}
                            key={lesson.id}
                            className="relative pl-8 flex flex-col md:flex-row md:items-start justify-between gap-6 w-full scroll-mt-10"
                          >
                            <div className="absolute left-0 -translate-x-1/2 top-[6px] w-3 h-3 rounded-full border-2 border-white bg-[#facc15] z-10 shadow-sm" />
                            {idx < sortedLessons.length - 1 && (
                              <div className="absolute left-0 top-[12px] bottom-[-40px] w-[2px] bg-zinc-300 -translate-x-1/2 z-0" />
                            )}
                            <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-start justify-between w-full">
                              <div className="flex flex-col items-start gap-1.5">
                                <span className="px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-semibold uppercase tracking-wide w-fit rounded-full">
                                  {lesson.type || "learning"}
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="hover:text-[#d97706] transition-colors"
                                >
                                  <h5 className="text-[13.5px] font-semibold text-zinc-800">
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

                            {lesson.files && lesson.files.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-[#E5E1D8]/45">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-0.5">
                                  Materials / Attachments
                                </span>
                                <div className="flex flex-col gap-1 max-w-lg">
                                  {lesson.files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between py-1 px-2 hover:bg-zinc-50 rounded-lg group/file transition-colors border border-transparent hover:border-[#E5E1D8]/50">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11.5px] font-semibold text-zinc-700 hover:text-[#d97706] transition-colors truncate"
                                          title={file.name}
                                        >
                                          {file.name}
                                        </a>
                                      </div>
                                      <span className="text-[9.5px] text-zinc-400 font-semibold pr-1">
                                        {(file.sizeBytes / 1024).toFixed(1)} KB
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(() => {
                              if (lesson.type !== "quizzes") return null;
                              const quizData = quizzesData[lesson.id];
                              if (!quizData) return null;

                              const isOwnerOrLecturer = hasEditPermission;
                              const showLboard = quizData.settings?.showLeaderboard || isOwnerOrLecturer;
                              const top3 = (quizData.attempts || []).slice(0, 3);

                              if (!showLboard || top3.length === 0) return null;

                              return (
                                <div className="flex flex-col gap-3 mt-4 w-full text-left border-t border-[#E5E1D8]/45 pt-4">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1 pl-1">
                                    <Trophy className="w-3.5 h-3.5 text-[#d97706]" /> Leaderboard (Top 3 Participants)
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {top3.map((att: any, idx: number) => {
                                      const name = att.userId ? (att.user?.name || "Student") : att.guestName;
                                      const medals = ["🏆 1st Place", "🥈 2nd Place", "🥉 3rd Place"];
                                      const pct = Math.round((att.score / att.totalPoints) * 100);
                                      const isMe = (currentUser && att.userId === currentUser.id) || (!currentUser && !att.userId && localStorage.getItem(`quiz_guestName_${lesson.id}`) === att.guestName);

                                      return (
                                        <div
                                          key={att.id}
                                          className={`flex flex-col gap-1.5 p-1 bg-transparent border-b sm:border-b-0 sm:border-r border-[#E5E1D8]/60 sm:last:border-r-0 sm:pr-4 sm:last:pr-0`}
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9.5px] font-bold text-zinc-500">
                                              {medals[idx]}
                                            </span>
                                            <span className="text-[11.5px] font-bold text-[#d97706]">{pct}%</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                            <div className="w-5 h-5 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                                              {name.charAt(0)}
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              {!att.userId && (
                                                <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1 rounded uppercase shrink-0">Guest</span>
                                              )}
                                              <span className={`text-[12.5px] truncate font-semibold text-zinc-800 ${isMe ? "font-bold text-zinc-950" : ""}`} title={name}>
                                                {name} {isMe && "(You)"}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex justify-between items-center text-[9.5px] text-zinc-400 font-semibold mt-1">
                                            <span>Score</span>
                                            <span className="text-zinc-650 font-bold">{att.score} / {att.totalPoints}</span>
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
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                  Study Material
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8]/70 rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] hover:bg-zinc-100 transition-all cursor-pointer"
                                >
                                  <span>View Lesson</span>
                                </Link>
                              </>
                            ) : lesson.type === "quizzes" ? (
                              <>
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                  Quiz Launchpad
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8]/70 rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] hover:bg-zinc-100 transition-all cursor-pointer"
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
                                        <span className="text-[10px] font-semibold text-zinc-650">Your Grade</span>
                                        <span className="text-[10.5px] font-semibold text-emerald-600">
                                          {myAttemptObj.score} / {myAttemptObj.totalPoints}
                                        </span>
                                      </div>
                                    )
                                  );
                                })()}
                              </>
                            ) : lesson.type === "presencion" ? (
                              <>
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                  Attendance Tracker
                                </span>
                                <Link
                                  href={`/dashboard/subject/${selectedSubject.id}/lesson/${lesson.id}`}
                                  className="border border-[#E5E1D8]/70 rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] hover:bg-zinc-100 transition-all cursor-pointer"
                                >
                                  <span>View Attendance</span>
                                </Link>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                  Homework Submission
                                </span>

                                {isUploading ? (
                                  <div className="border border-[#E5E1D8]/70 bg-white rounded-xl p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500">
                                      <span>Uploading file...</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-100">
                                      <div
                                        className="h-full bg-[#facc15] rounded-full transition-all duration-150"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : isUploaded && fileInfo ? (
                                  <div className="border border-emerald-500/25 bg-emerald-500/[0.03] rounded-xl p-3 flex items-center justify-between gap-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-semibold text-zinc-800 truncate">
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
                                  <label className="border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl bg-white/40 hover:bg-white/60 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => handleSimulatedUpload(lesson.id, e)}
                                    />
                                    <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[11px] font-semibold text-zinc-800">
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

              {/* Right Column: Mini Navigation Sidebar (takes 1 of 4 columns) */}
              <div className="hidden lg:flex flex-col gap-5 lg:sticky lg:top-6 bg-transparent p-1 pl-3 border-l border-[#E5E1D8]/50 select-none max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1">
                  syllabus map
                </span>
                <div className="flex flex-col gap-5">
                  {selectedSubject.modules.map((mod, index) => (
                    <div key={mod.id} className="flex flex-col gap-1.5">
                      <button
                        onClick={() => scrollToAnchor(`module-${mod.id}`)}
                        className="text-left text-[12px] font-bold text-zinc-650 hover:text-[#d97706] hover:translate-x-0.5 transition-all cursor-pointer truncate py-0.5"
                      >
                        Module {index + 1}: {mod.title}
                      </button>
                      {mod.lessons && mod.lessons.length > 0 && (
                        <div className="flex flex-col gap-2 pl-3.5 ml-1.5 mb-1.5">
                          {mod.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => scrollToAnchor(`lesson-${lesson.id}`)}
                              className="text-left text-[11px] font-semibold text-zinc-400 hover:text-[#d97706] hover:translate-x-0.5 transition-all cursor-pointer truncate py-0.5"
                              title={lesson.title}
                            >
                              {lesson.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "details" && (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
          {/* Top Row: Thumbnail and Details Side-by-Side */}
          <div className="flex flex-col md:flex-row gap-8 items-start w-full">
            {selectedSubject.thumbnail && (
              <div className="w-full md:w-1/3 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E1D8]/40 shadow-2xs shrink-0 bg-white">
                <img src={selectedSubject.thumbnail} alt={selectedSubject.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex-1 flex flex-col gap-5 w-full text-left">
              <div className="flex flex-col gap-1.5">
                <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full w-fit bg-[#facc15]/10 text-[#d97706] border border-[#f97316]/15 uppercase tracking-wide">
                  {selectedSubject.room || "Room Online"}
                </span>
                <h2 className="text-2xl sm:text-[32px] font-bold text-zinc-800 tracking-tight leading-tight mt-1">
                  {selectedSubject.name}
                </h2>
                {selectedSubject.description && (
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-medium mt-1">
                    {selectedSubject.description}
                  </p>
                )}
              </div>

              {/* Lecturers under description without card styles, borders, or labels */}
              <div className="flex flex-wrap gap-6 items-center w-full">
                {selectedSubject.lecturers.map((lecturer) => {
                  const initials = lecturer.name
                    ? lecturer.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                    : "?";
                  return (
                    <div
                      key={lecturer.userId}
                      onClick={(e) => {
                        setSelectedPreviewUser({
                          name: lecturer.name,
                          email: lecturer.email || "",
                          role: "Lecturer",
                          avatar: lecturer.avatar || "",
                          banner: lecturer.banner || null,
                          joinedAt: selectedSubject.createdAt,
                        });
                        setPreviewPos({ x: e.clientX, y: e.clientY });
                      }}
                      className="flex items-center gap-3 cursor-pointer group select-none"
                      title={`View ${lecturer.name}'s profile`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 bg-[#facc15]/5 text-[#d97706] border-[#f97316]/10 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                        {lecturer.avatar ? (
                          <img src={lecturer.avatar} alt={lecturer.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-zinc-800 group-hover:text-[#d97706] transition-colors leading-tight">
                          {lecturer.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold leading-tight mt-0.5">
                          {lecturer.email || "No email provided"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Class Schedule Table (no label) */}
              {selectedSubject.schedules && selectedSubject.schedules.length > 0 && (
                <div className="w-full border border-[#E5E1D8]/60 rounded-3xl bg-white/30 overflow-x-auto no-scrollbar">
                  <table className="w-full border-collapse text-left text-[12.5px] font-semibold text-zinc-700">
                    <thead>
                      <tr className="border-b border-[#E5E1D8]/40 text-[11.5px] font-bold text-zinc-500">
                        <th className="py-3 px-5 font-bold">Day</th>
                        <th className="py-3 px-5 font-bold">Time</th>
                        <th className="py-3 px-5 font-bold">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubject.schedules.map((sch, i) => (
                        <tr key={i} className="border-b border-[#E5E1D8]/20 last:border-0 hover:bg-zinc-50/20 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-zinc-800">{sch.day}</td>
                          <td className="py-3.5 px-5 text-zinc-505 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              {sch.startTime} - {sch.endTime}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-zinc-505 font-semibold">
                            {sch.room ? (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                {sch.room}
                              </span>
                            ) : (
                              <span className="text-zinc-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Manage & Leave Actions placed below details */}
              <div className="flex flex-wrap gap-3 w-full pt-3">
                {selectedSubject && currentUser && selectedSubject.createdBy === currentUser.id && (
                  <Link
                    href={`/dashboard/subject/${selectedSubject.id}/manage`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[11px] rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98] text-center"
                  >
                    <span>Manage Subject</span>
                  </Link>
                )}

                {selectedSubject && currentUser && selectedSubject.createdBy !== currentUser.id && (
                  selectedSubject.lecturers.some((l) => l.userId === currentUser.id) ||
                  selectedSubject.participants?.some((p) => p.userId === currentUser.id)
                ) && (
                  <button
                    type="button"
                    onClick={handleLeaveSubject}
                    className="w-full sm:w-auto px-6 py-2.5 border border-red-200 hover:bg-red-55/70 hover:text-red-700 text-red-650 font-semibold text-[11px] rounded-xl transition-all cursor-pointer text-center select-none"
                  >
                    <span>Leave Subject</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Course Members */}
          <div className="w-full border-t border-[#E5E1D8]/45 pt-6 mt-4 text-left">
            {(() => {
              interface CourseMember {
                userId: string;
                name: string;
                email: string;
                role: "Owner" | "Lecturer" | "Participant";
                avatar?: string;
                banner?: string | null;
                joinedAt?: string;
              }
              const courseMembers: CourseMember[] = [];
              if (selectedSubject.createdBy) {
                courseMembers.push({
                  userId: selectedSubject.createdBy,
                  name: selectedSubject.creatorName || "Subject Owner",
                  email: selectedSubject.creatorEmail || "",
                  role: "Owner",
                  avatar: selectedSubject.creatorAvatar || "",
                  banner: selectedSubject.creatorBanner || null,
                  joinedAt: selectedSubject.createdAt,
                });
              }
              if (selectedSubject.lecturers) {
                selectedSubject.lecturers.forEach((l) => {
                  if (l.userId !== selectedSubject.createdBy && !courseMembers.some(m => m.userId === l.userId)) {
                    courseMembers.push({
                      userId: l.userId,
                      name: l.name,
                      email: l.email || "",
                      role: "Lecturer",
                      avatar: l.avatar || "",
                      banner: l.banner || null,
                      joinedAt: selectedSubject.createdAt,
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
                      role: "Participant",
                      avatar: p.avatar || "",
                      banner: p.banner || null,
                      joinedAt: p.joinedAt,
                    });
                  }
                });
              }

              const filteredMembers = courseMembers.filter((m) => {
                const query = memberSearchQuery.toLowerCase().trim();
                const matchesSearch =
                  !query ||
                  m.name.toLowerCase().includes(query) ||
                  (m.email && m.email.toLowerCase().includes(query)) ||
                  m.userId.toLowerCase().includes(query);

                const matchesRole =
                  memberRoleFilter === "all" ||
                  (memberRoleFilter === "owner" && m.role === "Owner") ||
                  (memberRoleFilter === "lecturer" && m.role === "Lecturer") ||
                  (memberRoleFilter === "student" && m.role === "Participant");

                return matchesSearch && matchesRole;
              });

              const isAllSelected = filteredMembers.length > 0 && selectedMemberIds.length === filteredMembers.length;

              const handleSelectAllToggle = () => {
                if (isAllSelected) {
                  setSelectedMemberIds([]);
                } else {
                  setSelectedMemberIds(filteredMembers.map((m) => m.userId));
                }
              };

              const handleSelectMemberToggle = (userId: string) => {
                setSelectedMemberIds((prev) =>
                  prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
                );
              };

              const handleBulkKick = async () => {
                if (confirm(`Are you sure you want to remove the ${selectedMemberIds.length} selected members?`)) {
                  try {
                    await Promise.all(selectedMemberIds.map((userId) => kickParticipant(selectedSubject.id, userId)));
                    showToast(`Successfully removed selected members!`, "success");
                    setSelectedMemberIds([]);
                    setTimeout(() => {
                      window.location.reload();
                    }, 800);
                  } catch (err: any) {
                    showToast(err.message || "Failed to remove selected members", "error");
                  }
                }
              };

              return (
                <div className="flex flex-col gap-4 w-full">
                  {/* Search, Filter, and Action Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full mb-2 select-none">
                    <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Search Input */}
                      <div className="relative flex items-center w-full sm:max-w-xs">
                        <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search members by name, email, or ID..."
                          value={memberSearchQuery}
                          onChange={(e) => {
                            setMemberSearchQuery(e.target.value);
                            setSelectedMemberIds([]); // Clear selection when filtering
                          }}
                          className="w-full pl-9 pr-4 py-2 bg-white/40 border border-[#E5E1D8]/60 hover:border-zinc-300 focus:border-zinc-500 rounded-xl text-[12px] font-semibold text-zinc-700 placeholder-zinc-400 outline-none transition-colors"
                        />
                      </div>
                      
                      {/* Role Filter Selector */}
                      <div className="relative flex items-center">
                        <Filter className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <select
                          value={memberRoleFilter}
                          onChange={(e) => {
                            setMemberRoleFilter(e.target.value);
                            setSelectedMemberIds([]); // Clear selection when filtering
                          }}
                          className="pl-9 pr-8 py-2 bg-white/40 border border-[#E5E1D8]/60 hover:border-zinc-300 focus:border-zinc-500 rounded-xl text-[12px] font-bold text-zinc-700 outline-none transition-colors cursor-pointer appearance-none"
                        >
                          <option value="all">All Roles</option>
                          <option value="owner">Owner</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="student">Student</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
                      </div>
                    </div>

                    {/* Actions on the Right */}
                    <div className="flex items-center gap-2">
                      {selectedSubject && currentUser && (selectedSubject.createdBy === currentUser.id || selectedSubject.lecturers.some(l => l.userId === currentUser.id)) && (
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/join/${selectedSubject.id}/${selectedSubject.createdBy}`;
                            navigator.clipboard.writeText(link);
                            showToast("Invite link copied to clipboard!", "success");
                          }}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer select-none active:scale-[0.98]"
                        >
                          Invite Member
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bulk Action Bar */}
                  {selectedMemberIds.length > 0 && (
                    <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-3 rounded-2xl w-full mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <span className="text-[12px] font-bold">
                        {selectedMemberIds.length} member{selectedMemberIds.length > 1 ? "s" : ""} selected
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedMemberIds([])}
                          className="text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel Selection
                        </button>
                        {selectedSubject && currentUser && (selectedSubject.createdBy === currentUser.id || selectedSubject.lecturers.some(l => l.userId === currentUser.id)) && (
                          <button
                            type="button"
                            onClick={handleBulkKick}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer select-none active:scale-[0.98]"
                          >
                            Remove Selected
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#E5E1D8]/60 rounded-3xl bg-white/20">
                      <span className="text-[11.5px] text-zinc-400 font-semibold">No members found matching your search.</span>
                    </div>
                  ) : (
                    <div className="w-full border border-[#E5E1D8]/60 rounded-3xl bg-white/30 overflow-x-auto no-scrollbar max-h-[450px] overflow-y-auto">
                      <table className="w-full border-collapse text-left text-[12.5px] font-semibold text-zinc-700">
                        <thead>
                          <tr className="border-b border-[#E5E1D8]/45 text-[11.5px] font-bold text-zinc-500">
                            <th className="py-3 px-5 w-10">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAllToggle}
                                className="w-4 h-4 text-zinc-800 rounded border-zinc-350 focus:ring-zinc-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-3 px-5 font-bold">Member</th>
                            <th className="py-3 px-5 font-bold">User ID</th>
                            <th className="py-3 px-5 font-bold">Role</th>
                            <th className="py-3 px-5 font-bold">Joined Date</th>
                            <th className="py-3 px-5 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((member) => {
                            const initials = member.name
                              ? member.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                              : "?";
                            
                            return (
                              <tr key={member.userId} className="border-b border-[#E5E1D8]/20 last:border-0 hover:bg-zinc-50/20 transition-colors animate-in fade-in duration-205">
                                <td className="py-3 px-5 w-10">
                                  <input
                                    type="checkbox"
                                    checked={selectedMemberIds.includes(member.userId)}
                                    onChange={() => handleSelectMemberToggle(member.userId)}
                                    className="w-4 h-4 text-zinc-800 rounded border-zinc-350 focus:ring-zinc-500 cursor-pointer"
                                  />
                                </td>
                                <td 
                                  className="py-3 px-5 cursor-pointer group select-none"
                                  onClick={(e) => {
                                    setSelectedPreviewUser({
                                      name: member.name,
                                      email: member.email || "",
                                      role: member.role === "Participant" ? "Student" : member.role,
                                      avatar: member.avatar || "",
                                      banner: member.banner || null,
                                      joinedAt: member.joinedAt || selectedSubject.createdAt,
                                    });
                                    setPreviewPos({ x: e.clientX, y: e.clientY });
                                  }}
                                  title={`View ${member.name}'s profile`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold border shrink-0 bg-[#facc15]/5 text-[#d97706] border-[#f97316]/10 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                                      {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span>{initials}</span>
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[12.5px] font-bold text-zinc-800 group-hover:text-[#d97706] transition-colors truncate">
                                        {member.name}
                                      </span>
                                      <span className="text-[10px] text-zinc-400 font-semibold truncate mt-0.5">
                                        {member.email || "No email"}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-5 font-mono text-[11.5px] text-zinc-400 select-all" title={member.userId}>
                                  {member.userId}
                                </td>
                                <td className="py-3 px-5">
                                  {member.role === "Owner" && (
                                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-[#facc15]/10 text-[#d97706] border border-[#f97316]/15 uppercase tracking-wide">
                                      Owner
                                    </span>
                                  )}
                                  {member.role === "Lecturer" && (
                                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50 uppercase tracking-wide">
                                      Lec
                                    </span>
                                  )}
                                  {member.role === "Participant" && (
                                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/50 uppercase tracking-wide">
                                      Stu
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-5 text-zinc-450 text-[11px] font-medium">
                                  {member.joinedAt ? formatDate(member.joinedAt) : "-"}
                                </td>
                                <td className="py-3 px-5 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setSelectedMember(member);
                                      setMenuPos({ x: e.clientX, y: e.clientY });
                                      setMenuOpen(true);
                                    }}
                                    className="w-6 h-6 rounded-full hover:bg-zinc-100 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "forum" && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Forum Actions Header - Card Styles Removed */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-transparent border-none p-0 shadow-none">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search discussion threads..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-[13px] bg-zinc-50 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-400 font-medium"
              />
            </div>
            <button 
              type="button"
              onClick={() => showToast("Forum discussions creation is a premium/preview feature. Backend integration coming soon!", "success")}
              className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[11.5px] rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              New Thread
            </button>
          </div>

          {/* Discussion Tags */}
          <div className="flex flex-wrap gap-2 select-none">
            {["All Discussions", "Announcements", "General", "Assignments", "Resources", "Q&A"].map((tag, idx) => (
              <button 
                key={idx}
                type="button"
                className={`px-3 py-1.5 border rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  idx === 0 
                    ? "bg-zinc-800 text-white border-zinc-800 shadow-xs" 
                    : "bg-white text-zinc-500 border-[#E5E1D8]/70 hover:bg-zinc-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Thread list */}
          <div className="flex flex-col gap-4">
            {[
              {
                title: "When is the final assignment due? Is there any extension?",
                author: "Alex Rivers",
                role: "Student",
                snippet: "Hey everyone! I noticed the syllabus says July 20th but the assignment portal says July 18th. Can anyone clarify if we have a couple extra days?",
                replies: 4,
                views: 24,
                tag: "Assignments",
                tagColor: "bg-blue-50 text-blue-705 border-blue-200/50",
                time: "2 hours ago"
              },
              {
                title: "Recommended resources for learning TypeScript generics?",
                author: "Sarah Chen",
                role: "Student",
                snippet: "I am struggling a bit with complex generic types in TypeScript. Are there any good articles or visual tools you'd recommend to understand them better?",
                replies: 12,
                views: 78,
                tag: "Resources",
                tagColor: "bg-emerald-50 text-emerald-705 border-emerald-200/50",
                time: "1 day ago"
              },
              {
                title: "Lecture 4 slides and code snippets uploaded!",
                author: "Dr. Olivia",
                role: "Lecturer",
                snippet: "Dear students, I have uploaded the lecture slides and code blocks from today's session. Please review them before next Tuesday's quiz.",
                replies: 2,
                views: 110,
                tag: "Announcements",
                tagColor: "bg-amber-50 text-amber-705 border-amber-200/50",
                time: "3 days ago"
              }
            ].map((thread, i) => {
              const initials = thread.author.split(" ").map(n => n[0]).join("");
              return (
                <div 
                  key={i} 
                  className="bg-white border border-[#E5E1D8]/60 p-5 md:p-6 rounded-[24px] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] hover:border-zinc-350 hover:shadow-xs transition-all flex flex-col gap-4 text-left cursor-pointer"
                  onClick={() => showToast(`Opening discussion thread: "${thread.title}"`, "success")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 bg-zinc-100 text-zinc-700 border-zinc-200">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-semibold text-zinc-800 truncate">
                          {thread.author}
                        </span>
                        <span className="text-[10px] text-zinc-455 font-semibold truncate -mt-0.5">
                          {thread.role} • {thread.time}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${thread.tagColor}`}>
                      {thread.tag}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-[15.5px] font-bold text-zinc-800 tracking-tight leading-snug hover:text-zinc-950">
                      {thread.title}
                    </h3>
                    <p className="text-[12.2px] text-zinc-550 leading-relaxed font-medium line-clamp-2">
                      {thread.snippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-3.5 border-t border-[#E5E1D8]/45 text-[11px] font-semibold text-zinc-400 select-none">
                    <span className="flex items-center gap-1.5 hover:text-zinc-650 transition-colors">
                      <MessageSquare className="w-4 h-4 text-zinc-400" />
                      {thread.replies} Replies
                    </span>
                    <span>•</span>
                    <span>{thread.views} Views</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div> {/* Closes w-full px-6 md:px-8 padding wrapper */}
      </div> {/* Closes outer scrollable container */}

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
                ...(selectedMember.role === "Participant"
                  ? [
                      {
                        label: "Change to Lecturer",
                        icon: UserCheck,
                        onClick: async () => {
                          try {
                            await updateParticipantRole(selectedSubject.id, selectedMember.userId, "Lecturer");
                            showToast(`Successfully promoted ${selectedMember.name} to Lecturer!`, "success");
                            setTimeout(() => window.location.reload(), 800);
                          } catch (err: any) {
                            showToast(err.message || "Failed to update role", "error");
                          }
                        }
                      }
                    ]
                  : [
                      {
                        label: "Change to Student",
                        icon: UserCheck,
                        onClick: async () => {
                          try {
                            await updateParticipantRole(selectedSubject.id, selectedMember.userId, "Student");
                            showToast(`Successfully demoted ${selectedMember.name} to Student!`, "success");
                            setTimeout(() => window.location.reload(), 800);
                          } catch (err: any) {
                            showToast(err.message || "Failed to update role", "error");
                          }
                        }
                      }
                    ]),
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
                        await kickParticipant(selectedSubject.id, selectedMember.userId);
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
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E1D8]/50">
              <h3 className="text-[16px] font-semibold text-zinc-800">Edit Module</h3>
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
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-[13px] bg-zinc-50 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Description</label>
                <textarea
                  value={editingModule.desc}
                  onChange={(e) => setEditingModule({ ...editingModule, desc: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-[13px] bg-zinc-50 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={editingModule.date}
                  onChange={(e) => setEditingModule({ ...editingModule, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1D8]/70 text-[13px] bg-zinc-50 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5E1D8]/50">
              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                }}
                className="px-4 py-2 border border-[#E5E1D8]/70 rounded-xl font-semibold text-[11px] text-zinc-500 hover:text-zinc-800 bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] hover:bg-zinc-100 cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModule}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95"
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

      <AccountPreview
        isOpen={selectedPreviewUser !== null}
        onClose={() => setSelectedPreviewUser(null)}
        x={previewPos.x}
        y={previewPos.y}
        user={selectedPreviewUser}
      />
    </>
  );
}
