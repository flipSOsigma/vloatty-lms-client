import { apiFetch, apiPost, apiPut, apiDelete } from "@/lib/api";
import { Institution } from "@/types/lms.interface";

export interface InviteDetailsResponse {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string | null;
}

export interface JoinInstitutionResponse {
  message: string;
  institution: Institution;
}

export interface MemberRoleResponse {
  message: string;
}

export interface RemoveMemberResponse {
  message: string;
}

export interface StorageResponse {
  usedBytes: number;
  maxBytes: number;
}

export async function getInstitutions() {
  return apiFetch<Institution[]>("/institutions");
}

export async function getInstitution(id: string) {
  return apiFetch<Institution>(`/institutions/${id}`);
}

export async function createInstitution(data: { name: string; description?: string; subscriptionStatus?: string; thumbnail?: string | null }) {
  return apiPost<Institution>("/institutions", data);
}

export async function getInviteDetails(code: string) {
  return apiFetch<InviteDetailsResponse>(`/institutions/invite/${code}`);
}

export async function joinInstitution(data: { inviteCode: string }) {
  return apiPost<JoinInstitutionResponse>("/institutions/join", data);
}

export async function getInviteCode(id: string) {
  return apiPost<{ inviteCode: string }>(`/institutions/${id}/invite`, {});
}

export async function updateInstitution(id: string, data: Partial<Institution>) {
  return apiPut<Institution>(`/institutions/${id}`, data);
}

export async function addInstitutionMember(id: string, userId: string) {
  return apiPost<{ message: string }>(`/institutions/${id}/users/${userId}`, {});
}

export async function changeMemberRole(id: string, userId: string, role: string) {
  return apiPut<MemberRoleResponse>(`/institutions/${id}/users/${userId}/role`, { role });
}

export async function deleteInstitution(id: string) {
  return apiDelete<{ message: string }>(`/institutions/${id}`);
}

export async function removeInstitutionUser(id: string, userId: string) {
  return apiDelete<RemoveMemberResponse>(`/institutions/${id}/users/${userId}`);
}

export async function kickInstitutionMember(id: string, memberId: string) {
  return apiDelete<RemoveMemberResponse>(`/institutions/${id}/members/${memberId}`);
}

export async function changeInstitutionMemberRole(id: string, memberId: string, role: string) {
  return apiPut<MemberRoleResponse>(`/institutions/${id}/members/${memberId}/role`, { role });
}

export async function getInstitutionStorage(id: string) {
  return apiFetch<StorageResponse>(`/institutions/${id}/storage`);
}
