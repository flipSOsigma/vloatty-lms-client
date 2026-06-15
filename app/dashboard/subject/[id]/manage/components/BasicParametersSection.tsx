"use client";

import React from "react";
import { Settings, BookOpen, FileText, MapPin, Trash2, Plus } from "lucide-react";

interface BasicParametersSectionProps {
  subjectName: string;
  setSubjectName: (val: string) => void;
  subjectDesc: string;
  setSubjectDesc: (val: string) => void;
  subjectRoom: string;
  setSubjectRoom: (val: string) => void;
  subjectColor: string;
  setSubjectColor: (val: string) => void;
  subjectThumbnail: string;
  setSubjectThumbnail: (val: string) => void;
  isUploading: boolean;
  setCropFileName: (val: string) => void;
  setCropImageSrc: (val: string | null) => void;
  errorFields: { [key: string]: string };
}

export default function BasicParametersSection({
  subjectName,
  setSubjectName,
  subjectDesc,
  setSubjectDesc,
  subjectRoom,
  setSubjectRoom,
  subjectColor,
  setSubjectColor,
  subjectThumbnail,
  setSubjectThumbnail,
  isUploading,
  setCropFileName,
  setCropImageSrc,
  errorFields,
}: BasicParametersSectionProps) {
  return (
    <div id="basic-parameters" className="flex flex-col gap-8 w-full mb-16 pl-12 scroll-mt-24">
      <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
        <Settings className="w-4.5 h-4.5 text-[#f25c88]" />
        Basic Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Subject Name *</label>
            <div className="relative flex items-center w-full">
              <BookOpen className="absolute left-1 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className={`w-full pl-7 pr-1 py-2 bg-transparent border-b text-[14px] font-medium focus:outline-none transition-colors duration-200 ${
                  errorFields.subjectName ? "border-red-400" : "border-zinc-200"
                }`}
                onFocus={(e) => {
                  e.target.style.borderColor = subjectColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                }}
              />
            </div>
            {errorFields.subjectName && (
              <span className="text-[11px] text-red-500 font-bold">{errorFields.subjectName}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Course Description</label>
            <div className="relative flex items-start w-full">
              <FileText className="absolute left-1 top-2.5 w-4 h-4 text-zinc-400" />
              <textarea
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                rows={5}
                className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 resize-none"
                onFocus={(e) => {
                  e.target.style.borderColor = subjectColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Default Classroom Location</label>
            <div className="relative flex items-center w-full">
              <MapPin className="absolute left-1 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={subjectRoom}
                onChange={(e) => setSubjectRoom(e.target.value)}
                className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200"
                onFocus={(e) => {
                  e.target.style.borderColor = subjectColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Theme Color (Wheel Picker)</label>
            <div className="flex items-center gap-3 bg-white border border-zinc-200 p-3 rounded-2xl">
              <input
                type="color"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
                className="w-10 h-11 rounded-xl cursor-pointer overflow-hidden bg-transparent"
              />
              <div className="flex flex-col select-none min-w-0">
                <span className="text-[12.5px] font-extrabold text-zinc-800 uppercase tracking-wider">{subjectColor}</span>
                <span className="text-[9px] text-zinc-400 font-bold leading-tight">Click block to pick color</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Subject Thumbnail</label>
            {subjectThumbnail ? (
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-zinc-200 group">
                <img
                  src={subjectThumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjectThumbnail("")}
                    className="p-2 bg-white rounded-full text-rose-600 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center bg-white hover:border-[#f25c88] transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCropFileName(file.name);
                      const reader = new FileReader();
                      reader.addEventListener("load", () => {
                        setCropImageSrc(reader.result as string);
                      });
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[#f25c88]/20 border-t-[#f25c88] animate-spin" />
                    <span className="text-[10px] text-zinc-400 font-bold">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="w-5 h-5 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 font-bold">Upload image</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
