import { apiFetch, apiPost, apiDelete } from "../api";
import { AssignmentSettings, AssignmentSubmission } from "@/types/lms.interface";

export async function getAssignmentSettings(lessonId: string) {
  return apiFetch<AssignmentSettings>(`/lessons/${lessonId}/assignment/settings`);
}

export async function saveAssignmentSettings(lessonId: string, settings: { allowedTypes: string[]; maxSizeMb: number; userPermissions: { userId: string; canSubmit: boolean }[] }) {
  return apiPost<AssignmentSettings>(`/lessons/${lessonId}/assignment/settings`, settings);
}

export async function getMySubmission(lessonId: string) {
  return apiFetch<AssignmentSubmission>(`/lessons/${lessonId}/assignment/my-submission`);
}

export async function getSubmissions(lessonId: string) {
  return apiFetch<AssignmentSubmission[]>(`/lessons/${lessonId}/assignment/submissions`);
}

export async function submitAssignment(lessonId: string, formData: FormData) {
  return apiFetch<AssignmentSubmission>(`/lessons/${lessonId}/assignment/submit`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteSubmission(lessonId: string, targetUserId?: string) {
  const query = targetUserId ? `?userId=${targetUserId}` : "";
  return apiDelete<{ message: string }>(`/lessons/${lessonId}/assignment/submit${query}`);
}
