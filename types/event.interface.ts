import { Subject } from "./subject";

export interface LmsEvent {
  id: string;
  title: string;
  subtitle?: string;
  timeStart: string;
  timeEnd: string;
  dayIndex: number;
  color: string;
  tag?: {
    text: string;
    type: "pink" | "blue";
  };
  link?: {
    text: string;
    url: string;
  };
  participants?: {
    initials: string[];
    count: number;
  };
  status?: "in-progress" | "joinable" | "normal";
  description?: string;
  image?: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  dateStr?: string;
}
