"use client";

import React from "react";
import { Settings, HelpCircle, Trash2, Plus, Building2, FileText } from "lucide-react";

interface BasicParametersSectionProps {
  nameInput: string;
  setNameInput: (val: string) => void;
  descInput: string;
  setDescInput: (val: string) => void;
  thumbnailInput: string;
  setThumbnailInput: (val: string) => void;
  isUploading: boolean;
  setCropFileName: (val: string) => void;
  setCropImageSrc: (val: string | null) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function BasicParametersSection({
  nameInput,
  setNameInput,
  descInput,
  setDescInput,
  thumbnailInput,
  setThumbnailInput,
  isUploading,
  setCropFileName,
  setCropImageSrc,
  showToast,
}: BasicParametersSectionProps) {
  return (
    <div id="basic-parameters" className="flex flex-col gap-6 w-full mb-16 lg:pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-[#f25c88]" />
            Basic Parameters
          </h3>
          <button
            type="button"
            onClick={() => showToast("Configure primary parameters including organization name, descriptions, and thumbnails.", "success")}
            className="w-5 h-5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group/help relative"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 border border-zinc-800">
              Help & Docs
            </span>
          </button>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Configure the primary profile details, description, and custom branding logo for the institution.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        <div className="flex-1 flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Institution Name *</label>
            <div className="relative flex items-center w-full">
              <Building2 className="absolute left-1 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 focus:border-[#f25c88]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Description</label>
            <div className="relative flex items-start w-full">
              <FileText className="absolute left-1 top-2.5 w-4 h-4 text-zinc-400" />
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                rows={4}
                className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 resize-none focus:border-[#f25c88]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[12px] font-bold text-zinc-600">Profile Picture</label>
          {thumbnailInput && thumbnailInput.trim().length > 0 ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-zinc-200 group shadow-sm">
              <img
                src={thumbnailInput}
                alt="Institution preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setThumbnailInput("")}
                  className="p-2 bg-white rounded-full text-rose-600 hover:scale-105 transition-transform cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border border-dashed border-zinc-200 flex flex-col items-center justify-center bg-white hover:border-[#f25c88] transition-colors relative overflow-hidden shadow-sm">
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
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Plus className="w-5 h-5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-bold">Select image</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
