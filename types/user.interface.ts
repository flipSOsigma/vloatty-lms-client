export interface UserProfile {
  id: string;
  name: string;
  email: string;
  premiumStatus: "free" | "premium" | "professional" | string;
  institution: string;
  avatar: string;
  banner?: string | null;
  aiTokensBalance?: number;
  aiTokensLastReset?: string;
  createdAt?: string;
  updatedAt?: string;
}
