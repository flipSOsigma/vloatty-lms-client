"use client";

import React from "react";
import {
  FileText,
  HelpCircle,
  UploadCloud,
  Download,
  Trash2,
  File as FileIcon,
} from "lucide-react";
import { useTableControls } from "../hooks/useTableControls";
import TableControls from "./TableControls";
import TablePagination from "./TablePagination";
import SortableHeader from "./SortableHeader";

export interface InstitutionFile extends Record<string, unknown> {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderRole: string;
  downloads: number;
  category: string;
}

interface CurrentUser {
  id?: string;
  name?: string;
  email?: string;
  premiumStatus?: string;
}

interface OrganizeFilesSectionProps {
  files: InstitutionFile[];
  setFiles: React.Dispatch<React.SetStateAction<InstitutionFile[]>>;
  currentUser: CurrentUser | null;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function OrganizeFilesSection({
  files,
  setFiles,
  currentUser,
  showToast,
}: OrganizeFilesSectionProps) {
  const {
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    paged,
    totalPages,
    totalFiltered,
  } = useTableControls<InstitutionFile>({
    data: files,
    searchFields: ["name", "category", "uploadedBy"],
    defaultSort: "name",
    defaultPageSize: 5,
  });

  return (
    <div id="organize-files" className="flex flex-col gap-8 w-full mb-16 lg:pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#d97706]" />
              Organize Files
            </h3>
            <button
              type="button"
              onClick={() =>
                showToast(
                  "Upload and organize documentation, media files, and campus assets.",
                  "success"
                )
              }
              className="w-5 h-5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group/help relative"
            >
              <HelpCircle className="w-3 h-3" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-30 border border-zinc-800">
                Help &amp; Docs
              </span>
            </button>
          </div>
          <div className="relative">
            <input
              type="file"
              id="institution-file-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const limitBytes = 200 * 1024 * 1024;
                  if (file.size > limitBytes) {
                    showToast("File size exceeds the 200 MB storage limit.", "error");
                    return;
                  }
                  const newFile: InstitutionFile = {
                    id: Math.random().toString(36).substring(2, 9),
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    uploadedAt: new Date().toISOString().split("T")[0],
                    uploadedBy: currentUser?.name || "Unknown",
                    uploaderRole:
                      currentUser?.premiumStatus === "professional" ? "Owner" : "Admin",
                    downloads: 0,
                    category: file.name.endsWith(".pdf") ? "Policy" : "Academic",
                  };
                  setFiles((prev) => [...prev, newFile]);
                  showToast(`File "${file.name}" uploaded successfully!`, "success");
                }
              }}
            />
            <label
              htmlFor="institution-file-upload"
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload File
            </label>
          </div>
        </div>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Store, manage, and share official documentation, handbook assets, and policy resources. (Max 200 MB storage quota)
        </p>
      </div>

      {files.length > 0 && (
        <TableControls
          search={search}
          onSearchChange={setSearch}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          total={files.length}
          filtered={totalFiltered}
          searchPlaceholder="Search by file name, category, uploaded by..."
        />
      )}

      <div className="w-full overflow-x-auto">
        {files.length === 0 ? (
          <div className="w-full h-32 flex items-center justify-center border border-dashed border-[#EFECE6] rounded-2xl bg-white/40">
            <span className="text-[12px] text-zinc-400 font-semibold">No files uploaded yet.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16">
                  Format
                </th>
                <SortableHeader
                  label="File Name"
                  sortKey="name"
                  currentSort={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => toggleSort(k as keyof InstitutionFile)}
                />
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Uploaded By
                </th>
                <SortableHeader
                  label="Downloads"
                  sortKey="downloads"
                  currentSort={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => toggleSort(k as keyof InstitutionFile)}
                />
                <SortableHeader
                  label="Upload Date"
                  sortKey="uploadedAt"
                  currentSort={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => toggleSort(k as keyof InstitutionFile)}
                />
                <th className="pb-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider w-16 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/55">
              {paged.map((file) => (
                <tr key={file.id} className="hover:bg-zinc-50/10 transition-colors">
                  <td className="py-3 pr-2">
                    <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-[#FAF9F5] border border-zinc-200/50 text-[#d97706]">
                      <FileIcon className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col max-w-xs">
                      <span className="text-[13px] font-bold text-zinc-800 truncate block">
                        {file.name}
                      </span>
                      <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 w-fit mt-1">
                        {file.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[12px] text-zinc-500 font-semibold">{file.size}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-zinc-700 font-semibold">
                        {file.uploadedBy}
                      </span>
                      <span className="text-[9.5px] text-zinc-400 font-bold">
                        {file.uploaderRole}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[12px] text-zinc-600 font-bold bg-[#FAF9F5] px-2 py-0.5 border border-zinc-200/50 rounded-md">
                      {file.downloads} DLs
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[12px] text-zinc-400 font-medium">{file.uploadedAt}</span>
                  </td>
                  <td className="py-3 text-right flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => showToast(`Downloading ${file.name}...`, "success")}
                      className="p-2 text-zinc-400 hover:text-zinc-700 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => prev.filter((f) => f.id !== file.id));
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 transition-colors duration-200 cursor-pointer inline-flex items-center justify-center active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <span className="text-[12px] text-zinc-400 font-semibold">
                      No files found matching search criteria.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        total={totalFiltered}
        onPage={setPage}
        label="files"
      />
    </div>
  );
}
