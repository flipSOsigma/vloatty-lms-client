"use client";

import React from "react";
import { Users, Plus, Trash2 } from "lucide-react";

interface FormLecturer {
  email: string;
  name: string;
}

interface LecturersSectionProps {
  subjectLecturers: FormLecturer[];
  setSubjectLecturers: React.Dispatch<React.SetStateAction<FormLecturer[]>>;
  subjectColor: string;
  setIsLecturerModalOpen: (val: boolean) => void;
  setLecturerSearchQuery: (val: string) => void;
  handleLecturerEmailChange: (index: number, emailValue: string) => void;
  handleLecturerNameChange: (index: number, nameValue: string) => void;
  hexToRgba: (hex: string, opacity: number) => string;
  errorFields: { [key: string]: string };
}

export default function LecturersSection({
  subjectLecturers,
  setSubjectLecturers,
  subjectColor,
  setIsLecturerModalOpen,
  setLecturerSearchQuery,
  handleLecturerEmailChange,
  handleLecturerNameChange,
  hexToRgba,
  errorFields,
}: LecturersSectionProps) {
  return (
    <div id="lecturers" className="flex flex-col gap-6 w-full mb-16 lg:pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
            <Users className="w-4.5 h-4.5" style={{ color: subjectColor }} />
            Lecturers *
          </h3>
          <button
            type="button"
            onClick={() => {
              setLecturerSearchQuery("");
              setIsLecturerModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lecturer
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Assign teaching staff, customize faculty emails, and set display names.
        </p>
      </div>

      {errorFields.subjectLecturers && (
        <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectLecturers}</span>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16">Avatar</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Email Address</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Display Name</th>
              <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/55">
            {subjectLecturers.map((lecturer, idx) => {
              const initials = lecturer.name
                ? lecturer.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
                : "?";

              return (
                <tr key={idx} className="hover:bg-zinc-50/10 transition-colors">
                  <td className="py-3 pr-2">
                    <div
                      className="flex items-center justify-center w-8.5 h-8.5 rounded-full text-[10.5px] font-black border"
                      style={{
                        backgroundColor: hexToRgba(subjectColor, 0.08),
                        color: subjectColor,
                        borderColor: hexToRgba(subjectColor, 0.12)
                      }}
                    >
                      {initials}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="email"
                      placeholder="e.g. olivia@vloatty.edu"
                      value={lecturer.email}
                      onChange={(e) => handleLecturerEmailChange(idx, e.target.value)}
                      className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                      onFocus={(e) => {
                        e.target.style.borderColor = subjectColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "";
                      }}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Resolved name or custom"
                      value={lecturer.name}
                      onChange={(e) => handleLecturerNameChange(idx, e.target.value)}
                      className="w-full px-1 py-2 bg-transparent border-b border-zinc-200 focus:outline-none text-[13px] font-medium placeholder-zinc-400/50 transition-colors duration-200"
                      onFocus={(e) => {
                        e.target.style.borderColor = subjectColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "";
                      }}
                    />
                  </td>
                  <td className="py-3 text-right">
                    {subjectLecturers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSubjectLecturers((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
