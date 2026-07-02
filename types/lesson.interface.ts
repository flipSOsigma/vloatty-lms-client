// ─── Quiz Types ──────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctOption: number;
  points: number;
}

export interface QuizSettings {
  id?: string;
  allowViewGrade: boolean;
  showLeaderboard: boolean;
  allowGuest: boolean;
  questions: QuizQuestion[];
  userAttempt?: QuizAttempt;
}

export interface QuizAttempt {
  id?: string;
  score: number;
  totalPoints: number;
  submittedAt: string;
  answers?: Record<string, number>;
  correctAnswers?: Record<string, number>;
  userId?: string;
  guestName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// ─── Assignment Types ─────────────────────────────────────────────────────────

export interface AssignmentGlobalSettings {
  allowedTypes: string[];
  maxSizeMb: number;
}

export interface AssignmentUserPermission {
  userId: string;
  canSubmit: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface AssignmentSettings {
  globalSettings: AssignmentGlobalSettings;
  userPermissions: AssignmentUserPermission[];
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  submittedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// ─── Presence Types ───────────────────────────────────────────────────────────

export interface PresenceRecord {
  submitted: boolean;
  submittedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MyPresenceRecord {
  id: string;
  createdAt: string;
}
