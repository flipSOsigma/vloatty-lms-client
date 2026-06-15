"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import Link from "next/link";
import { SubjectFile } from "../../../../../../types/subject";
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
  Trophy,
  Trash2,
  Plus,
  Settings,
  CheckCircle2,
  ListOrdered,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function LessonDetailInner({ params }: PageProps) {
  const { id, lessonId } = React.use(params);
  const { subjects, currentUser, updateSubject, showToast } = useLms();
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

  const [files, setFiles] = useState<SubjectFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);
  const [attachingProgress, setAttachingProgress] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("");
  const [editOpenDate, setEditOpenDate] = useState("");
  const [editCloseDate, setEditCloseDate] = useState("");
  const [editCloseType, setEditCloseType] = useState("");

  // Quiz states
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizTab, setQuizTab] = useState<"quiz" | "submissions">("quiz");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isGuestStarted, setIsGuestStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [myAttempt, setMyAttempt] = useState<any>(null);

  const fetchAttempts = async () => {
    setAttemptsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz/attempts`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (e) {
      console.error("Error fetching attempts:", e);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const fetchQuiz = async () => {
    if (selectedLesson?.type !== "quizzes") return;
    setQuizLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        if (data.showLeaderboard || canEdit) {
          fetchAttempts();
        }
      } else if (res.status === 404) {
        if (canEdit) {
          setQuiz({
            allowViewGrade: true,
            showLeaderboard: true,
            allowGuest: true,
            questions: [
              {
                questionText: "",
                options: ["", ""],
                correctOption: 0,
                points: 1
              }
            ]
          });
        } else {
          setQuiz(null);
        }
      }
    } catch (e) {
      console.error("Error fetching quiz:", e);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLesson?.type === "quizzes") {
      fetchQuiz();
      
      // Reset attempt and guest states in case of account switch
      setMyAttempt(null);
      setIsGuestStarted(false);

      const userIdSuffix = currentUser ? currentUser.id : "guest";
      const localAttempt = localStorage.getItem(`quiz_attempt_${lessonId}_${userIdSuffix}`);
      if (localAttempt) {
        try {
          setMyAttempt(JSON.parse(localAttempt));
        } catch (err) {
          console.error(err);
        }
      }
      const localGuestName = localStorage.getItem(`quiz_guestName_${lessonId}`);
      if (localGuestName) {
        setGuestName(localGuestName);
        setIsGuestStarted(true);
      }
    }
  }, [lessonId, selectedLesson?.type, currentUser]);

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.questionText.trim()) {
        showToast(`Question ${i + 1} text cannot be empty.`, "error");
        return;
      }
      if (q.options.some((opt: string) => !opt.trim())) {
        showToast(`All options in Question ${i + 1} must be filled out.`, "error");
        return;
      }
    }

    setQuizSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(quiz),
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        showToast("Quiz settings and questions saved successfully!", "success");
        fetchAttempts();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save quiz", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error occurred while saving quiz", "error");
    } finally {
      setQuizSaving(false);
    }
  };

  const handleSubmitQuizAttempt = async () => {
    if (!quiz) return;
    
    if (!currentUser && quiz.allowGuest && !guestName.trim()) {
      showToast("Please enter your name as a guest user.", "error");
      return;
    }

    const unansweredCount = quiz.questions.filter((q: any) => userAnswers[q.id] === undefined).length;
    if (unansweredCount > 0) {
      if (!confirm(`You have left ${unansweredCount} questions unanswered. Are you sure you want to submit?`)) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          guestName: currentUser ? undefined : guestName.trim(),
          answers: userAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const attemptResult = {
          score: data.score,
          totalPoints: data.totalPoints,
          submittedAt: data.submittedAt,
          answers: userAnswers,
          correctAnswers: data.correctAnswers,
        };
        setMyAttempt(attemptResult);
        const userIdSuffix = currentUser ? currentUser.id : "guest";
        localStorage.setItem(`quiz_attempt_${lessonId}_${userIdSuffix}`, JSON.stringify(attemptResult));
        if (!currentUser) {
          localStorage.setItem(`quiz_guestName_${lessonId}`, guestName.trim());
        }
        showToast("Quiz submitted successfully!", "success");
        if (quiz.showLeaderboard || canEdit) {
          fetchAttempts();
        }
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit attempt", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error submitting quiz attempt", "error");
    }
  };

  const updateQuizSetting = (key: string, value: any) => {
    setQuiz((prev: any) => ({ ...prev, [key]: value }));
  };

  const addQuestion = () => {
    setQuiz((prev: any) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: ["", ""],
          correctOption: 0,
          points: 1
        }
      ]
    }));
  };

  const removeQuestion = (qIdx: number) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      updated.splice(qIdx, 1);
      return { ...prev, questions: updated };
    });
  };

  const updateQuestionText = (qIdx: number, val: string) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      updated[qIdx] = { ...updated[qIdx], questionText: val };
      return { ...prev, questions: updated };
    });
  };

  const updateQuestionPoints = (qIdx: number, val: number) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      updated[qIdx] = { ...updated[qIdx], points: val };
      return { ...prev, questions: updated };
    });
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      const updatedOptions = [...updated[qIdx].options];
      updatedOptions[optIdx] = val;
      updated[qIdx] = { ...updated[qIdx], options: updatedOptions };
      return { ...prev, questions: updated };
    });
  };

  const addOptionToQuestion = (qIdx: number) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      if (updated[qIdx].options.length >= 6) return prev;
      updated[qIdx] = { ...updated[qIdx], options: [...updated[qIdx].options, ""] };
      return { ...prev, questions: updated };
    });
  };

  const removeOptionFromQuestion = (qIdx: number, optIdx: number) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      const q = updated[qIdx];
      if (q.options.length <= 2) return prev;
      const updatedOptions = [...q.options];
      updatedOptions.splice(optIdx, 1);
      let correctOpt = q.correctOption;
      if (correctOpt === optIdx) {
        correctOpt = 0;
      } else if (correctOpt > optIdx) {
        correctOpt -= 1;
      }
      updated[qIdx] = { ...q, options: updatedOptions, correctOption: correctOpt };
      return { ...prev, questions: updated };
    });
  };

  const setQuestionCorrectOption = (qIdx: number, optIdx: number) => {
    setQuiz((prev: any) => {
      const updated = [...prev.questions];
      updated[qIdx] = { ...updated[qIdx], correctOption: optIdx };
      return { ...prev, questions: updated };
    });
  };


  const attachments = files.filter((f) => f.category === "Attachment");
  const submissions = files.filter((f) => f.category === "Submission");
  const mySubmission = submissions.find((s) => s.uploadedById === currentUser?.id) || null;

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/subjects/${id}/lessons/${lessonId}/files`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (e) {
      console.error("Error fetching lesson files:", e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [id, lessonId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: "Attachment" | "Submission") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [
      "pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx",
      "png", "jpg", "jpeg", "webp", "txt", "zip", "rar"
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(fileExtension)) {
      showToast("Invalid file format. Please upload PDF, Word, Excel, CSV, PowerPoint, Images, TXT, or ZIP/RAR files.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    if (category === "Submission") {
      setUploadingProgress(0);
    } else {
      setAttachingProgress(0);
    }

    try {
      const token = localStorage.getItem("token");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/subjects/${id}/lessons/${lessonId}/files`, true);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          if (category === "Submission") {
            setUploadingProgress(progress);
          } else {
            setAttachingProgress(progress);
          }
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 201) {
          showToast("File uploaded successfully!", "success");
          fetchFiles();
        } else {
          let errMsg = "Failed to upload file";
          try {
            const errBody = JSON.parse(xhr.responseText);
            errMsg = errBody.error || errMsg;
          } catch (err) {}
          showToast(errMsg, "error");
        }
        if (category === "Submission") {
          setUploadingProgress(null);
        } else {
          setAttachingProgress(null);
        }
      };

      xhr.onerror = () => {
        showToast("Network error occurred during upload.", "error");
        if (category === "Submission") {
          setUploadingProgress(null);
        } else {
          setAttachingProgress(null);
        }
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred", "error");
      if (category === "Submission") {
        setUploadingProgress(null);
      } else {
        setAttachingProgress(null);
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/subjects/${id}/files/${fileId}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast("File deleted successfully!", "success");
        fetchFiles();
      } else {
        const errBody = await res.json().catch(() => ({}));
        showToast(errBody.error || "Failed to delete file", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete file", "error");
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
                className="flex flex-col gap-6 w-full"
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
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#f25c88";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lesson Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditType("learning")}
                      className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                        editType === "learning"
                          ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950"
                          : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      Learning
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType("assignment")}
                      className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                        editType === "assignment"
                          ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950"
                          : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      Assignment
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType("quizzes")}
                      className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                        editType === "quizzes"
                          ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950"
                          : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      Quizzes
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={6}
                    className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium text-zinc-700 focus:outline-none transition-colors duration-200 resize-none"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#f25c88";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Lesson Materials / Attachments
                  </label>
                  {attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {attachments.map((file) => (
                        <div key={file.id} className="border border-[#E5E1D8] bg-[#FAF7F2]/40 rounded-xl p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-bold text-zinc-800 truncate">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-semibold">
                                {(file.sizeBytes / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-rose-600 cursor-pointer transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  ) : (
                    <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "Attachment")}
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
                        className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f25c88";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                        }}
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
                        className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f25c88";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2 pt-2">
                      <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Submission Restriction
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setEditCloseType("open")}
                          className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                            editCloseType === "open"
                              ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950 font-bold"
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
                          onClick={() => setEditCloseType("restrict")}
                          className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                            editCloseType === "restrict"
                              ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950 font-bold"
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
              <div className="flex flex-col gap-6">
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

                <div className="text-[14px] text-zinc-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedLesson.desc || "No description provided for this lesson."}
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6">
                    <h3 className="text-[12px] font-extrabold text-[#121212] tracking-tight uppercase mb-2">
                      Lesson Materials / Attachments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {attachments.map((file) => (
                        <div key={file.id} className="border border-[#E5E1D8] bg-[#FAF7F2]/30 rounded-2xl p-4 flex flex-col justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <BookOpen className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-zinc-800 truncate text-left" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-semibold text-left mt-0.5">
                                {(file.sizeBytes / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[11px] shadow-sm transition-colors"
                            >
                              Download
                            </a>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold rounded-full text-[11px] transition-colors"
                                title="Delete Attachment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLesson.type === "assignment" && !canEdit && (
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
                    ) : mySubmission ? (
                      <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-zinc-800 truncate text-left">
                              {mySubmission.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold text-left">
                              {(mySubmission.sizeBytes / 1024).toFixed(1)} KB • Submitted successfully ({formatDate(mySubmission.createdAt)})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={mySubmission.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[11px] shadow-sm transition-colors"
                          >
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(mySubmission.id)}
                            className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "Submission")}
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

                {selectedLesson.type === "assignment" && canEdit && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight">
                        Student Homework Submissions
                      </h3>
                      <span className="px-2.5 py-0.5 bg-[#f25c88]/10 text-[#f25c88] text-[10px] font-bold rounded-full">
                        {submissions.length} Submissions
                      </span>
                    </div>

                    {submissions.length === 0 ? (
                      <div className="border border-dashed border-[#E5E1D8] bg-[#FAF7F2]/10 rounded-2xl p-6 text-center text-zinc-400 text-[12px] font-medium">
                        No submissions yet for this assignment.
                      </div>
                    ) : (
                      <div className="border border-[#EBE8E0] rounded-2xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-[#EBE8E0] text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">File Name</th>
                              <th className="px-4 py-3">Submitted At</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {submissions.map((sub) => (
                              <tr key={sub.id} className="text-[12px]">
                                <td className="px-4 py-3.5 font-bold text-zinc-800 flex items-center gap-2">
                                  {sub.uploadedBy?.avatar ? (
                                    <img
                                      src={sub.uploadedBy.avatar}
                                      alt={sub.uploadedBy.name}
                                      className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-[#f25c88]/10 text-[#f25c88] flex items-center justify-center font-bold text-[10px]">
                                      {sub.uploadedBy?.name?.slice(0, 2).toUpperCase() || "?"}
                                    </div>
                                  )}
                                  <span>{sub.uploadedBy?.name || "Unknown User"}</span>
                                </td>
                                <td className="px-4 py-3.5 text-zinc-600 font-medium truncate max-w-[150px]" title={sub.name}>
                                  {sub.name}
                                </td>
                                <td className="px-4 py-3.5 text-zinc-400 font-semibold">
                                  {formatDate(sub.createdAt)}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <a
                                      href={sub.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 border border-[#E5E1D8] hover:bg-zinc-50 text-zinc-700 font-bold rounded-full text-[10px] transition-colors"
                                    >
                                      Open File
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFile(sub.id)}
                                      className="px-3 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold rounded-full text-[10px] transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedLesson.type === "quizzes" && (
                  <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6">
                    {quizLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-2 border-[#f25c88]/20 border-t-[#f25c88] animate-spin" />
                        <span className="text-[12px] text-zinc-500 font-bold mt-3">Loading quiz portal...</span>
                      </div>
                    ) : !quiz ? (
                      <div className="border border-dashed border-[#E5E1D8] bg-[#FAF9F5]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                        <span className="text-[15px] text-zinc-800 font-bold">Quiz Not Ready</span>
                        <span className="text-[12px] text-zinc-500 font-medium max-w-md mt-1.5">
                          This quiz hasn't been set up yet by the lecturer. Please check back later.
                        </span>
                      </div>
                    ) : canEdit ? (
                      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-355">
                        <div className="flex items-center justify-between border-b border-[#E5E1D8]/40 pb-3">
                          <div className="flex items-center gap-1.5">
                            <Settings className="w-5 h-5 text-[#f25c88]" />
                            <h3 className="text-[15px] font-black text-zinc-850">Quiz Management Panel</h3>
                          </div>
                          <div className="flex bg-zinc-100 rounded-full p-1 border border-zinc-200/50">
                            <button
                              type="button"
                              onClick={() => setQuizTab("quiz")}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                quizTab === "quiz"
                                  ? "bg-[#121212] text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              Edit Quiz
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizTab("submissions")}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                quizTab === "submissions"
                                  ? "bg-[#121212] text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              Submissions & Stats
                            </button>
                          </div>
                        </div>

                        {quizTab === "quiz" ? (
                          <form onSubmit={handleSaveQuiz} className="flex flex-col gap-6 w-full text-left">
                            <div className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-4 shadow-sm">
                              <h4 className="text-[12px] font-extrabold text-[#121212] uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                                <Settings className="w-4 h-4 text-zinc-400" />
                                Quiz Policy & Settings
                              </h4>
                              
                              <div className="flex flex-col gap-5">
                                <label className="flex items-start gap-3.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={quiz.allowViewGrade}
                                    onChange={(e) => updateQuizSetting("allowViewGrade", e.target.checked)}
                                    className="mt-1 accent-[#f25c88] w-4 h-4"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12.5px] font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors">
                                      Watch Grade Option
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 leading-tight">
                                      Allow users to watch their grades and correct answers instantly after submitting.
                                    </span>
                                  </div>
                                </label>

                                <label className="flex items-start gap-3.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={quiz.showLeaderboard}
                                    onChange={(e) => updateQuizSetting("showLeaderboard", e.target.checked)}
                                    className="mt-1 accent-[#f25c88] w-4 h-4"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12.5px] font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors">
                                      Show Leaderboard Option
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 leading-tight">
                                      Show the leaderboard after they finish the attempt so they know their position relative to other participants.
                                    </span>
                                  </div>
                                </label>

                                <label className="flex items-start gap-3.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={quiz.allowGuest}
                                    onChange={(e) => updateQuizSetting("allowGuest", e.target.checked)}
                                    className="mt-1 accent-[#f25c88] w-4 h-4"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12.5px] font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors">
                                      Guest Access Option
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 leading-tight">
                                      Make the quiz accessible to unsigned users (guests) without requiring account sign-in.
                                    </span>
                                  </div>
                                </label>
                              </div>
                            </div>

                            <div className="flex flex-col gap-4">
                              <h4 className="text-[13px] font-extrabold text-[#121212] uppercase tracking-wider flex items-center gap-1.5 pl-1">
                                <ListOrdered className="w-4 h-4 text-[#f25c88]" />
                                Questions List ({quiz.questions?.length || 0})
                              </h4>

                              <div className="flex flex-col gap-6">
                                {quiz.questions?.map((q: any, qIdx: number) => (
                                  <div key={qIdx} className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl shadow-sm flex flex-col gap-4 relative">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                      <span className="text-[12px] font-bold text-[#f25c88]">
                                        Question #{qIdx + 1}
                                      </span>
                                      {quiz.questions.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeQuestion(qIdx)}
                                          className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                      <div className="md:col-span-9 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Question Text</label>
                                        <textarea
                                          value={q.questionText}
                                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                          placeholder="Type your question here..."
                                          rows={2}
                                          required
                                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium text-zinc-800 focus:outline-none focus:border-[#f25c88] focus:bg-white transition-colors"
                                        />
                                      </div>
                                      <div className="md:col-span-3 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Points</label>
                                        <input
                                          type="number"
                                          min={1}
                                          value={q.points || 1}
                                          onChange={(e) => updateQuestionPoints(qIdx, parseInt(e.target.value) || 1)}
                                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-[#f25c88] focus:bg-white transition-colors"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2.5 mt-2">
                                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Options (Pick the correct option)</label>
                                      <div className="flex flex-col gap-2">
                                        {q.options.map((opt: string, optIdx: number) => (
                                          <div key={optIdx} className="flex items-center gap-3 w-full">
                                            <button
                                              type="button"
                                              onClick={() => setQuestionCorrectOption(qIdx, optIdx)}
                                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                q.correctOption === optIdx
                                                  ? "bg-[#f25c88] border-[#f25c88] text-white"
                                                  : "border-zinc-300 hover:border-zinc-400 text-transparent"
                                              }`}
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                            </button>

                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                              placeholder={`Option ${optIdx + 1}`}
                                              required
                                              className="flex-1 px-3 py-2 bg-transparent border-b border-zinc-200 text-[13px] font-medium text-zinc-700 focus:outline-none focus:border-[#f25c88] transition-colors"
                                            />

                                            {q.options.length > 2 && (
                                              <button
                                                type="button"
                                                onClick={() => removeOptionFromQuestion(qIdx, optIdx)}
                                                className="p-1 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 transition-colors"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {q.options.length < 6 && (
                                        <button
                                          type="button"
                                          onClick={() => addOptionToQuestion(qIdx)}
                                          className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors w-fit mt-1.5 pl-9"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>Add Option</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={addQuestion}
                                className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/40 hover:bg-white rounded-3xl py-4 transition-all w-full text-[12px] font-bold text-zinc-650 cursor-pointer"
                              >
                                <Plus className="w-4 h-4 text-[#f25c88]" />
                                <span>Add New Question</span>
                              </button>
                            </div>

                            <div className="flex justify-end mt-4">
                              <button
                                type="submit"
                                disabled={quizSaving}
                                className="px-8 py-3 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {quizSaving ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                <span>Save Quiz Configuration</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl shadow-sm">
                            {attemptsLoading ? (
                              <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-6 h-6 rounded-full border-2 border-[#f25c88]/20 border-t-[#f25c88] animate-spin" />
                                <span className="text-[11px] text-zinc-500 mt-2">Loading submissions...</span>
                              </div>
                            ) : attempts.length === 0 ? (
                              <div className="text-center py-8 text-zinc-400 text-[12px] font-medium">
                                No submissions yet for this quiz.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[12px]">
                                  <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                      <th className="px-4 py-3">Rank</th>
                                      <th className="px-4 py-3">Participant</th>
                                      <th className="px-4 py-3">Type</th>
                                      <th className="px-4 py-3">Score</th>
                                      <th className="px-4 py-3">Percentage</th>
                                      <th className="px-4 py-3 text-right">Submitted At</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100">
                                    {attempts.map((att: any, idx: number) => {
                                      const isGuest = !att.userId;
                                      const name = isGuest ? att.guestName : (att.user?.name || "Deleted User");
                                      const pct = Math.round((att.score / att.totalPoints) * 100);
                                      return (
                                        <tr key={att.id} className="hover:bg-zinc-50/50">
                                          <td className="px-4 py-3 font-bold text-zinc-800">#{idx + 1}</td>
                                          <td className="px-4 py-3 font-bold text-zinc-800 flex items-center gap-2">
                                            {!isGuest && att.user?.avatar ? (
                                              <img
                                                src={att.user.avatar}
                                                alt={name}
                                                className="w-5 h-5 rounded-full object-cover border border-zinc-200"
                                              />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-[#f25c88]/10 text-[#f25c88] flex items-center justify-center font-bold text-[9px] border border-zinc-200">
                                                {name.slice(0, 2).toUpperCase()}
                                              </div>
                                            )}
                                            <span>{name}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                              isGuest ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            }`}>
                                              {isGuest ? "Guest" : "Student"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 font-bold text-zinc-700">{att.score} / {att.totalPoints}</td>
                                          <td className="px-4 py-3 font-bold text-[#f25c88]">{pct}%</td>
                                          <td className="px-4 py-3 text-right text-zinc-400 font-medium">{formatDate(att.submittedAt)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-6 text-left">
                        {myAttempt === null ? (
                          !currentUser && quiz.allowGuest && !isGuestStarted ? (
                            <div className="bg-white border border-[#E5E1D8]/60 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center max-w-lg mx-auto w-full animate-in fade-in duration-300">
                              <Trophy className="w-10 h-10 text-[#f25c88] mb-3" />
                              <h3 className="text-[16px] text-zinc-850 font-black">Guest Participant Access</h3>
                              <p className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1.5 mb-6">
                                Unsigned guest access is enabled. Please enter your name/nickname below to verify yourself and start the quiz.
                              </p>
                              <div className="flex flex-col gap-3.5 w-full">
                                <input
                                  type="text"
                                  placeholder="Enter your nickname (e.g. JohnD)"
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-[13px] text-center font-bold text-zinc-800 focus:outline-none focus:border-[#f25c88] focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (guestName.trim()) {
                                      setIsGuestStarted(true);
                                    } else {
                                      showToast("Please enter a name.", "error");
                                    }
                                  }}
                                  className="px-6 py-2.5 bg-[#f25c88] hover:bg-[#e14f7b] text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer active:scale-95"
                                >
                                  Enter & Start Quiz
                                </button>
                              </div>
                            </div>
                          ) : !currentUser && !quiz.allowGuest ? (
                            <div className="border border-dashed border-red-200 bg-red-50/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
                              <Lock className="w-8 h-8 text-red-500 mb-2" />
                              <span className="text-[14px] text-red-650 font-bold">Sign-in Required</span>
                              <span className="text-[12px] text-zinc-500 font-medium mt-1 mb-5">
                                Guest attempts are not allowed for this quiz. Please log in to your account.
                              </span>
                              <Link
                                href="/auth/login"
                                className="px-5 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[11px] shadow-sm transition-colors"
                              >
                                Go to Sign In
                              </Link>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-5 w-full animate-in fade-in duration-300">
                              <div className="flex items-center justify-between bg-zinc-50 border border-[#E5E1D8]/40 px-5 py-3 rounded-2xl">
                                <div className="flex flex-col text-left">
                                  <span className="text-[12px] font-extrabold text-zinc-800">
                                    Quiz in Progress
                                  </span>
                                  {!currentUser && (
                                    <span className="text-[10px] text-zinc-400 font-bold">
                                      Playing as Guest: <span className="text-zinc-655 font-extrabold">{guestName}</span>
                                    </span>
                                  )}
                                </div>
                                <span className="px-3 py-1 bg-[#f25c88]/10 text-[#f25c88] text-[10.5px] font-extrabold rounded-full">
                                  {quiz.questions?.length || 0} Questions
                                </span>
                              </div>

                              <div className="flex flex-col gap-6">
                                {quiz.questions?.map((q: any, qIdx: number) => (
                                  <div key={q.id} className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl shadow-sm flex flex-col gap-4 text-left">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                      <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                        Question {qIdx + 1}
                                      </span>
                                      <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded-full">
                                        {q.points || 1} pts
                                      </span>
                                    </div>
                                    <h4 className="text-[13.5px] font-bold text-zinc-800 leading-snug">
                                      {q.questionText}
                                    </h4>

                                    <div className="flex flex-col gap-2 mt-2">
                                      {q.options.map((opt: string, optIdx: number) => {
                                        const isSelected = userAnswers[q.id] === optIdx;
                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                            className={`w-full px-4 py-3 rounded-2xl border text-left text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                              isSelected
                                                ? "border-[#f25c88] bg-[#f25c88]/5 text-zinc-950 shadow-sm"
                                                : "border-zinc-200 bg-transparent text-zinc-650 hover:border-zinc-300"
                                            }`}
                                          >
                                            <span className="flex items-center gap-3">
                                              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border ${
                                                isSelected
                                                  ? "bg-[#f25c88] border-[#f25c88] text-white"
                                                  : "border-zinc-300 text-zinc-400"
                                              }`}>
                                                {String.fromCharCode(65 + optIdx)}
                                              </span>
                                              <span>{opt}</span>
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 text-[#f25c88]" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-end mt-4">
                                <button
                                  type="button"
                                  onClick={handleSubmitQuizAttempt}
                                  className="px-8 py-3 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                                >
                                  <CheckCircle2 className="w-4.5 h-4.5 text-[#f25c88]" />
                                  <span>Submit Quiz Attempt</span>
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
                            <div className="bg-white border border-[#E5E1D8]/60 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center">
                              <Trophy className="w-12 h-12 text-[#f25c88] mb-3 animate-bounce" />
                              <h3 className="text-[17px] text-zinc-850 font-black">Quiz Completed!</h3>
                              
                              {quiz.allowViewGrade ? (
                                <div className="mt-4 flex flex-col items-center">
                                  <div className="w-24 h-24 rounded-full border-4 border-[#f25c88] flex flex-col items-center justify-center bg-[#f25c88]/5">
                                    <span className="text-2xl font-black text-zinc-900">{myAttempt.score}</span>
                                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest border-t border-zinc-200 pt-0.5 mt-0.5">/ {myAttempt.totalPoints} pts</span>
                                  </div>
                                  <span className="text-[13px] font-bold text-zinc-800 mt-4">
                                    Percentage: <span className="text-[#f25c88]">{Math.round((myAttempt.score / myAttempt.totalPoints) * 100)}%</span>
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                                    Submitted at: {formatDate(myAttempt.submittedAt)}
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-3 bg-zinc-50 border border-zinc-150 px-4 py-3 rounded-2xl max-w-sm">
                                  <span className="text-[12.5px] font-bold text-zinc-700 leading-tight block">
                                    Attempt Recorded Successfully!
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-medium block mt-1">
                                    Your grades and answers are hidden by the lecturer.
                                  </span>
                                </div>
                              )}
                            </div>

                            {quiz.allowViewGrade && quiz.questions && (
                              <div className="flex flex-col gap-4 text-left">
                                <h4 className="text-[13px] font-extrabold text-[#121212] uppercase tracking-wider pl-1">
                                  Detailed Review
                                </h4>

                                <div className="flex flex-col gap-5">
                                  {quiz.questions.map((q: any, qIdx: number) => {
                                    const submittedAnsIdx = myAttempt.answers?.[q.id];
                                    const correctAnsIdx = q.correctOption !== undefined ? q.correctOption : myAttempt.correctAnswers?.[q.id];
                                    const isCorrect = submittedAnsIdx !== undefined && Number(submittedAnsIdx) === correctAnsIdx;

                                    return (
                                      <div key={q.id} className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                          <span className="text-[11.5px] font-extrabold text-zinc-400 uppercase tracking-wider font-semibold">
                                            Question {qIdx + 1}
                                          </span>
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                          }`}>
                                            {isCorrect ? "Correct" : "Incorrect"}
                                          </span>
                                        </div>

                                        <h4 className="text-[13.5px] font-bold text-zinc-800">
                                          {q.questionText}
                                        </h4>

                                        <div className="flex flex-col gap-2 mt-1">
                                          {q.options.map((opt: string, optIdx: number) => {
                                            const isMyChoice = submittedAnsIdx !== undefined && Number(submittedAnsIdx) === optIdx;
                                            const isRightChoice = correctAnsIdx !== undefined && Number(correctAnsIdx) === optIdx;
                                            
                                            let borderStyle = "border-zinc-200 text-zinc-500 bg-transparent";
                                            if (isRightChoice) {
                                              borderStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-800 font-bold";
                                            } else if (isMyChoice && !isCorrect) {
                                              borderStyle = "border-rose-500 bg-rose-500/5 text-rose-800 font-bold";
                                            }

                                            return (
                                              <div
                                                key={optIdx}
                                                className={`w-full px-4 py-2.5 rounded-2xl border text-[12px] flex items-center justify-between ${borderStyle}`}
                                              >
                                                <span>{opt}</span>
                                                {isRightChoice ? (
                                                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" /> Correct Answer
                                                  </span>
                                                ) : isMyChoice ? (
                                                  <span className="text-[10px] text-rose-600 font-extrabold uppercase flex items-center gap-1">
                                                    <X className="w-3.5 h-3.5" /> Your Answer
                                                  </span>
                                                ) : null}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {quiz.showLeaderboard && (
                              <div className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl shadow-sm text-left">
                                <h4 className="text-[13px] font-extrabold text-[#121212] uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-[#f25c88]" />
                                  Quiz Leaderboard
                                </h4>

                                {attemptsLoading ? (
                                  <div className="flex flex-col items-center justify-center py-6">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#f25c88]/20 border-t-[#f25c88] animate-spin" />
                                    <span className="text-[10px] text-zinc-400 mt-2">Refreshing ranking...</span>
                                  </div>
                                ) : attempts.length === 0 ? (
                                  <div className="text-center py-4 text-zinc-400 text-[11px] font-medium">
                                    Leaderboard is currently empty.
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[11.5px]">
                                      <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                          <th className="px-3 py-2.5">Rank</th>
                                          <th className="px-3 py-2.5">Participant</th>
                                          <th className="px-3 py-2.5">Score</th>
                                          <th className="px-3 py-2.5">Percentage</th>
                                          <th className="px-3 py-2.5 text-right">Date</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-zinc-100">
                                        {attempts.map((att: any, idx: number) => {
                                          const isGuest = !att.userId;
                                          const name = isGuest ? att.guestName : (att.user?.name || "Deleted User");
                                          const pct = Math.round((att.score / att.totalPoints) * 100);
                                          const isMe = (!currentUser && isGuest && guestName.trim() === att.guestName) || (currentUser && currentUser.id === att.userId);
                                          
                                          return (
                                            <tr key={att.id} className={`${isMe ? "bg-[#f25c88]/5 font-bold border-l-2 border-l-[#f25c88]" : ""}`}>
                                              <td className="px-3 py-2.5 text-zinc-700">#{idx + 1}</td>
                                              <td className="px-3 py-2.5 text-zinc-800 flex items-center gap-2">
                                                {!isGuest && att.user?.avatar ? (
                                                  <img
                                                    src={att.user.avatar}
                                                    alt={name}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-4 h-4 rounded-full bg-[#f25c88]/10 text-[#f25c88] flex items-center justify-center font-bold text-[8.5px]">
                                                    {name.slice(0, 2).toUpperCase()}
                                                  </div>
                                                )}
                                                <span>{name} {isMe && "(You)"}</span>
                                                {isGuest && (
                                                  <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1.5 py-0.2 rounded">Guest</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2.5 text-zinc-700">{att.score} / {att.totalPoints}</td>
                                              <td className="px-3 py-2.5 text-[#f25c88]">{pct}%</td>
                                              <td className="px-3 py-2.5 text-right text-zinc-400">{formatDate(att.submittedAt)}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
