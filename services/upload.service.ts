import { apiFetch } from "@/lib/api";

export interface UploadResponse {
  url: string;
}

export async function uploadFile(formData: FormData, queryParams: string) {
  return apiFetch<UploadResponse>(`/upload?${queryParams}`, {
    method: "POST",
    body: formData,
  });
}
