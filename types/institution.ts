import { Subject } from "./subject";

export interface InstitutionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  institutionRole?: string;
}

export interface Institution {
  id: string;
  name: string;
  description?: string;
  subscriptionStatus: string;
  thumbnail?: string | null;
  inviteCode?: string;
  createdAt?: string;
  updatedAt?: string;
  users?: InstitutionUser[];
  subjects?: Subject[];
}
