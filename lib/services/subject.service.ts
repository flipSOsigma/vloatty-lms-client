import { apiFetch, apiPost, apiDelete, apiPut } from "../api";
import { Subject, SubjectFile } from "@/types/lms.interface";

export async function joinSubject(id: string) {
  return apiPost<{ message: string; subject: Subject }>(`/subjects/${id}/join`, {});
}

export async function getSubjectDetails(id: string) {
  return apiFetch<Subject>(`/subjects/${id}`);
}

export async function kickParticipant(subjectId: string, userId: string) {
  return apiDelete<{ message: string }>(`/subjects/${subjectId}/participants/${userId}`);
}

export async function getSubjectFiles(subjectId: string, lessonId: string | null | undefined) {
  return apiFetch<SubjectFile[]>(`/subjects/${subjectId}/lessons/${lessonId}/files`);
}

export async function deleteSubjectFile(subjectId: string, fileId: string) {
  return apiDelete<{ message: string }>(`/subjects/${subjectId}/files/${fileId}`);
}

export async function uploadSubjectFile(subjectId: string, lessonId: string | null | undefined, formData: FormData) {
  return apiFetch<SubjectFile>(`/subjects/${subjectId}/lessons/${lessonId}/files`, {
    method: "POST",
    body: formData,
  });
}

export async function getSubjects() {
  return apiFetch<Subject[]>("/subjects");
}

export async function createSubject(data: Omit<Subject, "id" | "createdAt" | "updatedAt" | "deletedAt"> & { id?: string }) {
  return apiPost<Subject>("/subjects", data);
}

export async function deleteSubject(id: string) {
  return apiDelete<{ message: string }>(`/subjects/${id}`);
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  return apiPut<Subject>(`/subjects/${id}`, data);
}
