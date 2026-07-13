import { apiFetch, apiPost } from "@/lib/api";
import { QuizSettings, QuizAttempt } from "@/types/lms.interface";

export async function getQuiz(lessonId: string) {
  return apiFetch<QuizSettings>(`/lessons/${lessonId}/quiz`);
}

export async function saveQuiz(lessonId: string, quizData: QuizSettings) {
  return apiPost<QuizSettings>(`/lessons/${lessonId}/quiz`, quizData);
}

export async function submitAttempt(lessonId: string, attemptData: { guestName?: string; answers: Record<string, number>; answerLogs?: { questionId: string; optionIndex: number; createdAt: string }[] }) {
  return apiPost<QuizAttempt>(`/lessons/${lessonId}/quiz/attempts`, attemptData);
}

export async function getAttempts(lessonId: string) {
  return apiFetch<QuizAttempt[]>(`/lessons/${lessonId}/quiz/attempts`);
}
