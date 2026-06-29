"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "../../../../../../components/views/Header";
import { useLms } from "../../../../../../context/LmsContext";
import { StorageTracker } from "../../../../../../components/ui/StorageTracker";
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
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Eye,
  EyeOff,
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
  const { subjects, currentUser, updateSubject, showToast, isLoadingUser, refreshSubjects } = useLms();
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
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizTab, setQuizTab] = useState<"quiz" | "settings" | "submissions">("quiz");
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<any>(null);
  const [showSubjectDetails, setShowSubjectDetails] = useState<boolean>(true);
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiDifficulty, setAiDifficulty] = useState<string>("medium");
  const [aiLanguage, setAiLanguage] = useState<string>("English");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isGuestStarted, setIsGuestStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [answerLogs, setAnswerLogs] = useState<{ questionId: string; optionIndex: number; createdAt: string }[]>([]);
  const [myAttempt, setMyAttempt] = useState<any>(null);

  // Assignment states
  const [assignmentSettings, setAssignmentSettings] = useState<any>(null);
  const [assignmentAllowedTypes, setAssignmentAllowedTypes] = useState<string[]>([]);
  const [assignmentMaxSizeMb, setAssignmentMaxSizeMb] = useState<number>(10);
  const [assignmentUserPermissions, setAssignmentUserPermissions] = useState<any[]>([]);
  const [myAssignmentSubmission, setMyAssignmentSubmission] = useState<any>(null);
  const [allAssignmentSubmissions, setAllAssignmentSubmissions] = useState<any[]>([]);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [savingAssignmentSettings, setSavingAssignmentSettings] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<"submissions" | "settings">("submissions");
  const [assignmentSearchText, setAssignmentSearchText] = useState("");
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState("");
  const [debouncedSubmissionSearchQuery, setDebouncedSubmissionSearchQuery] = useState("");
  const [submissionSortField, setSubmissionSortField] = useState<"fileSize" | "submittedAt">("submittedAt");
  const [submissionSortOrder, setSubmissionSortOrder] = useState<"asc" | "desc">("desc");

  // Presence/Presencion states
  const [presenceList, setPresenceList] = useState<any[]>([]);
  const [myPresence, setMyPresence] = useState<any>(null);
  const [isLoadingPresence, setIsLoadingPresence] = useState(false);
  const [isSubmittingPresence, setIsSubmittingPresence] = useState(false);
  const [presenceSearchQuery, setPresenceSearchQuery] = useState("");

  const fetchPresenceData = async () => {
    setIsLoadingPresence(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/presencion`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isInstructor) {
          setPresenceList(data.presenceList || []);
        } else {
          setMyPresence(data.myPresence || null);
        }
      }
    } catch (err) {
      console.error("Error fetching presence data:", err);
    } finally {
      setIsLoadingPresence(false);
    }
  };

  const handleSubmitPresence = async () => {
    setIsSubmittingPresence(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/presencion`, {
        method: "POST",
        headers: token ? { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        } : {},
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Presence submitted successfully!", "success");
        setMyPresence(data.presence);
        fetchPresenceData();
      } else {
        showToast(data.error || "Failed to submit presence", "error");
      }
    } catch (err: any) {
      console.error("Error submitting presence:", err);
      showToast(err.message || "Failed to submit presence", "error");
    } finally {
      setIsSubmittingPresence(false);
    }
  };

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
        if (data.userAttempt) {
          setMyAttempt(data.userAttempt);
          const userIdSuffix = currentUser ? currentUser.id : "guest";
          localStorage.setItem(`quiz_attempt_${lessonId}_${userIdSuffix}`, JSON.stringify(data.userAttempt));
        } else if (currentUser) {
          setMyAttempt(null);
          localStorage.removeItem(`quiz_attempt_${lessonId}_${currentUser.id}`);
        }
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

  const fetchAssignmentData = async () => {
    if (selectedLesson?.type !== "assignment") return;
    setIsLoadingAssignment(true);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};

      // 1. Fetch settings
      const settingsRes = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/settings`, { headers });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setAssignmentSettings(settingsData);
        setAssignmentAllowedTypes(settingsData.globalSettings.allowedTypes);
        setAssignmentMaxSizeMb(settingsData.globalSettings.maxSizeMb);
        setAssignmentUserPermissions(settingsData.userPermissions);
      }

      // 2. Fetch my submission
      const mySubRes = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/my-submission`, { headers });
      if (mySubRes.ok) {
        const mySubData = await mySubRes.json();
        setMyAssignmentSubmission(mySubData);
      }

      // 3. Fetch all submissions
      const allSubsRes = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/submissions`, { headers });
      if (allSubsRes.ok) {
        const allSubsData = await allSubsRes.json();
        setAllAssignmentSubmissions(allSubsData);
      }
    } catch (err) {
      console.error("Error fetching assignment data:", err);
    } finally {
      setIsLoadingAssignment(false);
    }
  };

  useEffect(() => {
    if (isLoadingUser) return;
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
    } else if (selectedLesson?.type === "assignment") {
      fetchAssignmentData();
    } else if (selectedLesson?.type === "presencion") {
      fetchPresenceData();
    }
  }, [lessonId, selectedLesson?.type, currentUser, isLoadingUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSubmissionSearchQuery(submissionSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [submissionSearchQuery]);

  const handleAutoCreateQuiz = async () => {
    if (!selectedLesson) return;
    setIsGeneratingQuiz(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/ai/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lessonTitle: selectedLesson.title,
          lessonDesc: selectedLesson.desc || "",
          subjectName: selectedSubject?.name || "",
          subjectDesc: selectedSubject?.description || "",
          questionCount: Math.min(Math.max(1, aiQuestionCount), 10),
          difficulty: aiDifficulty,
          language: aiLanguage,
        }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          throw new Error("AI is busy right now. Please try again shortly.");
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || "Failed to generate quiz");
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuiz((prev: any) => ({
          ...prev,
          questions: data.questions
        }));
        showToast(`Successfully generated ${data.questions.length} quiz questions!`, "success");
      } else {
        showToast("AI generated no questions. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("AI Quiz Autofill failed:", err);
      let userFriendlyMessage = err.message || "";
      const msgLower = userFriendlyMessage.toLowerCase();

      if (msgLower.includes("failed to fetch") || msgLower.includes("network")) {
        userFriendlyMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (msgLower.includes("limit reached") || msgLower.includes("token")) {
        userFriendlyMessage = "Daily AI token limit reached. Resets tomorrow.";
      } else if (msgLower.includes("api_key") || msgLower.includes("api key") || msgLower.includes("unconfigured")) {
        userFriendlyMessage = "AI generator is temporarily offline due to setup issues. Please try again later.";
      } else if (msgLower.includes("busy") || msgLower.includes("503") || msgLower.includes("overloaded") || msgLower.includes("rate") || msgLower.includes("quota") || msgLower.includes("exhausted")) {
        userFriendlyMessage = "AI is currently busy handling other requests. Please wait a few seconds and try again.";
      } else {
        userFriendlyMessage = "We couldn't generate the quiz questions. Please try again or type them manually.";
      }

      showToast(userFriendlyMessage, "error");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

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
          answerLogs,
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

  const moveQuestion = (qIdx: number, direction: "up" | "down") => {
    if (!quiz || !quiz.questions) return;
    const newQuestions = [...quiz.questions];
    const targetIdx = direction === "up" ? qIdx - 1 : qIdx + 1;
    if (targetIdx < 0 || targetIdx >= newQuestions.length) return;

    const temp = newQuestions[qIdx];
    newQuestions[qIdx] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;

    setQuiz((prev: any) => ({
      ...prev,
      questions: newQuestions
    }));
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

    const limitBytes = 200 * 1024 * 1024;
    if (file.size > limitBytes) {
      showToast("File size exceeds your maximum storage quota of 200 MB.", "error");
      return;
    }

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
          refreshSubjects();
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
        refreshSubjects();
      } else {
        const errBody = await res.json().catch(() => ({}));
        showToast(errBody.error || "Failed to delete file", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete file", "error");
    }
  };

  const handleAssignmentSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check client side size and type constraints based on assignmentSettings
    const allowed = assignmentAllowedTypes.length > 0
      ? assignmentAllowedTypes
      : ["pdf", "doc", "docx", "png", "jpg", "jpeg", "zip"];
    const maxSize = assignmentMaxSizeMb;

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (allowed.length > 0 && !allowed.includes(fileExtension)) {
      showToast(`Invalid file format. Allowed types: ${allowed.join(", ")}`, "error");
      return;
    }

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > maxSize) {
      showToast(`File exceeds maximum size of ${maxSize}MB.`, "error");
      return;
    }

    const extension = file.name.split(".").pop() || "";
    const studentName = currentUser?.name || "student";
    const moduleNameStr = selectedModule?.title || "module";
    const lessonNameStr = selectedLesson?.title || "lesson";
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const newFileName = `${sanitize(studentName)}-${sanitize(moduleNameStr)}-${sanitize(lessonNameStr)}-${dateStr}-${id}.${extension}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);

    setUploadingProgress(0);
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
          setUploadingProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 201) {
          showToast("Assignment submitted successfully!", "success");
          fetchAssignmentData();
        } else {
          let errMsg = "Failed to submit assignment";
          try {
            const errBody = JSON.parse(xhr.responseText);
            errMsg = errBody.error || errMsg;
          } catch (err) {}
          showToast(errMsg, "error");
        }
        setUploadingProgress(null);
      };

      xhr.onerror = () => {
        showToast("Network error occurred during upload.", "error");
        setUploadingProgress(null);
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred", "error");
      setUploadingProgress(null);
    }
  };

  const handleAssignmentDelete = async (targetUserId?: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const token = localStorage.getItem("token");
      const url = targetUserId
        ? `${API_BASE_URL}/lessons/${lessonId}/assignment/submit?userId=${targetUserId}`
        : `${API_BASE_URL}/lessons/${lessonId}/assignment/submit`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (res.ok) {
        showToast("Submission deleted successfully!", "success");
        fetchAssignmentData();
      } else {
        const errBody = await res.json().catch(() => ({}));
        showToast(errBody.error || "Failed to delete submission", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete submission", "error");
    }
  };

  const handleSaveAssignmentSettings = async () => {
    setSavingAssignmentSettings(true);
    try {
      const token = localStorage.getItem("token");
      const formattedPermissions = assignmentUserPermissions.map((p) => ({
        userId: p.userId,
        canSubmit: p.canSubmit,
      }));

      const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/assignment/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          allowedTypes: assignmentAllowedTypes,
          maxSizeMb: assignmentMaxSizeMb,
          userPermissions: formattedPermissions,
        }),
      });

      if (res.ok) {
        showToast("Assignment settings saved successfully!", "success");
        fetchAssignmentData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save settings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving assignment settings", "error");
    } finally {
      setSavingAssignmentSettings(false);
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

  const myPermission = assignmentUserPermissions.find((p) => p.userId === currentUser?.id);
  const canStudentSubmit = myPermission ? myPermission.canSubmit : true;

  const sortedSubmissions = [...allAssignmentSubmissions].sort((a, b) => {
    if (submissionSortField === "submittedAt") {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return submissionSortOrder === "asc" ? timeA - timeB : timeB - timeA;
    } else {
      const sizeA = Number(a.fileSize || 0);
      const sizeB = Number(b.fileSize || 0);
      return submissionSortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
    }
  });

  const filteredSubmissions = sortedSubmissions.filter((sub) => {
    const name = sub.user?.name?.toLowerCase() || "";
    const email = sub.user?.email?.toLowerCase() || "";
    const file = sub.fileName?.toLowerCase() || "";
    const query = debouncedSubmissionSearchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || file.includes(query);
  });

  const handleSortSubmissions = (field: "fileSize" | "submittedAt") => {
    if (submissionSortField === field) {
      setSubmissionSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSubmissionSortField(field);
      setSubmissionSortOrder("desc");
    }
  };

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
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold">Lesson not found.</span>
          <Link
            href="/dashboard"
            className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all"
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

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full px-6 md:px-8">
        <div className="flex items-center justify-between mt-1">
          <Link
            href={`/dashboard/subject/${selectedSubject.id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSubjectDetails(prev => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-[#E5E1D8]/70 rounded-xl text-[11px] font-semibold text-zinc-650 shadow-sm cursor-pointer transition-all"
            >
              {showSubjectDetails ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Show Details</span>
                </>
              )}
            </button>
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm cursor-pointer transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Lesson</span>
              </button>
            )}
            <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
              Lesson Detail
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-8 items-start text-left ${
          !showSubjectDetails 
            ? "" 
            : selectedLesson.type === "learning" 
            ? "lg:grid-cols-4" 
            : "lg:grid-cols-3"
        }`}>
          <div className={`flex flex-col gap-6 lg:order-2 ${
            !showSubjectDetails 
              ? "w-full lg:col-span-full" 
              : selectedLesson.type === "learning" 
              ? "lg:col-span-3" 
              : "lg:col-span-2"
          }`}>
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
                      e.target.style.borderColor = "#facc15";
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
                  <div className="grid grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditType("learning")}
                      className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                        editType === "learning"
                          ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
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
                          ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
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
                          ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                          : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      Quizzes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType("presencion")}
                      className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
                        editType === "presencion"
                          ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                          : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      Presence
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
                      e.target.style.borderColor = "#facc15";
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
                          className="h-full bg-[#facc15] rounded-full transition-all duration-150"
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

                {(editType === "assignment" || editType === "quizzes" || editType === "presencion") && (
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
                          e.target.style.borderColor = "#facc15";
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
                          e.target.style.borderColor = "#facc15";
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
                          onClick={() => setEditCloseType("restrict")}
                          className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                            editCloseType === "restrict"
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
                {selectedLesson.type === "learning" && (
                  <div className="flex flex-col gap-6 bg-transparent border-none p-0 shadow-none select-text animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1.5 pb-4 border-b border-[#E5E1D8]/45">
                      <span className="inline-block text-[9px] font-semibold px-2.5 py-0.5 rounded-full w-fit bg-[#facc15]/10 text-[#d97706] border border-[#f97316]/15 uppercase tracking-wide">
                        {selectedLesson.type || "learning"}
                      </span>
                      <h1 className="text-3xl font-semibold text-zinc-800 tracking-tight mt-3 leading-snug">
                        {selectedLesson.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-zinc-500 font-semibold text-[12px] mt-2">
                        {selectedModule && (
                          <span className="bg-zinc-50 border border-[#E5E1D8]/70 px-3 py-1 rounded-full text-zinc-600 font-semibold uppercase text-[9px] tracking-wider">
                            Module: {selectedModule.title}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-zinc-400" />
                          Lecturers: {selectedSubject.lecturers.map((l) => l.name).join(", ")}
                        </span>
                      </div>
                    </div>

                    {selectedLesson.desc ? (
                      <div className="text-[14.5px] text-zinc-800 leading-relaxed font-normal whitespace-pre-wrap tracking-wide pt-2 select-text text-left">
                        {selectedLesson.desc}
                      </div>
                    ) : (
                      <div className="text-[12px] text-zinc-400 font-semibold italic py-4">
                        No description or content provided for this learning lesson.
                      </div>
                    )}
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[12px] font-semibold text-zinc-800 tracking-tight uppercase mb-2">
                      Lesson Materials / Attachments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {attachments.map((file) => (
                        <div key={file.id} className="border border-[#E5E1D8]/70 bg-zinc-50 rounded-2xl p-4 flex flex-col justify-between gap-4">
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

                {selectedLesson.type === "presencion" && !canEdit && (
                  <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-1.5 text-left">
                      <h3 className="text-lg font-semibold text-zinc-800 tracking-tight">
                        Attendance Session
                      </h3>
                      <p className="text-[12px] text-zinc-500 font-medium">
                        Register your attendance for this class session.
                      </p>
                    </div>

                    {isLoadingPresence ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
                        <span className="text-[12px] text-zinc-500 font-bold mt-3">Loading session...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-5 text-left">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Attendance Window</span>
                            <div className="flex items-center gap-2 text-zinc-800 text-[13px] font-bold mt-1">
                              <Calendar className="w-4 h-4 text-[#d97706]" />
                              <span>{formatDate(selectedLesson.openDate)}</span>
                              <span className="text-zinc-300">—</span>
                              <span>{formatDate(selectedLesson.closeDate)}</span>
                            </div>
                          </div>

                          {myPresence ? (
                            <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 flex items-center gap-3">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                              <div className="flex flex-col text-left">
                                <span className="text-[13.5px] font-extrabold text-emerald-800">
                                  Attendance Registered Successfully!
                                </span>
                                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                  Checked in at {formatDate(myPresence.createdAt || new Date().toISOString())}
                                </span>
                              </div>
                            </div>
                          ) : new Date() < new Date(selectedLesson.openDate) ? (
                            <div className="border border-amber-350/30 bg-amber-500/[0.02] rounded-2xl p-5 flex items-center gap-3">
                              <Clock className="w-8 h-8 text-amber-500 shrink-0" />
                              <div className="flex flex-col text-left">
                                <span className="text-[13.5px] font-extrabold text-amber-800">
                                  Attendance Has Not Started
                                </span>
                                <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                  This session will open at {formatDate(selectedLesson.openDate)}.
                                </span>
                              </div>
                            </div>
                          ) : new Date() > new Date(selectedLesson.closeDate) ? (
                            <div className="border border-red-500/20 bg-red-500/[0.02] rounded-2xl p-5 flex items-center gap-3">
                              <Lock className="w-8 h-8 text-red-500 shrink-0" />
                              <div className="flex flex-col text-left">
                                <span className="text-[13.5px] font-extrabold text-red-800">
                                  Attendance Session Closed
                                </span>
                                <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                  The deadline was {formatDate(selectedLesson.closeDate)}. You did not check in.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-left">
                                <p className="text-[12px] text-rose-800 font-medium">
                                  The attendance session is currently active. Click the button below to register your presence for this lesson.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleSubmitPresence}
                                disabled={isSubmittingPresence}
                                className="w-full py-3.5 bg-[#facc15] hover:bg-[#e0527b] text-white font-extrabold rounded-2xl text-[13px] shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {isSubmittingPresence ? (
                                  <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                    <span>Submitting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Submit Presence</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedLesson.type === "presencion" && canEdit && (
                  <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6 animate-in fade-in duration-300 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-zinc-800 tracking-tight">
                          Attendance Control Panel
                        </h3>
                        <p className="text-[12px] text-zinc-500 font-medium">
                          Monitor student attendance and registration timestamps.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-zinc-400 font-bold">
                          Active Window: {formatDate(selectedLesson.openDate)} — {formatDate(selectedLesson.closeDate)}
                        </span>
                      </div>
                    </div>

                    {isLoadingPresence ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
                        <span className="text-[12px] text-zinc-500 font-bold mt-3">Loading presence dashboard...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-4.5 text-left flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Total Enrolled</span>
                            <span className="text-2xl font-semibold text-zinc-800">{presenceList.length}</span>
                          </div>
                          <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-4.5 text-left flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-emerald-600">Present</span>
                            <span className="text-2xl font-semibold text-emerald-600">
                              {presenceList.filter((p) => p.submitted).length}
                            </span>
                          </div>
                          <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-4.5 text-left flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-rose-500">Absent</span>
                            <span className="text-2xl font-semibold text-rose-500">
                              {presenceList.filter((p) => !p.submitted).length}
                            </span>
                          </div>
                          <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-4.5 text-left flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-[#d97706]">Rate</span>
                            <span className="text-2xl font-semibold text-[#d97706]">
                              {presenceList.length > 0
                                ? `${((presenceList.filter((p) => p.submitted).length / presenceList.length) * 100).toFixed(1)}%`
                                : "0.0%"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-sm">
                              <input
                                type="text"
                                value={presenceSearchQuery}
                                onChange={(e) => setPresenceSearchQuery(e.target.value)}
                                className="bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl pl-8 pr-3 py-2 text-[13px] w-full focus:outline-none text-zinc-800 font-semibold"
                                placeholder="Search student name or email..."
                              />
                              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                            </div>
                            <button
                              type="button"
                              onClick={fetchPresenceData}
                              className="px-4 py-2 rounded-xl border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 font-semibold text-[11px] bg-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                            >
                              Refresh Data
                            </button>
                          </div>

                          {presenceList.filter(
                            (p) =>
                              p.user?.name.toLowerCase().includes(presenceSearchQuery.toLowerCase()) ||
                              p.user?.email.toLowerCase().includes(presenceSearchQuery.toLowerCase())
                          ).length === 0 ? (
                            <div className="border border-dashed border-[#E5E1D8]/70 bg-zinc-50 rounded-2xl p-6 text-center text-zinc-400 text-[12px] font-medium">
                              {presenceSearchQuery ? "No students match your query." : "No enrolled students found in this course subject."}
                            </div>
                          ) : (
                            <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] overflow-hidden">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-zinc-50 border-b border-[#E5E1D8]/70 text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
                                    <th className="px-4 py-3">Student Details</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Recorded Check-in</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {presenceList
                                    .filter(
                                      (p) =>
                                        p.user?.name.toLowerCase().includes(presenceSearchQuery.toLowerCase()) ||
                                        p.user?.email.toLowerCase().includes(presenceSearchQuery.toLowerCase())
                                    )
                                    .map((p) => (
                                      <tr key={p.user.id} className="text-[12px] hover:bg-zinc-50/40 transition-colors">
                                        <td className="px-4 py-3.5 font-semibold text-zinc-800 flex items-center gap-2.5">
                                          {p.user.avatar ? (
                                            <img
                                              src={p.user.avatar}
                                              alt={p.user.name}
                                              className="w-6.5 h-6.5 rounded-full object-cover border border-zinc-200"
                                            />
                                          ) : (
                                            <div className="w-6.5 h-6.5 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold text-[10px]">
                                              {p.user.name.slice(0, 2).toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex flex-col text-left">
                                            <span className="font-bold text-zinc-800">{p.user.name}</span>
                                            <span className="text-[9.5px] text-zinc-400 font-semibold">{p.user.email}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                          {p.submitted ? (
                                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                              Present
                                            </span>
                                          ) : (
                                            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                                              Absent
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-zinc-500">
                                          {p.submittedAt ? formatDate(p.submittedAt) : "—"}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedLesson.type === "assignment" && !canEdit && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                    <h3 className="text-[15px] font-semibold text-zinc-800 tracking-tight mb-2">
                      Submit Homework
                    </h3>

                    {!canStudentSubmit ? (
                      <div className="border border-red-200 bg-red-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <Lock className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-[14px] text-red-600 font-bold">Submission Blocked</span>
                        <span className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1">
                          You do not have permission to submit this assignment. Please contact your instructor.
                        </span>
                      </div>
                    ) : isLocked ? (
                      <div className="border border-red-200 bg-red-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-[14px] text-red-600 font-bold">Submission Closed</span>
                        <span className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1">
                          This assignment was locked on {formatDate(selectedLesson.closeDate)} and is
                          no longer accepting submissions.
                        </span>
                      </div>
                    ) : uploadingProgress !== null ? (
                      <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[12px] font-bold text-zinc-500">
                          <span>Uploading document...</span>
                          <span>{uploadingProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-100">
                          <div
                            className="h-full bg-[#facc15] rounded-full transition-all duration-150"
                            style={{ width: `${uploadingProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : myAssignmentSubmission ? (
                      <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-zinc-800 truncate text-left">
                              {myAssignmentSubmission.fileName}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold text-left">
                              {(myAssignmentSubmission.fileSize / 1024).toFixed(1)} KB • Submitted successfully ({formatDate(myAssignmentSubmission.submittedAt)})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={myAssignmentSubmission.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[11px] shadow-sm transition-colors"
                          >
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => handleAssignmentDelete()}
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
                          onChange={handleAssignmentSubmit}
                        />
                        <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                        <div className="flex flex-col items-center">
                          <span className="text-[12px] font-bold text-zinc-800">
                            Click to upload your assignment
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-1">
                            Allowed formats: {assignmentAllowedTypes.length > 0 ? assignmentAllowedTypes.join(", ").toUpperCase() : "ANY"} (up to {assignmentMaxSizeMb}MB)
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                )}

                {selectedLesson.type === "assignment" && canEdit && (
                  <div className="flex flex-col gap-6 w-full animate-in fade-in duration-355 border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between border-b border-[#E5E1D8]/40 pb-3">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-5 h-5 text-[#d97706]" />
                        <h3 className="text-[15px] font-semibold text-zinc-800">Assignment Control Panel</h3>
                      </div>
                      <div className="flex bg-zinc-100 rounded-full p-1 border border-zinc-200/50">
                        <button
                          type="button"
                          onClick={() => setAssignmentTab("submissions")}
                          className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            assignmentTab === "submissions"
                              ? "bg-zinc-800 text-white shadow-sm"
                              : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          Submissions
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignmentTab("settings")}
                          className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            assignmentTab === "settings"
                              ? "bg-zinc-800 text-white shadow-sm"
                              : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          Assignment Settings
                        </button>
                      </div>
                    </div>                    {assignmentTab === "submissions" ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                          <h4 className="text-[13px] font-semibold text-zinc-800">
                            Student Submissions List
                          </h4>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                              <input
                                type="text"
                                value={submissionSearchQuery}
                                onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                                className="bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl pl-8 pr-3 py-1.5 text-[13px] w-full focus:outline-none text-zinc-800 font-semibold"
                                placeholder="Search by student name or file..."
                              />
                              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
                            </div>
                            <span className="px-2.5 py-0.5 bg-[#facc15]/10 text-[#d97706] text-[10px] font-bold rounded-full whitespace-nowrap shrink-0">
                              {filteredSubmissions.length} Submissions
                            </span>
                          </div>
                        </div>

                        {filteredSubmissions.length === 0 ? (
                          <div className="border border-dashed border-[#E5E1D8]/70 bg-zinc-50 rounded-2xl p-6 text-center text-zinc-400 text-[12px] font-medium">
                            {debouncedSubmissionSearchQuery ? "No submissions match your search query." : "No student submissions yet for this assignment."}
                          </div>
                        ) : (
                          <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-50 border-b border-[#E5E1D8]/70 text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
                                  <th className="px-4 py-3">Student</th>
                                  <th className="px-4 py-3">File Name</th>
                                  <th
                                    className="px-4 py-3 cursor-pointer hover:bg-zinc-100 select-none transition-all"
                                    onClick={() => handleSortSubmissions("fileSize")}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>File Size</span>
                                      {submissionSortField === "fileSize" ? (
                                        submissionSortOrder === "asc" ? (
                                          <ChevronUp className="w-3.5 h-3.5 text-[#d97706]" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5 text-[#d97706]" />
                                        )
                                      ) : (
                                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 hover:text-zinc-550" />
                                      )}
                                    </div>
                                  </th>
                                  <th
                                    className="px-4 py-3 cursor-pointer hover:bg-zinc-100 select-none transition-all"
                                    onClick={() => handleSortSubmissions("submittedAt")}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>Submitted At</span>
                                      {submissionSortField === "submittedAt" ? (
                                        submissionSortOrder === "asc" ? (
                                          <ChevronUp className="w-3.5 h-3.5 text-[#d97706]" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5 text-[#d97706]" />
                                        )
                                      ) : (
                                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 hover:text-zinc-550" />
                                      )}
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100">
                                {filteredSubmissions.map((sub) => (
                                  <tr key={sub.id} className="text-[12px]">
                                    <td className="px-4 py-3.5 font-bold text-zinc-800 flex items-center gap-2">
                                      {sub.user?.avatar ? (
                                        <img
                                          src={sub.user.avatar}
                                          alt={sub.user.name}
                                          className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold text-[10px]">
                                          {sub.user?.name?.slice(0, 2).toUpperCase() || "?"}
                                        </div>
                                      )}
                                      <span>{sub.user?.name || "Unknown User"}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-zinc-600 font-medium truncate max-w-[150px]" title={sub.fileName}>
                                      {sub.fileName}
                                    </td>
                                    <td className="px-4 py-3.5 text-zinc-500 font-medium">
                                      {(sub.fileSize / 1024).toFixed(1)} KB
                                    </td>
                                    <td className="px-4 py-3.5 text-zinc-400 font-semibold">
                                      {formatDate(sub.submittedAt)}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedAssignmentForReview(sub)}
                                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full text-[10px] transition-colors cursor-pointer"
                                        >
                                          Review
                                        </button>
                                        <a
                                          href={sub.filePath}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-1.5 border border-[#E5E1D8] hover:bg-zinc-50 text-zinc-700 font-bold rounded-full text-[10px] transition-colors"
                                        >
                                          Open File
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleAssignmentDelete(sub.userId)}
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
                    ) : (
                      <div className="flex flex-col gap-6 w-full text-left bg-zinc-50 rounded-2xl p-6">
                        <h4 className="text-[14px] font-semibold text-zinc-800 mb-2">Assignment Configuration</h4>
                        
                        {/* Allowed File Formats */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Allowed File Formats</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "zip", "rar"].map((format) => {
                              const isSelected = assignmentAllowedTypes.includes(format);
                              return (
                                <button
                                  key={format}
                                  type="button"
                                  onClick={() => {
                                    setAssignmentAllowedTypes(prev =>
                                      prev.includes(format)
                                        ? prev.filter(f => f !== format)
                                        : [...prev, format]
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                    isSelected
                                      ? "bg-[#facc15]/10 text-[#d97706] border-[#f97316]/30"
                                      : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                                  }`}
                                >
                                  .{format.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-zinc-500">Or specify custom comma-separated formats:</span>
                            <input
                              type="text"
                              value={assignmentAllowedTypes.join(", ")}
                              onChange={(e) => {
                                const val = e.target.value;
                                const types = val.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                                setAssignmentAllowedTypes(types);
                              }}
                              className="bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl px-3 py-2 text-[13px] w-full focus:outline-none text-zinc-800 font-semibold"
                              placeholder="e.g. txt, csv, pptx"
                            />
                            <span className="text-[10px] text-zinc-400 font-medium">Leave empty to allow all file types.</span>
                          </div>
                        </div>

                        {/* Max File Size */}
                        <div className="flex flex-col gap-2 border-t border-zinc-200/50 pt-4">
                          <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
                            <span>Maximum File Size Limit</span>
                            <span className="text-[#d97706] bg-[#facc15]/10 px-2 py-0.5 rounded-full font-black text-[11px]">
                              {assignmentMaxSizeMb} MB
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={assignmentMaxSizeMb}
                            onChange={(e) => setAssignmentMaxSizeMb(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#facc15]"
                          />
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Set the maximum allowed file size per submission (between 1MB and 100MB).
                          </span>
                        </div>

                        {/* Student Permissions */}
                        <div className="flex flex-col gap-3 border-t border-zinc-200/50 pt-4">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[12px] font-extrabold text-zinc-700">Student Access Controls</label>
                            <input
                              type="text"
                              value={assignmentSearchText}
                              onChange={(e) => setAssignmentSearchText(e.target.value)}
                              className="bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl px-3 py-1.5 text-[13px] w-48 focus:outline-none text-zinc-800 font-semibold"
                              placeholder="Search student..."
                            />
                          </div>

                          <div className="border border-zinc-200/70 bg-white rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-zinc-100">
                            {assignmentUserPermissions.length === 0 ? (
                              <div className="p-4 text-center text-zinc-400 text-[11px] font-medium">
                                No students enrolled in this subject.
                              </div>
                            ) : (
                              assignmentUserPermissions
                                .filter((p) => {
                                  const name = p.user?.name?.toLowerCase() || "";
                                  const email = p.user?.email?.toLowerCase() || "";
                                  const query = assignmentSearchText.toLowerCase();
                                  return name.includes(query) || email.includes(query);
                                })
                                .map((perm) => (
                                  <div key={perm.userId} className="flex items-center justify-between p-3 text-[12px]">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {perm.user?.avatar ? (
                                        <img
                                          src={perm.user.avatar}
                                          alt={perm.user.name}
                                          className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold text-[9px]">
                                          {perm.user?.name?.slice(0, 2).toUpperCase() || "?"}
                                        </div>
                                      )}
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-zinc-800 truncate text-left">{perm.user?.name || "Unknown"}</span>
                                        <span className="text-[9px] text-zinc-400 truncate text-left">{perm.user?.email || ""}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      title={perm.canSubmit ? "Click to block this student's access to submission" : "Click to allow this student to submit assignments"}
                                      onClick={() => {
                                        setAssignmentUserPermissions(prev =>
                                          prev.map(p => p.userId === perm.userId ? { ...p, canSubmit: !p.canSubmit } : p)
                                        );
                                      }}
                                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        perm.canSubmit
                                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
                                      }`}
                                    >
                                      {perm.canSubmit ? "Allowed" : "Blocked"}
                                    </button>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-zinc-200/50 mt-2">
                          <button
                            type="button"
                            disabled={savingAssignmentSettings}
                            onClick={handleSaveAssignmentSettings}
                            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {savingAssignmentSettings ? "Saving Settings..." : "Save Assignment Configuration"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedLesson.type === "quizzes" && (
                  <div className="flex flex-col gap-6 border-t border-zinc-100 pt-6">
                    {quizLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
                        <span className="text-[12px] text-zinc-500 font-bold mt-3">Loading quiz portal...</span>
                      </div>
                    ) : !quiz ? (
                      <div className="border border-dashed border-[#E5E1D8]/70 bg-zinc-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                        <span className="text-[15px] text-zinc-800 font-semibold">Quiz Not Ready</span>
                        <span className="text-[12px] text-zinc-500 font-medium max-w-md mt-1.5">
                          This quiz hasn't been set up yet by the lecturer. Please check back later.
                        </span>
                      </div>
                    ) : canEdit ? (
                      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-355">
                        <div className="flex items-center justify-between border-b border-[#E5E1D8]/40 pb-3">
                          <div className="flex items-center gap-1.5">
                            <Settings className="w-5 h-5 text-[#d97706]" />
                            <h3 className="text-[15px] font-semibold text-zinc-800">Quiz Management Panel</h3>
                          </div>
                          <div className="flex bg-zinc-100 rounded-full p-1 border border-zinc-200/50">
                            <button
                              type="button"
                              onClick={() => setQuizTab("quiz")}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                quizTab === "quiz"
                                  ? "bg-zinc-800 text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              Questions
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizTab("settings")}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                quizTab === "settings"
                                  ? "bg-zinc-800 text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              Quiz Settings
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizTab("submissions")}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                quizTab === "submissions"
                                  ? "bg-zinc-800 text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              Submissions & Stats
                            </button>
                          </div>
                        </div>

                        {quizTab !== "submissions" ? (
                          <form onSubmit={handleSaveQuiz} className="flex flex-col gap-6 w-full text-left">
                            {quizTab === "settings" && (
                              <div className="py-6 border-b border-[#E5E1D8]/30 flex flex-col gap-4 text-left">
                                <h4 className="text-[12px] font-bold text-zinc-800 uppercase tracking-wider border-b border-[#E5E1D8]/50 pb-2">
                                  Quiz Policy & Settings
                                </h4>
                                
                                <div className="flex flex-col gap-5">
                                  <label className="flex items-start gap-3.5 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={quiz.allowViewGrade}
                                      onChange={(e) => updateQuizSetting("allowViewGrade", e.target.checked)}
                                      className="mt-1 accent-[#facc15] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex flex-col text-left">
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
                                      className="mt-1 accent-[#facc15] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex flex-col text-left">
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
                                      className="mt-1 accent-[#facc15] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex flex-col text-left">
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
                            )}

                            {quizTab === "quiz" && (
                              <>
                                {/* AI Quiz Generator Settings */}
                                <div className="py-6 border-b border-[#E5E1D8]/30 flex flex-col gap-4 text-left">
                                  <h4 className="text-[12px] font-bold text-[#d97706] uppercase tracking-wider border-b border-[#E5E1D8]/50 pb-2">
                                    AI Quiz Generator Settings
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-1.5 w-full">
                                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Number of Questions (Max 10)</label>
                                      <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={aiQuestionCount}
                                        onChange={(e) => {
                                          let val = parseInt(e.target.value) || 1;
                                          if (val > 10) val = 10;
                                          if (val < 1) val = 1;
                                          setAiQuestionCount(val);
                                        }}
                                        className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13.5px] focus:outline-none transition-all duration-200"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-1.5 w-full">
                                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Difficulty Level</label>
                                      <select
                                        value={aiDifficulty}
                                        onChange={(e) => setAiDifficulty(e.target.value)}
                                        className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 text-zinc-800 font-semibold text-[13px] focus:outline-none rounded-none cursor-pointer"
                                      >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                      </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5 w-full">
                                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Language</label>
                                      <select
                                        value={aiLanguage}
                                        onChange={(e) => setAiLanguage(e.target.value)}
                                        className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 text-zinc-800 font-semibold text-[13px] focus:outline-none rounded-none cursor-pointer"
                                      >
                                        <option value="English">English</option>
                                        <option value="Indonesian">Indonesian</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Japanese">Japanese</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="flex justify-start mt-4">
                                    <button
                                      type="button"
                                      onClick={handleAutoCreateQuiz}
                                      disabled={isGeneratingQuiz}
                                      className="px-6 py-3 bg-[#d97706] hover:bg-[#b45309] text-white font-bold rounded-xl text-[12px] shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 select-none border-none"
                                    >
                                      {isGeneratingQuiz ? (
                                        <>
                                          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                          <span>Generating Quiz via AI...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-4 h-4 text-white" />
                                          <span>Auto-generate Quiz with AI</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-6">
                                  <div className="flex items-center justify-between border-b border-[#E5E1D8]/50 pb-2 pl-1">
                                    <h4 className="text-[13px] font-bold text-zinc-800 uppercase tracking-wider">
                                      Questions List ({quiz.questions?.length || 0})
                                    </h4>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {quiz.questions?.map((q: any, qIdx: number) => (
                                  <div
                                    key={qIdx}
                                    className="p-6 border border-[#E5E1D8]/30 flex flex-col gap-4 relative text-left rounded-2xl animate-in fade-in duration-200"
                                    style={{
                                      backgroundImage: qIdx % 2 === 1
                                        ? "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(239, 236, 230, 0.45) 12px, rgba(239, 236, 230, 0.45) 24px)"
                                        : undefined
                                    }}
                                  >
                                    <div className="flex items-center justify-between pb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-bold text-[#d97706]">
                                          Question #{qIdx + 1}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            disabled={qIdx === 0}
                                            onClick={() => moveQuestion(qIdx, "up")}
                                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-650 disabled:opacity-30 disabled:pointer-events-none transition-colors border-none cursor-pointer"
                                            title="Move Up"
                                          >
                                            <ChevronUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={qIdx === quiz.questions.length - 1}
                                            onClick={() => moveQuestion(qIdx, "down")}
                                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-650 disabled:opacity-30 disabled:pointer-events-none transition-colors border-none cursor-pointer"
                                            title="Move Down"
                                          >
                                            <ChevronDown className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                      {quiz.questions.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeQuestion(qIdx)}
                                          className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>
 
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                      <div className="md:col-span-9 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Question Text</label>
                                        <textarea
                                          value={q.questionText}
                                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                          placeholder="Type your question here..."
                                          rows={2}
                                          required
                                          className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13.5px] focus:outline-none transition-all duration-200"
                                        />
                                      </div>
                                      <div className="md:col-span-3 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Points</label>
                                        <input
                                          type="number"
                                          min={1}
                                          value={q.points || 1}
                                          onChange={(e) => updateQuestionPoints(qIdx, parseInt(e.target.value) || 1)}
                                          className="w-full px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13.5px] focus:outline-none transition-all duration-200"
                                        />
                                      </div>
                                    </div>
 
                                    <div className="flex flex-col gap-2.5 mt-2">
                                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Options (Pick the correct option)</label>
                                      <div className="flex flex-col gap-2">
                                        {q.options.map((opt: string, optIdx: number) => (
                                          <div key={optIdx} className="flex items-center gap-3 w-full">
                                            <button
                                              type="button"
                                              onClick={() => setQuestionCorrectOption(qIdx, optIdx)}
                                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                                q.correctOption === optIdx
                                                  ? "bg-[#facc15] border-[#f97316] text-white"
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
                                              className="flex-1 px-1 py-2 bg-transparent border-b border-[#E5E1D8] focus:border-zinc-850 rounded-none text-zinc-800 font-semibold text-[13.5px] focus:outline-none transition-all duration-200"
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
                                className="flex items-center justify-center gap-1.5 py-3.5 text-[11.5px] font-bold text-zinc-650 hover:text-zinc-850 hover:bg-zinc-50 border border-dashed border-[#E5E1D8] transition-all w-full select-none cursor-pointer rounded-xl"
                              >
                                <Plus className="w-4 h-4 text-zinc-400" />
                                <span>Add Question</span>
                              </button>
                            </div>
                          </>
                        )} 
                            <div className="flex justify-end mt-4">
                              <button
                                type="submit"
                                disabled={quizSaving}
                                className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                          <div className="py-6 flex flex-col gap-4 text-left animate-in fade-in duration-200">
                            {attemptsLoading ? (
                              <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-6 h-6 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
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
                                    <tr className="bg-zinc-50 border-b border-[#E5E1D8]/70 text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
                                      <th className="px-4 py-3">Rank</th>
                                      <th className="px-4 py-3">Participant</th>
                                      <th className="px-4 py-3">Type</th>
                                      <th className="px-4 py-3">Score</th>
                                      <th className="px-4 py-3">Percentage</th>
                                      <th className="px-4 py-3">Submitted At</th>
                                      <th className="px-4 py-3 text-right">Actions</th>
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
                                              <div className="w-5 h-5 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold text-[9px] border border-zinc-200">
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
                                          <td className="px-4 py-3 font-bold text-[#d97706]">{pct}%</td>
                                          <td className="px-4 py-3 text-zinc-400 font-medium">{formatDate(att.submittedAt)}</td>
                                          <td className="px-4 py-3 text-right">
                                            <Link
                                              href={`/dashboard/subject/${id}/lesson/${lessonId}/review/${att.id}`}
                                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full text-[10px] transition-colors cursor-pointer inline-block text-center"
                                            >
                                              Review
                                            </Link>
                                          </td>
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
                              <Trophy className="w-10 h-10 text-[#d97706] mb-3" />
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
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] text-center focus:outline-none"
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
                                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all cursor-pointer"
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
                                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-semibold text-white shadow-sm transition-all"
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
                                <span className="px-3 py-1 bg-[#facc15]/10 text-[#d97706] text-[10.5px] font-extrabold rounded-full">
                                  {quiz.questions?.length || 0} Questions
                                </span>
                              </div>

                              <div className="flex flex-col gap-2">
                                {quiz.questions?.map((q: any, qIdx: number) => (
                                  <div
                                    key={q.id}
                                    className="p-6 border border-[#E5E1D8]/30 flex flex-col gap-4 text-left rounded-2xl"
                                    style={{
                                      backgroundImage: qIdx % 2 === 1
                                        ? "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(239, 236, 230, 0.45) 12px, rgba(239, 236, 230, 0.45) 24px)"
                                        : undefined
                                    }}
                                  >
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                                        Question {String(qIdx + 1).padStart(2, "0")} · {q.points || 1} pts
                                      </span>
                                    </div>
                                    <h4 className="text-[16px] font-bold text-zinc-900 leading-snug">
                                      {q.questionText}
                                    </h4>
                                    
                                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest mt-1 block">
                                      Select only one
                                    </span>

                                    <div className="flex flex-col gap-2 mt-1">
                                      {q.options.map((opt: string, optIdx: number) => {
                                        const isSelected = userAnswers[q.id] === optIdx;
                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            onClick={() => {
                                              setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                              setAnswerLogs((prev) => [...prev, { questionId: q.id, optionIndex: optIdx, createdAt: new Date().toISOString() }]);
                                            }}
                                            className="w-full py-2 flex items-center gap-3 text-left text-[12.5px] font-semibold transition-all cursor-pointer group text-zinc-700 hover:text-zinc-950"
                                          >
                                            <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                                              isSelected
                                                ? "border-[#f97316] bg-[#facc15]"
                                                : "border-zinc-300 group-hover:border-zinc-400 bg-white"
                                            }`}>
                                              {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50 duration-150" />
                                              )}
                                            </div>
                                            <span className={isSelected ? "font-bold text-zinc-950" : "text-zinc-650"}>
                                              {opt}
                                            </span>
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
                                  <CheckCircle2 className="w-4.5 h-4.5 text-[#d97706]" />
                                  <span>Submit Quiz Attempt</span>
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
                            <div className="bg-white border border-[#E5E1D8]/60 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center">
                              <Trophy className="w-12 h-12 text-[#d97706] mb-3 animate-bounce" />
                              <h3 className="text-[17px] text-zinc-850 font-black">Quiz Completed!</h3>
                              
                              {quiz.allowViewGrade ? (
                                <div className="mt-4 flex flex-col items-center">
                                  <div className="w-24 h-24 rounded-full border-4 border-[#f97316] flex flex-col items-center justify-center bg-[#facc15]/5">
                                    <span className="text-2xl font-black text-zinc-900">{myAttempt.score}</span>
                                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest border-t border-zinc-200 pt-0.5 mt-0.5">/ {myAttempt.totalPoints} pts</span>
                                  </div>
                                  <span className="text-[13px] font-bold text-zinc-800 mt-4">
                                    Percentage: <span className="text-[#d97706]">{Math.round((myAttempt.score / myAttempt.totalPoints) * 100)}%</span>
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
                                <div className="flex flex-col gap-2">
                                  {quiz.questions.map((q: any, qIdx: number) => {
                                    const submittedAnsIdx = myAttempt.answers?.[q.id];
                                    const correctAnsIdx = q.correctOption !== undefined ? q.correctOption : myAttempt.correctAnswers?.[q.id];
                                    const isCorrect = submittedAnsIdx !== undefined && Number(submittedAnsIdx) === correctAnsIdx;

                                    return (
                                      <div
                                        key={q.id}
                                        className="p-6 border border-[#E5E1D8]/30 flex flex-col gap-4 text-left rounded-2xl"
                                        style={{
                                          backgroundImage: qIdx % 2 === 1
                                            ? "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(239, 236, 230, 0.45) 12px, rgba(239, 236, 230, 0.45) 24px)"
                                            : undefined
                                        }}
                                      >
                                        <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                          <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
                                            Question {qIdx + 1}
                                          </span>
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                          }`}>
                                            {isCorrect ? "Correct" : "Incorrect"}
                                          </span>
                                        </div>

                                        <h4 className="text-[15px] font-bold text-zinc-900 leading-snug">
                                          {q.questionText}
                                        </h4>

                                        <div className="flex flex-col gap-2 mt-1">
                                          {q.options.map((opt: string, optIdx: number) => {
                                            const isMyChoice = submittedAnsIdx !== undefined && Number(submittedAnsIdx) === optIdx;
                                            const isRightChoice = correctAnsIdx !== undefined && Number(correctAnsIdx) === optIdx;

                                            return (
                                              <div
                                                key={optIdx}
                                                className={`w-full py-2 text-[12.5px] flex items-center justify-between font-semibold ${
                                                  isRightChoice
                                                    ? "text-emerald-600 font-bold"
                                                    : isMyChoice && !isCorrect
                                                    ? "text-rose-600 font-bold"
                                                    : "text-zinc-655"
                                                }`}
                                              >
                                                <div className="flex items-center gap-3">
                                                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                                                    isRightChoice
                                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                                      : isMyChoice && !isCorrect
                                                      ? "border-rose-500 bg-rose-500 text-white"
                                                      : "border-zinc-300 bg-white"
                                                  }`}>
                                                    {isRightChoice ? (
                                                      <Check className="w-3.5 h-3.5 text-white" />
                                                    ) : isMyChoice && !isCorrect ? (
                                                      <X className="w-3.5 h-3.5 text-white" />
                                                    ) : null}
                                                  </div>
                                                  <span>{opt}</span>
                                                </div>
                                                {isRightChoice ? (
                                                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">
                                                    Correct Answer
                                                  </span>
                                                ) : isMyChoice ? (
                                                  <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wide">
                                                    Your Answer
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
                                  <Trophy className="w-4 h-4 text-[#d97706]" />
                                  Quiz Leaderboard
                                </h4>

                                {attemptsLoading ? (
                                  <div className="flex flex-col items-center justify-center py-6">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
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
                                            <tr key={att.id} className={`${isMe ? "bg-[#facc15]/5 font-bold border-l-2 border-l-[#facc15]" : ""}`}>
                                              <td className="px-3 py-2.5 text-zinc-700">#{idx + 1}</td>
                                              <td className="px-3 py-2.5 text-zinc-800 flex items-center gap-2">
                                                {!isGuest && att.user?.avatar ? (
                                                  <img
                                                    src={att.user.avatar}
                                                    alt={name}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-4 h-4 rounded-full bg-[#facc15]/10 text-[#d97706] flex items-center justify-center font-bold text-[8.5px]">
                                                    {name.slice(0, 2).toUpperCase()}
                                                  </div>
                                                )}
                                                <span>{name} {isMe && "(You)"}</span>
                                                {isGuest && (
                                                  <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1.5 py-0.2 rounded">Guest</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2.5 text-zinc-700">{att.score} / {att.totalPoints}</td>
                                              <td className="px-3 py-2.5 text-[#d97706]">{pct}%</td>
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

          {showSubjectDetails && (
            <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-0 lg:order-1">
              <div className="flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <span
                    className="inline-block text-[9px] font-bold px-3 py-1 rounded-full w-fit bg-[#facc15]/10 text-[#d97706] border border-[#f97316]/20"
                  >
                    {selectedLesson.type || "learning"}
                  </span>
                  {selectedLesson.type !== "learning" && (
                    <>
                      <h2 className="text-2xl font-black text-[#121212] tracking-tight mt-2 leading-tight">
                        {selectedLesson.title}
                      </h2>
                      {selectedModule && (
                        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mt-0.5">
                          Module: {selectedModule.title}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[13px] mt-1.5">
                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                        <span>Lecturers: {selectedSubject.lecturers.map((l) => l.name).join(", ")}</span>
                      </div>
                    </>
                  )}
                </div>

                {selectedLesson.type !== "learning" && selectedLesson.desc && (
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-[#FAF7F2]/50 p-4 border border-[#E5E1D8]/30 rounded-2xl">
                    {selectedLesson.desc}
                  </p>
                )}
                {selectedLesson.type !== "quizzes" && (
                  <>
                    <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E1D8]/45 text-left">
                      <span className="text-[11px] font-black text-zinc-800 uppercase tracking-wider mb-1">
                        Lesson Details
                      </span>
                      <div className="flex flex-col gap-3.5">
                        <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                          <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Subject</span>
                          <span className="text-zinc-850 text-[12.5px] font-bold">{selectedSubject.name}</span>
                        </div>
                        {selectedModule && (
                          <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                            <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Module</span>
                            <span className="text-zinc-850 text-[12.5px] font-bold">{selectedModule.title}</span>
                          </div>
                        )}
                        <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                          <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Lesson Type</span>
                          <span className="text-[12.5px] font-extrabold uppercase text-[#d97706]">
                            {selectedLesson.type === "learning"
                              ? "Learning Material"
                              : selectedLesson.type === "assignment"
                              ? "Assignment"
                              : selectedLesson.type === "quizzes"
                              ? "Quiz"
                              : "Presence Session"}
                          </span>
                        </div>
                        <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                          <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Lecturers</span>
                          <span className="text-zinc-855 text-[12.5px] font-bold" title={selectedSubject.lecturers.map((l) => l.name).join(", ")}>
                            {selectedSubject.lecturers.map((l) => l.name).join(", ")}
                          </span>
                        </div>
                        {selectedLesson.type !== "learning" && (
                          <>
                            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Open Date</span>
                              <span className="text-zinc-855 text-[12.5px] font-bold">{formatDate(selectedLesson.openDate)}</span>
                            </div>
                            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Due Date</span>
                              <span className="text-zinc-855 text-[12.5px] font-bold">{formatDate(selectedLesson.closeDate)}</span>
                            </div>
                            <div className="flex flex-col items-start gap-0.5 bg-transparent p-0 border-none">
                              <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Deadline Policy</span>
                              <span className="text-zinc-855 text-[12.5px] font-bold flex items-center gap-1.5 mt-0.5">
                                {selectedLesson.closeType === "restrict" ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-[#d97706]" /> Strict Deadline
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Open Submission
                                  </>
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-[#EBE8E0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                      <h3 className="text-[13px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-100">
                        <Lightbulb className="w-4 h-4 text-[#d97706]" />
                        Resource Tips
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                        Use your desktop or mobile device to upload files directly. Submissions are tracked
                        and recorded automatically.
                      </p>
                    </div>

                    {selectedSubject.institutionId && (
                      <StorageTracker institutionId={selectedSubject.institutionId} />
                    )}
                  </>
                )}
              </div>
            </div>
             )}

          {/* Assignment Submission Review Modal */}
          {selectedAssignmentForReview && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white border border-[#E5E1D8]/80 rounded-3xl p-6 shadow-2xl max-w-lg w-full flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex flex-col text-left">
                    <h3 className="text-[16px] text-zinc-900 font-black">
                      Assignment Submission Review
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-bold mt-1">
                      Student: <span className="text-zinc-700 font-extrabold">{selectedAssignmentForReview.user?.name || "Student"}</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedAssignmentForReview(null)}
                    className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col gap-5 text-left">
                  <div className="p-4 bg-zinc-50 border border-[#E5E1D8]/30 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px] text-zinc-400 font-bold">
                      <span>FILE DETAILS</span>
                      <span>{(selectedAssignmentForReview.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-zinc-800 break-all">
                      {selectedAssignmentForReview.fileName}
                    </h4>
                    <div className="text-[10px] text-zinc-400 font-semibold mt-1">
                      Submitted: {formatDate(selectedAssignmentForReview.submittedAt)}
                    </div>
                  </div>

                  {/* Interactive File Preview Mockup / grading */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10.5px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1">
                      Grading & Feedback
                    </label>
                    <div className="flex gap-3">
                      <div className="w-24 flex flex-col gap-1">
                        <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Score (0-100)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="--"
                          className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-bold text-[13px] text-center focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Reviewer Note</span>
                        <input
                          type="text"
                          placeholder="Excellent work! Neat formatting..."
                          className="w-full px-3 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Preview Placeholder */}
                  {selectedAssignmentForReview.fileName.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                    <div className="w-full h-32 rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                      <img
                        src={selectedAssignmentForReview.filePath}
                        alt="Submission Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full p-4 bg-amber-50/30 border border-amber-100 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#facc15]/10 flex items-center justify-center font-bold text-[#d97706] text-[11px] uppercase shrink-0">
                        {selectedAssignmentForReview.fileName.split(".").pop() || "DOC"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-zinc-700">Preview not available</span>
                        <span className="text-[10px] text-zinc-400 font-medium">Use 'Open File' to download or inspect in browser</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <a
                    href={selectedAssignmentForReview.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl text-[12px] transition-colors"
                  >
                    Open File
                  </a>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAssignmentForReview(null)}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-[12px] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        showToast("Grade and feedback saved successfully!", "success");
                        setSelectedAssignmentForReview(null);
                      }}
                      className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-[12px] shadow-sm transition-all cursor-pointer"
                    >
                      Save Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
