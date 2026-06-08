export interface Lesson {
  id: string;
  title: string;
  desc: string;
  homeworkFile?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  deletedAt: string | null; // ISO String or null
}

export interface Module {
  id: string;
  title: string;
  desc: string;
  date: string; // ISO String
  lessons: Lesson[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  deletedAt: string | null; // ISO String or null
}

export interface SubjectSchedule {
  day: string;
  startTime: string;
  endTime: string;
}


export interface Subject {
  id: string;
  name: string;
  lecturer: string;
  room?: string;
  color?: "cream" | "yellow" | "blue" | "image-text";
  description?: string;
  modules: Module[];
  schedules?: SubjectSchedule[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  deletedAt: string | null; // ISO String or null
}

