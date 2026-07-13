import { apiPost, apiFetch } from "@/lib/api";
import { UserProfile } from "@/types/lms.interface";

export interface AuthResponse {
  jwt: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
  user: UserProfile;
}

export async function login(body: unknown) {
  return apiPost<AuthResponse>("/auth/login", body);
}

export async function register(body: unknown) {
  return apiPost<AuthResponse>("/auth/register", body);
}

export async function logout() {
  return apiPost<{ message: string }>("/auth/logout", {});
}

export async function getMe() {
  return apiFetch<UserProfile>("/auth/me");
}
