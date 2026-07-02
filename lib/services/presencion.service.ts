import { apiFetch, apiPost } from "../api";
import { PresenceRecord, MyPresenceRecord } from "@/types/lms.interface";

export interface PresenceDataResponse {
  isInstructor: boolean;
  presenceList?: PresenceRecord[];
  myPresence?: MyPresenceRecord | null;
}

export interface SubmitPresenceResponse {
  message: string;
  presence: MyPresenceRecord;
}

export async function getPresenceData(lessonId: string) {
  return apiFetch<PresenceDataResponse>(`/lessons/${lessonId}/presencion`);
}

export async function submitPresence(lessonId: string) {
  return apiPost<SubmitPresenceResponse>(`/lessons/${lessonId}/presencion`, {});
}
