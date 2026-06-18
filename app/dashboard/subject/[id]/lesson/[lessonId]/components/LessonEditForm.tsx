"use client";

import React from "react";
import { SubjectFile, Lesson } from "@/types/subject";
import { BookOpen, UploadCloud, Lock, Unlock, X } from "lucide-react";

interface LessonEditFormProps {
  lesson: Lesson;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editDesc: string;
  setEditDesc: (v: string) => void;
  editType: string;
  setEditType: (v: string) => void;
  editOpenDate: string;
  setEditOpenDate: (v: string) => void;
  editCloseDate: string;
  setEditCloseDate: (v: string) => void;
  editCloseType: string;
  setEditCloseType: (v: string) => void;
  attachments: SubjectFile[];
  attachingProgress: number | null;
  onAttachFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: (fileId: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function LessonEditForm({
  lesson,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editType,
  setEditType,
  editOpenDate,
  setEditOpenDate,
  editCloseDate,
  setEditCloseDate,
  editCloseType,
  setEditCloseType,
  attachments,
  attachingProgress,
  onAttachFile,
  onDeleteFile,
  onSave,
  onCancel,
}: LessonEditFormProps) {
  return (
    <form
      onSubmit={onSave}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
          Lesson Title
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          required
          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
          onFocus={(e) => {
            e.target.style.borderColor = "#facc15";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
          Lesson Type *
        </label>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setEditType("learning")}
            className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
              editType === "learning"
                ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Learning
          </button>
          <button
            type="button"
            onClick={() => setEditType("assignment")}
            className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
              editType === "assignment"
                ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Assignment
          </button>
          <button
            type="button"
            onClick={() => setEditType("quizzes")}
            className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
              editType === "quizzes"
                ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Quizzes
          </button>
          <button
            type="button"
            onClick={() => setEditType("presencion")}
            className={`px-3 py-3 rounded-2xl border text-[12.5px] transition-all cursor-pointer text-center font-bold ${
              editType === "presencion"
                ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950"
                : "border-[#E5E1D8] bg-transparent text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Presence
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          rows={6}
          className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium text-zinc-700 focus:outline-none transition-colors duration-200 resize-none"
          onFocus={(e) => {
            e.target.style.borderColor = "#facc15";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
          Lesson Materials / Attachments
        </label>
        {attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {attachments.map((file) => (
              <div key={file.id} className="border border-[#E5E1D8] bg-[#FAF7F2]/40 rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-zinc-800 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      {(file.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {attachingProgress !== null ? (
          <div className="border border-[#E5E1D8] bg-white rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-zinc-500">
              <span>Attaching file...</span>
              <span>{attachingProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-100">
              <div
                className="h-full bg-[#facc15] rounded-full transition-all duration-150"
                style={{ width: `${attachingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-[#E5E1D8] hover:border-zinc-400 bg-white/50 hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
            <input
              type="file"
              className="hidden"
              onChange={onAttachFile}
            />
            <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-zinc-700">
                Attach slide decks, PDF, or resources
              </span>
              <span className="text-[9px] text-zinc-400 mt-0.5">Formats up to 50MB</span>
            </div>
          </label>
        )}
      </div>

      {(editType === "assignment" || editType === "quizzes" || editType === "presencion") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Open Date
            </label>
            <input
              type="datetime-local"
              value={editOpenDate}
              onChange={(e) => setEditOpenDate(e.target.value)}
              required
              className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
              onFocus={(e) => {
                e.target.style.borderColor = "#facc15";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "";
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Close Date
            </label>
            <input
              type="datetime-local"
              value={editCloseDate}
              onChange={(e) => setEditCloseDate(e.target.value)}
              required
              className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-bold text-zinc-800 focus:outline-none transition-colors duration-200"
              onFocus={(e) => {
                e.target.style.borderColor = "#facc15";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "";
              }}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 pt-2">
            <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Submission Restriction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditCloseType("open")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  editCloseType === "open"
                    ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950 font-bold"
                    : "border-[#E5E1D8] bg-transparent text-zinc-500 font-semibold hover:border-zinc-300"
                }`}
              >
                <Unlock className="w-4.5 h-4.5" />
                <div className="flex flex-col items-center">
                  <span className="text-[11px]">Open Submission</span>
                  <span className="text-[8.5px] text-zinc-400 font-semibold mt-0.5 text-center leading-tight">Allows late uploads</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditCloseType("restrict")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  editCloseType === "restrict"
                    ? "border-[#f97316] bg-[#facc15]/5 text-zinc-950 font-bold"
                    : "border-[#E5E1D8] bg-transparent text-zinc-500 font-semibold hover:border-zinc-300"
                }`}
              >
                <Lock className="w-4.5 h-4.5" />
                <div className="flex flex-col items-center">
                  <span className="text-[11px]">Restricted</span>
                  <span className="text-[8.5px] text-zinc-400 font-semibold mt-0.5 text-center leading-tight">Locks after close date</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm cursor-pointer transition-colors"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-[#E5E1D8] hover:bg-zinc-100 text-zinc-700 font-bold rounded-full text-[12px] cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
