"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../components/views/Header";
import FolderCard from "../../../components/ui/FolderCard";
import StatsSegmentCard from "../../../components/ui/StatsSegmentCard";
import { useLms } from "../../../context/LmsContext";
import { useSearchParams, useRouter } from "next/navigation";
import { formatFileSize } from "../../../lib/formatters";
import {
  FileText,
  Download,
  Trash2,
  File,
  FolderOpen,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  ChevronRight,
  Search,
  UploadCloud,
  Loader2,
} from "lucide-react";

interface StorageStats {
  usedBytes: number;
  maxBytes: number;
  materialsBytes: number;
  submissionsBytes: number;
}

export default function StoragePage() {
  const { currentUser, subjects, showToast } = useLms();
  const [fileSearch, setFileSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Fetch Storage Stats
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/dashboard-stats`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setStorageStats(data.storage);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [currentUser, subjects]);

  const mySubjects = React.useMemo(() => {
    if (!currentUser?.id) return [];
    return subjects.filter((subj) =>
      subj.createdBy === currentUser.id ||
      subj.lecturers?.some((l) => l.userId === currentUser.id) ||
      subj.participants?.some((p) => p.userId === currentUser.id)
    );
  }, [subjects, currentUser]);

  const getFileIcon = (mimeType: string) => {
    const m = mimeType.toLowerCase();
    if (m.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (m.includes("pdf")) return <FileText className="w-4 h-4 text-rose-500" />;
    if (m.includes("spreadsheet") || m.includes("excel") || m.includes("csv"))
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    if (m.includes("zip") || m.includes("rar") || m.includes("tar") || m.includes("compressed"))
      return <FileArchive className="w-4 h-4 text-amber-500" />;
    return <File className="w-4 h-4 text-zinc-400" />;
  };

  const folderPath = searchParams.get("folder") || "";
  const folderParts = folderPath.split("/").filter(Boolean);

  const currentSubjectId = folderParts[0] || null;
  const currentModuleId = folderParts[1] || null;
  const currentLessonId = folderParts[2] || null;

  const currentSubject = currentSubjectId ? mySubjects.find((s) => s.id === currentSubjectId) : null;
  const currentModule = currentSubject && currentModuleId
    ? currentSubject.modules.find((m) => m.id === currentModuleId) : null;
  const currentLesson = currentModule && currentLessonId
    ? currentModule.lessons.find((l) => l.id === currentLessonId) : null;

  const navigateTo = (folder: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (folder) {
      params.set("folder", folder);
    } else {
      params.delete("folder");
    }
    router.push(`/dashboard/storage?${params.toString()}`);
  };

  const breadcrumbs: { name: string; folder: string }[] = [
    { name: "Storage Root", folder: "" },
    ...(currentSubject ? [{ name: currentSubject.name, folder: currentSubject.id }] : []),
    ...(currentModule ? [{ name: currentModule.title, folder: `${currentSubjectId}/${currentModuleId}` }] : []),
    ...(currentLesson ? [{ name: currentLesson.title, folder: `${currentSubjectId}/${currentModuleId}/${currentLessonId}` }] : []),
  ];

  // File Upload Logic (Upload to active lesson or subject)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;

    if (!currentSubjectId) {
      showToast("Please enter a subject folder to upload files", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const lessonIdParam = currentLessonId || "null";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/subjects/${currentSubjectId}/lessons/${lessonIdParam}/files`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload file");
      }

      showToast(`File "${file.name}" uploaded successfully!`, "success");
      
      // Reload page state or force subjects reload
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to upload file", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Dynamic statistics calculations
  const fileCounts = React.useMemo(() => {
    let pdf = 0;
    let img = 0;
    let sheet = 0;
    let other = 0;

    const countFile = (f: { mimeType: string }) => {
      const m = f.mimeType.toLowerCase();
      if (m.includes("pdf")) pdf++;
      else if (m.startsWith("image/")) img++;
      else if (m.includes("spreadsheet") || m.includes("excel") || m.includes("csv")) sheet++;
      else other++;
    };

    mySubjects.forEach((subj) => {
      (subj.files || []).forEach(countFile);
      subj.modules.forEach((mod) => {
        mod.lessons.forEach((les) => {
          (les.files || []).forEach(countFile);
        });
      });
    });

    const total = pdf + img + sheet + other;
    return { pdf, img, sheet, other, total };
  }, [mySubjects]);

  const storageUsageMetrics = React.useMemo(() => {
    if (!storageStats) {
      return {
        usedStr: "85.9 MB",
        maxStr: "200 MB",
        materialsStr: "52.1 MB",
        submissionsStr: "21.5 MB",
        assetsStr: "12.3 MB",
        freeStr: "114.1 MB",
        usedBytes: 85900000,
        materialsBytes: 52100000,
        submissionsBytes: 21500000,
        assetsBytes: 12300000,
        freeBytes: 114100000,
        maxBytes: 200000000,
        usedPercent: 43,
      };
    }

    const used = storageStats.usedBytes;
    const max = storageStats.maxBytes;
    const mat = storageStats.materialsBytes;
    const sub = storageStats.submissionsBytes;
    const ast = Math.max(0, used - mat - sub);
    const free = Math.max(0, max - used);

    return {
      usedStr: formatFileSize(used),
      maxStr: formatFileSize(max),
      materialsStr: formatFileSize(mat),
      submissionsStr: formatFileSize(sub),
      assetsStr: formatFileSize(ast),
      freeStr: formatFileSize(free),
      usedBytes: used,
      materialsBytes: mat,
      submissionsBytes: sub,
      assetsBytes: ast,
      freeBytes: free,
      maxBytes: max,
      usedPercent: Math.round((used / max) * 100),
    };
  }, [storageStats]);

  // Striped repeating linear gradient constant string
  const stripeGradient = "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(229, 225, 216, 0.8) 12px, rgba(229, 225, 216, 0.8) 24px)";

  // Themed Black-Yellow Accent configurations:
  // - Gray-on-cream stripes (#FAF7F2 matching page bg with stripes) for: Free Capacity, Others, and Plan Tier
  // - Main Yellow (#facc15) for: Used Space and Materials
  // - Other yellows (#d97706 amber-accent, #fbbf24 golden-accent, #fef08a soft-yellow-accent) for the remaining parameters
  const itemsCardData = {
    segments: [
      { value: fileCounts.pdf, color: "#d97706" }, // Amber/Gold accent
      { value: fileCounts.img, color: "#fbbf24" }, // Golden accent
      { value: fileCounts.sheet, color: "#fef08a" }, // Soft yellow accent
      { value: fileCounts.other, color: "#FAF7F2", backgroundImage: stripeGradient }, // Cream/gray stripes
    ],
    details: [
      { label: "PDF Documents", value: `${fileCounts.pdf} files`, color: "#d97706" },
      { label: "Images & Assets", value: `${fileCounts.img} files`, color: "#fbbf24" },
      { label: "Spreadsheets", value: `${fileCounts.sheet} files`, color: "#fef08a" },
      { label: "Others", value: `${fileCounts.other} files`, color: "#FAF7F2", backgroundImage: stripeGradient },
    ],
  };

  const spaceCardData = {
    segments: [
      { value: storageUsageMetrics.materialsBytes, color: "#facc15" }, // Main Yellow
      { value: storageUsageMetrics.submissionsBytes, color: "#d97706" }, // Amber/Gold accent
      { value: storageUsageMetrics.assetsBytes, color: "#fbbf24" }, // Golden accent
      { value: storageUsageMetrics.freeBytes, color: "#FAF7F2", backgroundImage: stripeGradient }, // Cream/gray stripes (Free Capacity)
    ],
    details: [
      { label: "Materials", value: storageUsageMetrics.materialsStr, color: "#facc15" },
      { label: "Submissions", value: storageUsageMetrics.submissionsStr, color: "#d97706" },
      { label: "System Assets", value: storageUsageMetrics.assetsStr, color: "#fbbf24" },
      { label: "Free Capacity", value: `${storageUsageMetrics.freeStr} free`, color: "#FAF7F2", backgroundImage: stripeGradient },
    ],
  };

  const quotaCardData = {
    segments: [
      { value: storageUsageMetrics.usedBytes, color: "#facc15" }, // Main Yellow (Used Space)
      { value: storageUsageMetrics.freeBytes, color: "#FAF7F2", backgroundImage: stripeGradient }, // Cream/gray stripes (Available Space)
    ],
    details: [
      { label: "Used Space", value: `${storageUsageMetrics.usedStr} (${storageUsageMetrics.usedPercent}%)`, color: "#facc15" },
      { label: "Available Space", value: `${storageUsageMetrics.freeStr} (${100 - storageUsageMetrics.usedPercent}%)`, color: "#FAF7F2", backgroundImage: stripeGradient },
      { label: "Plan Tier", value: "Starter Academic", color: "#FAF7F2", backgroundImage: stripeGradient }, // Cream/gray stripes
    ],
  };

  return (
    <>
      {/* Standard Header Component aligned with Dashboard styling */}
      <Header title="Storage" subtitle="File Explorer & Quota" />

      {/* Storage container matching the transparent blending design */}
      <div className="flex-grow overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">
          
          {/* Title & Description row - Aligned and styled exactly like the Subjects page title */}
          <div className="mt-2 text-left animate-in fade-in duration-300">
            <h1 className="text-xl sm:text-[28px] font-black text-zinc-955 tracking-tight">Files & Storage</h1>
            <p className="hidden sm:block text-[12.5px] text-zinc-500 font-semibold max-w-2xl mt-1 leading-snug">
              Browse and manage your academic files organized by subject, module, and lesson.
            </p>
          </div>

          {/* 3-Stat Horizontal Quota Grid (Using Reusable StatsSegmentCard Component) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-3 border-b border-[#EFECE6]/50">
            {loadingStats ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5 animate-pulse bg-white border border-[#EFECE6] p-6 rounded-2xl h-[180px] shadow-3xs">
                  <div className="h-3 w-16 bg-zinc-200 rounded"></div>
                  <div className="h-5 w-24 bg-zinc-300 rounded mt-1"></div>
                  <div className="h-4 w-full bg-zinc-150 rounded mt-4"></div>
                  <div className="flex-grow flex flex-col gap-2 mt-4">
                    <div className="h-2 w-full bg-zinc-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-zinc-100 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Stat 1: Total Items */}
                <StatsSegmentCard
                  title="Current total"
                  value={`${fileCounts.total} Tasks`}
                  segments={itemsCardData.segments}
                  details={itemsCardData.details}
                />

                {/* Stat 2: Space Used */}
                <StatsSegmentCard
                  title="Today total time"
                  value={storageUsageMetrics.usedStr}
                  segments={spaceCardData.segments}
                  details={spaceCardData.details}
                />

                {/* Stat 3: Quota Limit */}
                <StatsSegmentCard
                  title="Storage limit"
                  value={`${storageUsageMetrics.maxStr} Max`}
                  segments={quotaCardData.segments}
                  details={quotaCardData.details}
                />
              </>
            )}
          </div>

          {/* Directory Explorer Layout */}
          <div className="flex flex-col gap-5">
            
            {/* Action Toolbar (Direct pills design matching Subjects page filters bar) */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-1">
              
              {/* Search Pill */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EFECE6] rounded-full text-[12px] font-semibold text-zinc-800 placeholder-zinc-300 shadow-2xs outline-none focus:border-zinc-300 transition-colors"
                />
              </div>

              {/* Upload file button: styled exactly like the Subjects Create button */}
              {currentSubjectId && (
                <label className="flex items-center gap-1.5 px-4.5 py-2.5 sm:px-5 sm:py-2.5 bg-[#121212] hover:bg-zinc-900 text-white font-extrabold rounded-full text-[10.5px] sm:text-[11.5px] cursor-pointer transition-colors shadow-xs whitespace-nowrap select-none">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#facc15]" />
                      <span>Upload File</span>
                    </>
                  )}
                  <input
                    type="file"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Breadcrumb Path Trail */}
            <div className="flex items-center gap-1.5 px-1 text-[12px] font-normal text-zinc-400 flex-wrap">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.folder}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
                  <button
                    onClick={() => navigateTo(crumb.folder)}
                    className={`hover:text-zinc-850 transition-colors ${
                      idx === breadcrumbs.length - 1 ? "text-zinc-850 cursor-default pointer-events-none" : "cursor-pointer"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folder / File Browser Panel */}
            <div className="mt-1">
              
              {/* 1. ROOT LEVEL: DISPLAY SUBJECT FOLDERS */}
              {!currentSubject && (
                <>
                  {mySubjects.length === 0 ? (
                    <div className="w-full h-80 flex flex-col items-center justify-center bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs">
                      <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-center mt-3">
                        <span className="text-[13.5px] font-bold text-zinc-800">No subjects joined</span>
                        <span className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">Please join or create a subject to access files</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mySubjects.map((subject) => {
                        const total = (subject.files || []).length +
                          subject.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + (l.files || []).length, 0), 0);
                        const visible = !fileSearch || subject.name.toLowerCase().includes(fileSearch.toLowerCase());
                        if (!visible) return null;
                        return (
                          <FolderCard
                            key={subject.id}
                            name={subject.name}
                            itemCount={total}
                            subtitle="Subject Directory"
                            leftStatNumber={total < 10 ? `0${total}` : total}
                            leftStatLabel="Doc"
                            rightStatNumber={subject.modules.length}
                            rightStatLabel="Modules"
                            bannerColor={
                              subject.color === "green" || subject.color === "orange"
                                ? "#facc15"
                                : "#FAF7F2"
                            }
                            bannerHasStripes={true}
                            onClick={() => navigateTo(subject.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* 2. SUBJECT LEVEL: DISPLAY SUBJECT FILES & MODULE FOLDERS */}
              {currentSubject && !currentModule && (
                <div className="flex flex-col gap-5">
                  
                  {/* Subject General Files */}
                  {(currentSubject.files || []).length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1.5">Direct Files</span>
                      <div className="bg-white border border-[#EFECE6] rounded-[32px] divide-y divide-zinc-100 overflow-hidden shadow-xs">
                        {currentSubject.files!.filter((f) =>
                          !fileSearch || f.name.toLowerCase().includes(fileSearch.toLowerCase())
                        ).map((file) => (
                          <div key={file.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors group">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                {getFileIcon(file.mimeType)}
                              </div>
                              <div className="flex flex-col min-w-0 text-left">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[13px] font-bold text-zinc-800 hover:text-amber-600 truncate leading-tight transition-colors cursor-pointer"
                                >
                                  {file.name}
                                </a>
                                <div className="flex items-center gap-2 mt-1 text-[10.5px] text-zinc-450 font-semibold">
                                  <span>{formatFileSize(file.sizeBytes)}</span>
                                  <span className="text-zinc-300">•</span>
                                  <span>General Subject Attachment</span>
                                  <span className="text-zinc-300">•</span>
                                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <a
                                href={file.url}
                                download={file.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modules Folders (Using Redesigned FolderCard) */}
                  {currentSubject.modules.length > 0 && (
                    <div className="flex flex-col gap-3 mt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentSubject.modules.map((mod) => {
                          const total = mod.lessons.reduce((a, l) => a + (l.files || []).length, 0);
                          const visible = !fileSearch || mod.title.toLowerCase().includes(fileSearch.toLowerCase());
                          if (!visible) return null;
                          return (
                            <FolderCard
                              key={mod.id}
                              name={mod.title}
                              itemCount={total}
                              subtitle="Module Directory"
                              leftStatNumber={total < 10 ? `0${total}` : total}
                              leftStatLabel="Doc"
                              rightStatNumber={mod.lessons.length}
                              rightStatLabel="Lessons"
                              bannerColor="#facc15"
                              bannerHasStripes={true}
                              onClick={() => navigateTo(`${currentSubjectId}/${mod.id}`)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentSubject.modules.length === 0 && (currentSubject.files || []).length === 0 && (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs">
                      <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col mt-3">
                        <span className="text-[13.5px] font-bold text-zinc-800">No folders or files here</span>
                        <span className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">This subject has no uploads yet</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. MODULE LEVEL: DISPLAY LESSON FOLDERS (Using Redesigned FolderCard) */}
              {currentModule && !currentLesson && (
                <div className="flex flex-col gap-3">
                  {currentModule.lessons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentModule.lessons.map((les) => {
                        const total = (les.files || []).length;
                        const visible = !fileSearch || les.title.toLowerCase().includes(fileSearch.toLowerCase());
                        if (!visible) return null;
                        return (
                          <FolderCard
                            key={les.id}
                            name={les.title}
                            itemCount={total}
                            subtitle="Lesson Directory"
                            leftStatNumber={total < 10 ? `0${total}` : total}
                            leftStatLabel="Doc"
                            rightStatNumber="1"
                            rightStatLabel="Lesson"
                            bannerColor="#FAF7F2"
                            bannerHasStripes={true}
                            onClick={() => navigateTo(`${currentSubjectId}/${currentModuleId}/${les.id}`)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs">
                      <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-center mt-3">
                        <span className="text-[13.5px] font-bold text-zinc-800">Module empty</span>
                        <span className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">No lessons created inside this module yet</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. LESSON LEVEL: DISPLAY LESSON FILES */}
              {currentLesson && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1.5">Lesson Materials</span>
                  {(currentLesson.files || []).length > 0 ? (
                    <div className="bg-white border border-[#EFECE6] rounded-[32px] divide-y divide-zinc-100 overflow-hidden shadow-xs">
                      {(currentLesson.files || []).filter((f) =>
                        !fileSearch || f.name.toLowerCase().includes(fileSearch.toLowerCase())
                      ).map((file) => (
                        <div key={file.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors group">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                              {getFileIcon(file.mimeType)}
                            </div>
                            <div className="flex flex-col min-w-0 text-left font-normal">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[13px] font-bold text-zinc-800 hover:text-amber-600 truncate leading-tight transition-colors cursor-pointer"
                              >
                                {file.name}
                              </a>
                              <div className="flex items-center gap-2 mt-1 text-[10.5px] text-zinc-450 font-normal">
                                <span>{formatFileSize(file.sizeBytes)}</span>
                                <span className="text-zinc-300">•</span>
                                <span>Lesson Attachment</span>
                                <span className="text-zinc-300">•</span>
                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <a
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-[#EFECE6] rounded-[32px] p-6 shadow-xs">
                      <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-center mt-3">
                        <span className="text-[13.5px] font-bold text-zinc-800">No lesson files</span>
                        <span className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">Please upload files for this lesson to view them here</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
