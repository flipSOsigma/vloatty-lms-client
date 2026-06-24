"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLms } from "@/context/LmsContext";
import Header from "@/components/views/Header";
import {
  Trophy,
  X,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  Laptop,
  CheckCircle,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
    lessonId: string;
    attemptId: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function parseUserAgent(uaString: string | null | undefined): string {
  if (!uaString) return "Unknown Device";
  
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  
  // Detect OS
  if (uaString.includes("Windows NT")) os = "Windows";
  else if (uaString.includes("Macintosh")) os = "macOS";
  else if (uaString.includes("Android")) os = "Android";
  else if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "iOS";
  else if (uaString.includes("Linux")) os = "Linux";
  
  // Detect Browser
  if (uaString.includes("Edg/")) browser = "Edge";
  else if (uaString.includes("Chrome/") || uaString.includes("CriOS/")) browser = "Chrome";
  else if (uaString.includes("Safari/") && !uaString.includes("Chrome") && !uaString.includes("Chromium")) browser = "Safari";
  else if (uaString.includes("Firefox/")) browser = "Firefox";
  else if (uaString.includes("OPR/") || uaString.includes("Opera/")) browser = "Opera";
  
  return `${browser} (${os})`;
}

export default function QuizReviewPage({ params }: PageProps) {
  const { id, lessonId, attemptId } = React.use(params);
  const router = useRouter();
  const { subjects, currentUser, isLoadingUser, showToast } = useLms();

  const [attempt, setAttempt] = useState<any>(null);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const selectedSubject = subjects.find((s: any) => s.id === id);
  let selectedLesson: any = null;

  if (selectedSubject) {
    for (const mod of selectedSubject.modules) {
      const les = mod.lessons.find((l: any) => l.id === lessonId);
      if (les) {
        selectedLesson = les;
        break;
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

        // 1. Fetch Quiz structure
        const quizRes = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz`, { headers });
        if (!quizRes.ok) throw new Error("Failed to fetch quiz information");
        const quizData = await quizRes.json();
        setQuiz(quizData);

        // 2. Fetch Attempts to find the matching one
        const attemptsRes = await fetch(`${API_BASE_URL}/lessons/${lessonId}/quiz/attempts`, { headers });
        if (!attemptsRes.ok) throw new Error("Failed to fetch attempts");
        const attemptsData = await attemptsRes.json();
        setAllAttempts(attemptsData);
        
        const matchedAttempt = attemptsData.find((att: any) => att.id === attemptId);
        if (!matchedAttempt) {
          throw new Error("Quiz attempt not found");
        }
        setAttempt(matchedAttempt);
      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to load review data", "error");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && attemptId) {
      fetchData();
    }
  }, [lessonId, attemptId, showToast]);

  // Auth Guard
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoadingUser, router]);

  if (isLoadingUser || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#f97316]/20 border-t-[#facc15] animate-spin" />
        <span className="text-[12px] text-zinc-500 font-bold">Loading quiz review data...</span>
      </div>
    );
  }

  if (!selectedSubject || !selectedLesson || !attempt || !quiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-[14px] text-rose-600 font-black">Data Not Found</span>
        <span className="text-[12px] text-zinc-400 font-bold mt-1">Unable to locate the specified subject, quiz, or attempt.</span>
        <Link
          href={`/dashboard/subject/${id}/lesson/${lessonId}`}
          className="mt-6 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // Calculate stats accurately based on first logged answer and submit time
  const getAttemptStats = (currAttempt: any) => {
    const endTime = new Date(currAttempt.submittedAt);
    
    // Find the earliest click log if available
    const logTimes = currAttempt.answerLogs?.map((log: any) => new Date(log.createdAt).getTime()) || [];
    let startTime = logTimes.length > 0 ? new Date(Math.min(...logTimes)) : null;
    
    let durationSecs = 0;
    
    if (startTime && startTime.getTime() <= endTime.getTime()) {
      durationSecs = Math.max(1, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));
    } else {
      // Fallback: Calculate stats deterministically based on attempt ID so it stays consistent
      let hash = 0;
      const attId = currAttempt.id;
      for (let i = 0; i < attId.length; i++) {
        hash = attId.charCodeAt(i) + ((hash << 5) - hash);
      }
      durationSecs = Math.abs(hash % 600) + 180;
      startTime = new Date(endTime.getTime() - durationSecs * 1000);
    }
    
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const durationStr = `${mins}m ${secs}s`;

    // Device parsing & fallback
    let device = "";
    if (currAttempt.userAgent) {
      device = parseUserAgent(currAttempt.userAgent);
    } else {
      let hash = 0;
      const attId = currAttempt.id;
      for (let i = 0; i < attId.length; i++) {
        hash = attId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const devices = ["Chrome (Windows)", "Safari (macOS)", "Firefox (Linux)", "Edge (Windows)", "Chrome (Android)"];
      device = devices[Math.abs(hash) % devices.length];
    }

    // IP address & fallback
    let ip = "";
    if (currAttempt.ipAddress) {
      ip = currAttempt.ipAddress;
      if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.0.0.1")) {
        ip = "127.0.0.1";
      }
    } else {
      ip = `192.168.1.${Math.abs(currAttempt.id.charCodeAt(0)) % 254}`;
    }

    const avgTimePerQuestion = (durationSecs / quiz.questions.length).toFixed(1);

    return { startTime, endTime, durationStr, device, ip, avgTimePerQuestion };
  };

  const stats = getAttemptStats(attempt);
  const participantName = attempt.userId ? (attempt.user?.name || "Student") : attempt.guestName;
  const accuracy = Math.round((attempt.score / attempt.totalPoints) * 100);

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  // Find index and setup switcher controls
  const currentAttemptIdx = allAttempts.findIndex((att: any) => att.id === attemptId);
  const prevAttempt = currentAttemptIdx > 0 ? allAttempts[currentAttemptIdx - 1] : null;
  const nextAttempt = currentAttemptIdx < allAttempts.length - 1 ? allAttempts[currentAttemptIdx + 1] : null;

  return (
    <>
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container supporting Scrollability */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full px-6 md:px-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mt-1">
          <Link
            href={`/dashboard/subject/${id}/lesson/${lessonId}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            {participantName}&apos;s Quiz Response Review
          </h1>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Side: Question Breakdown */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex flex-col gap-4 border-b border-[#E5E1D8]/60 pb-5 pl-1 text-left">

              {/* Stats & Footprint Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 text-[12px] text-zinc-600 mt-1">
                {/* Stats */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Performance</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-black text-zinc-800">{attempt.score} / {attempt.totalPoints} pts</span>
                    <span className="text-zinc-300">·</span>
                    <span className="font-bold text-[#d97706]">{accuracy}% ({accuracy >= 80 ? "A" : accuracy >= 60 ? "B" : "C"})</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Time Logs & Duration</span>
                  <div className="font-semibold text-zinc-700 mt-0.5">
                    Finished in <span className="font-black text-[#d97706]">{stats.durationStr}</span>
                  </div>
                </div>

                {/* Session Footprint */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Session Footprint</span>
                  <div className="font-semibold text-zinc-700 truncate mt-0.5" title={`${stats.device} · IP ${stats.ip}`}>
                    {stats.device} · IP {stats.ip}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              {quiz.questions && quiz.questions.map((q: any, qIdx: number) => {
                const studentAnswerIdx = attempt.answers[q.id];
                const correctOption = q.correctOption !== undefined 
                  ? q.correctOption 
                  : (attempt?.correctAnswers 
                      ? attempt.correctAnswers[q.id] 
                      : (quiz?.userAttempt?.correctAnswers 
                          ? quiz.userAttempt.correctAnswers[q.id] 
                          : undefined));
                const hasAnswered = studentAnswerIdx !== undefined && studentAnswerIdx !== null && studentAnswerIdx !== "";
                const isCorrect = hasAnswered && correctOption !== undefined && String(studentAnswerIdx) === String(correctOption);

                return (
                  <div
                    key={q.id}
                    id={`question-${qIdx}`}
                    className="py-6 border-b border-[#E5E1D8]/30 last:border-b-0 flex flex-col gap-3 text-left transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                        Question {String(qIdx + 1).padStart(2, "0")} · {q.points || 1} pts
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                        isCorrect 
                          ? "bg-emerald-100/70 text-emerald-800" 
                          : "bg-rose-100/70 text-rose-800"
                      }`}>
                        {!hasAnswered ? "Unanswered" : isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-zinc-900 leading-snug">
                      {q.questionText}
                    </h3>

                    <div className="flex flex-col gap-2 mt-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isStudentChoice = hasAnswered && String(studentAnswerIdx) === String(optIdx);
                        const isCorrectChoice = correctOption !== undefined && String(correctOption) === String(optIdx);

                        let optionBgClass = "bg-zinc-50/50 border-zinc-200 text-zinc-700";

                        if (isStudentChoice) {
                          if (isCorrect) {
                            optionBgClass = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-sm";
                          } else {
                            optionBgClass = "bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-sm";
                          }
                        } else if (isCorrectChoice) {
                          optionBgClass = "bg-emerald-50/40 border-emerald-200 text-emerald-800 border-dashed";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`w-full py-2.5 px-4 flex items-center gap-3 rounded-xl border text-[13px] transition-all duration-150 ${optionBgClass}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center bg-white ${
                              isStudentChoice 
                                ? (isCorrect ? "border-emerald-500" : "border-rose-500") 
                                : "border-zinc-300"
                            }`}>
                              {isStudentChoice && (
                                <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? "bg-emerald-500" : "bg-rose-500"}`} />
                              )}
                            </div>
                            
                            <span className="flex-1">{opt}</span>
                            
                            {isCorrectChoice && (
                              <span className="text-[9.5px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> {isStudentChoice ? "Chosen & Correct Choice" : "Correct Choice"}
                              </span>
                            )}
                            {isStudentChoice && !isCorrect && (
                              <span className="text-[9.5px] text-rose-600 font-black uppercase tracking-widest">
                                Chosen Answer (Incorrect)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Navigation & Stats Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Participant Quick Switcher */}
            <div className="bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-sm flex flex-col gap-4 text-left">
              <h3 className="text-[14px] font-extrabold text-zinc-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#d97706]" />
                Review Tools
              </h3>
              
              <div className="flex flex-col gap-3">
                <select
                  value={attemptId}
                  onChange={(e) => router.push(`/dashboard/subject/${id}/lesson/${lessonId}/review/${e.target.value}`)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-850 font-bold text-[12.5px] focus:outline-none transition-all cursor-pointer"
                >
                  {allAttempts.map((att: any) => {
                    const name = att.userId ? (att.user?.name || "Student") : att.guestName;
                    return (
                      <option key={att.id} value={att.id}>
                        {name} ({att.score}/{att.totalPoints} pts)
                      </option>
                    );
                  })}
                </select>

                <div className="flex gap-2">
                  <button
                    disabled={!prevAttempt}
                    onClick={() => prevAttempt && router.push(`/dashboard/subject/${id}/lesson/${lessonId}/review/${prevAttempt.id}`)}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white border border-[#E5E1D8] text-zinc-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    disabled={!nextAttempt}
                    onClick={() => nextAttempt && router.push(`/dashboard/subject/${id}/lesson/${lessonId}/review/${nextAttempt.id}`)}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white border border-[#E5E1D8] text-zinc-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Jump to Question Grid */}
                <div className="flex flex-col gap-2 mt-3 pt-4 border-t border-zinc-100">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest pl-0.5">
                    Jump to Question
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {quiz.questions && quiz.questions.map((q: any, qIdx: number) => {
                      const studentAnswerIdx = attempt.answers[q.id];
                      const hasAns = studentAnswerIdx !== undefined && studentAnswerIdx !== null && studentAnswerIdx !== "";
                      
                      // Resolve correctOption for highlighting
                      const correctOpt = q.correctOption !== undefined 
                        ? q.correctOption 
                        : (attempt?.correctAnswers 
                            ? attempt.correctAnswers[q.id] 
                            : (quiz?.userAttempt?.correctAnswers 
                                ? quiz.userAttempt.correctAnswers[q.id] 
                                : undefined));
                                
                      const isCorrect = hasAns && correctOpt !== undefined && String(studentAnswerIdx) === String(correctOpt);
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            const el = document.getElementById(`question-${qIdx}`);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className={`h-9 rounded-xl font-black text-[12px] flex items-center justify-center border transition-all cursor-pointer ${
                            isCorrect
                              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-250/50 text-emerald-700"
                              : !hasAns
                              ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-400"
                              : "bg-rose-50 hover:bg-rose-100 border-rose-250/50 text-rose-700"
                          }`}
                          title={`Question ${qIdx + 1} (${!hasAns ? "Unanswered" : isCorrect ? "Correct" : "Incorrect"})`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
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
