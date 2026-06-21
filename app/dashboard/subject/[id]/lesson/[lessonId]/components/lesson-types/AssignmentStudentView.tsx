"use client";

import React from "react";
import { Lesson } from "@/types/subject";
import { AssignmentSubmission } from "@/types/lesson";
import { formatDate } from "@/lib/formatters";
import { Lock, AlertTriangle, FileCheck, UploadCloud, X } from "lucide-react";

interface AssignmentStudentViewProps {
  lesson: Lesson;
  isLocked: boolean;
  canSubmit: boolean;
  allowedTypes: string[];
  maxSizeMb: number;
  uploadingProgress: number | null;
  mySubmission: AssignmentSubmission | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSubmission: () => void;
}

export default function AssignmentStudentView({
  lesson,
  isLocked,
  canSubmit,
  allowedTypes,
  maxSizeMb,
  uploadingProgress,
  mySubmission,
  onFileChange,
  onDeleteSubmission,
}: AssignmentStudentViewProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
      <h3 className="text-[15px] font-extrabold text-[#121212] tracking-tight mb-2">
        Submit Homework
      </h3>

      {!canSubmit ? (
        <div className="border border-red-200 bg-red-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Lock className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[14px] text-red-600 font-bold">Submission Blocked</span>
          <span className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1">
            You do not have permission to submit this assignment. Please contact your instructor.
          </span>
        </div>
      ) : isLocked ? (
        <div className="border border-red-200 bg-red-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[14px] text-red-600 font-bold">Submission Closed</span>
          <span className="text-[12px] text-zinc-500 font-medium max-w-sm mt-1">
            This assignment was locked on {formatDate(lesson.closeDate)} and is
            no longer accepting submissions.
          </span>
        </div>
      ) : uploadingProgress !== null ? (
        <div className="border border-[#E5E1D8] bg-white rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center text-[12px] font-bold text-zinc-500">
            <span>Uploading document...</span>
            <span>{uploadingProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-100">
            <div
              className="h-full bg-[#facc15] rounded-full transition-all duration-150"
              style={{ width: `${uploadingProgress}%` }}
            />
          </div>
        </div>
      ) : mySubmission ? (
        <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <FileCheck className="w-7 h-7 text-emerald-600 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-zinc-800 truncate text-left">
                {mySubmission.fileName}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold text-left">
                {(mySubmission.fileSize / 1024).toFixed(1)} KB • Submitted successfully ({formatDate(mySubmission.submittedAt)})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={mySubmission.filePath}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[11px] shadow-sm transition-colors"
            >
              Open
            </a>
            <button
              type="button"
              onClick={onDeleteSubmission}
              className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
          <input
            type="file"
            className="hidden"
            onChange={onFileChange}
          />
          <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-bold text-zinc-800">
              Click to upload your assignment
            </span>
            <span className="text-[10px] text-zinc-400 mt-1">
              Allowed formats: {allowedTypes.length > 0 ? allowedTypes.join(", ").toUpperCase() : "ANY"} (up to {maxSizeMb}MB)
            </span>
          </div>
        </label>
      )}
    </div>
  );
}
