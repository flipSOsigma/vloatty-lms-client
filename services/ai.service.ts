import { apiPost } from "@/lib/api";
import { QuizQuestion } from "@/types/lms.interface";

export interface GenerateLessonData {
  title: string;
  type: string;
  subjectName?: string;
  subjectDesc?: string;
}

export interface GenerateModuleData {
  title: string;
  subjectName?: string;
  subjectDesc?: string;
}

export interface GenerateQuizData {
  lessonTitle: string;
  lessonDesc?: string;
  subjectName?: string;
  subjectDesc?: string;
  questionCount: number;
  difficulty: string;
  language: string;
}

export interface GenerateTextResponse {
  description: string;
  tokensUsed: number;
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
}

export async function generateLessonDesc(data: GenerateLessonData) {
  return apiPost<GenerateTextResponse>("/ai/generate-lesson-desc", data);
}

export async function generateQuiz(data: GenerateQuizData) {
  return apiPost<GenerateQuizResponse>("/ai/generate-quiz", data);
}

export async function generateModuleDesc(data: GenerateModuleData) {
  return apiPost<GenerateTextResponse>("/ai/generate-module-desc", data);
}
