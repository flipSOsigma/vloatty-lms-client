import { apiFetch, apiPut } from "../api";
import { UserProfile, SubjectFile } from "@/types/lms.interface";

export interface DashboardStatsResponse {
  totalSubjects: number;
  totalAssignments: number;
  pendingAssignments: number;
  completedQuizAttempts: number;
}

export interface AiTokensResponse {
  aiTokensBalance: number;
}

export async function getUserProfile(userId: string) {
  return apiFetch<UserProfile>(`/users/${userId}`);
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  return apiPut<UserProfile>(`/users/${userId}`, data);
}

export async function getDashboardStats(userId: string) {
  return apiFetch<DashboardStatsResponse>(`/users/${userId}/dashboard-stats`);
}

export async function getAiTokens(userId: string) {
  return apiFetch<AiTokensResponse>(`/users/${userId}/ai-tokens`);
}

export async function getUserFiles(userId: string) {
  return apiFetch<SubjectFile[]>(`/users/${userId}/files`);
}

export async function getAllUsers() {
  return apiFetch<UserProfile[]>("/users");
}
