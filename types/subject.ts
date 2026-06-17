export interface SubjectFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  category: "Attachment" | "Submission";
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  subjectId: string;
  lessonId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  desc: string;
  type: "assignment" | "learning" | "quizzes" | "presencion";
  homeworkFile?: string;
  openDate: string;
  closeDate: string;
  closeType: "restrict" | "open";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  files?: SubjectFile[];
}

export interface Module {
  id: string;
  title: string;
  desc: string;
  date: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SubjectSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}


export interface SubjectLecturer {
  userId: string;
  name: string;
  email?: string;
}

export interface SubjectParticipant {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Subject {
  id: string;
  name: string;
  lecturers: SubjectLecturer[];
  room?: string;
  description?: string;
  modules: Module[];
  schedules?: SubjectSchedule[];
  createdBy: string;
  creatorName?: string;
  creatorEmail?: string;
  creatorAvatar?: string;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  participants?: SubjectParticipant[];
  isOpen?: boolean;
  category?: string;
  institutionId?: string | null;
  thumbnail?: string | null;
  files?: SubjectFile[];
}


