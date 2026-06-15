"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../components/views/Header";
import { useLms } from "../../../../context/LmsContext";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen, Link2, Link2Off, CheckCircle, Grid2x2X, Grid2x2Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import SubjectCard from "../../../../components/ui/SubjectCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Institution {
  id: string;
  name: string;
  description?: string;
  subscriptionStatus: string;
  thumbnail?: string;
  users?: any[];
  subjects?: any[];
}

export default function InstitutionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { subjects, currentUser, updateSubject, showToast } = useLms();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [selectedSubjectToUnlink, setSelectedSubjectToUnlink] = useState<any | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [linkedCols, setLinkedCols] = useState(3);
  const [createdCols, setCreatedCols] = useState(3);

  const getGridColsClass = (colCount: number) => {
    switch (colCount) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-300";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300";
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchInstitutionDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load institution details");
      const data = await res.json();
      setInstitution(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load institution", "error");
      router.push("/dashboard/institutions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionDetails();
  }, [id]);

  const handleLinkSubject = async (subject: any) => {
    try {
      const updatedSubject = { ...subject, institutionId: id };
      await updateSubject(updatedSubject);
      showToast(`Subject "${subject.name}" successfully linked!`, "success");
      fetchInstitutionDetails();
    } catch (err: any) {
      showToast(err.message || "Failed to link subject", "error");
    }
  };

  const triggerUnlinkConfirmation = (subject: any) => {
    setSelectedSubjectToUnlink(subject);
    setIsUnlinkModalOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!selectedSubjectToUnlink) return;
    setIsUnlinking(true);
    try {
      const updatedSubject = { ...selectedSubjectToUnlink, institutionId: null };
      await updateSubject(updatedSubject);
      showToast(`Subject "${selectedSubjectToUnlink.name}" unlinked successfully.`, "success");
      setIsUnlinkModalOpen(false);
      setSelectedSubjectToUnlink(null);
      fetchInstitutionDetails();
    } catch (err: any) {
      showToast(err.message || "Failed to unlink subject", "error");
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in duration-300 w-full items-center justify-center h-64">
          <span className="text-[13px] font-bold text-zinc-400">Loading details...</span>
        </div>
      </>
    );
  }

  if (!institution) return null;

  const getStatusColor = (status: string) => {
    if (status === "premium") {
      return {
        bg: "bg-white",
        border: "border border-pink-200/60",
        shadow: "hover:shadow-[0_20px_40px_rgba(242,92,136,0.06)]",
        logoBg: "bg-[#f25c88] text-white",
        tagBg: "bg-pink-50 text-pink-700 border border-pink-200/50",
        colorHex: "#f25c88"
      };
    }
    if (status === "professional") {
      return {
        bg: "bg-white",
        border: "border border-emerald-200/60",
        shadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.06)]",
        logoBg: "bg-emerald-600 text-white",
        tagBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
        colorHex: "#10b981"
      };
    }
    return {
      bg: "bg-white",
      border: "border border-zinc-200/60",
      shadow: "hover:shadow-[0_20px_40px_rgba(18,18,18,0.04)]",
      logoBg: "bg-[#ECE8E0] text-zinc-800",
      tagBg: "bg-zinc-100 text-zinc-600 border border-zinc-200/40",
      colorHex: "#a1a1aa"
    };
  };

  const theme = getStatusColor(institution.subscriptionStatus);

  const linkedSubjects = subjects.filter((s) => s.institutionId === id);

  const userCreatedSubjects = subjects.filter((s) => s.createdBy === currentUser?.id);

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300 w-full text-left">
        <div className="flex items-center justify-between w-full mt-1">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/institutions"
              className="w-10 h-10 rounded-full border border-[#E5E1D8]/60 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col gap-0.5 text-left">
              <h2 className="text-xl font-black text-zinc-950 tracking-tight">{institution.name} Details</h2>
              <span className="text-[11px] font-bold text-zinc-400">View institution profile, users, and subjects</span>
            </div>
          </div>
          <Link
            href={`/dashboard/institutions/${id}/manage`}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-[#FAF9F5] hover:border-zinc-400 text-[11px] font-bold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            Manage Institution
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-0">
            <div className="bg-white border border-[#E5E1D8]/60 p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
              <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-zinc-100">
                {institution.thumbnail && institution.thumbnail.trim().length > 0 ? (
                  <img
                    src={institution.thumbnail}
                    alt={institution.name}
                    className="w-16 h-16 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    style={{ backgroundColor: theme.colorHex, color: "#ffffff" }}
                  >
                    {institution.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <h3 className="text-[16.5px] font-black text-zinc-950 tracking-tight leading-tight">
                    {institution.name}
                  </h3>
                  <span className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-md mt-1.5 tracking-wider w-fit block ${theme.tagBg}`}>
                    {institution.subscriptionStatus} Plan
                  </span>
                </div>
              </div>

              {institution.description && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Description</span>
                  <p className="text-[12px] text-zinc-600 leading-relaxed font-medium bg-[#FAF9F5] p-4 border border-[#E5E1D8]/45 rounded-2xl">
                    {institution.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Organization Stats</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-[#FAF9F5] p-3 rounded-2xl border border-[#E5E1D8]/30">
                    <Users className="w-5 h-5 text-zinc-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Users</span>
                      <span className="text-[13px] font-extrabold text-zinc-800">{institution.users ? institution.users.length : 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#FAF9F5] p-3 rounded-2xl border border-[#E5E1D8]/30">
                    <BookOpen className="w-5 h-5 text-zinc-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Subjects</span>
                      <span className="text-[13px] font-extrabold text-zinc-800">{linkedSubjects.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-black text-zinc-950 tracking-tight">Linked Subjects</h3>
                  <span className="bg-zinc-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {linkedSubjects.length}
                  </span>
                </div>
                {linkedSubjects.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/45 p-1 rounded-xl shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => setLinkedCols((prev) => Math.max(2, prev - 1))}
                      disabled={linkedCols <= 2}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-zinc-500 px-1 select-none">
                      {linkedCols}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLinkedCols((prev) => Math.min(4, prev + 1))}
                      disabled={linkedCols >= 4}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {linkedSubjects.length === 0 ? (
                <div className="w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl bg-white/40 p-6 text-center">
                  <span className="text-[12px] text-zinc-400 font-semibold">No subjects linked to this institution yet.</span>
                </div>
              ) : (
                <div className={getGridColsClass(linkedCols)}>
                  {linkedSubjects.map((subject) => {
                    const isSubjectOwner = subject.createdBy === currentUser?.id;
                    return (
                      <div key={subject.id} className="relative group/card">
                        <SubjectCard subject={subject} />
                        {isSubjectOwner && (
                          <div className="absolute top-3 left-3 z-20 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-1 group-hover/card:translate-y-0 pointer-events-auto">
                            <div className="flex items-center gap-1.5 bg-zinc-950 text-white pl-3 pr-1 py-1 rounded-full shadow-lg border border-zinc-800 text-[10px] font-bold">
                              <span>Unlink</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerUnlinkConfirmation(subject);
                                }}
                                className="w-6 h-6 rounded-full bg-zinc-900 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                              >
                                <Link2Off className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-zinc-200/60 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-black text-zinc-950 tracking-tight">Subjects I&apos;ve Created</h3>
                  <span className="bg-zinc-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {userCreatedSubjects.length}
                  </span>
                </div>
                {userCreatedSubjects.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/45 p-1 rounded-xl shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => setCreatedCols((prev) => Math.max(2, prev - 1))}
                      disabled={createdCols <= 2}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-zinc-500 px-1 select-none">
                      {createdCols}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreatedCols((prev) => Math.min(4, prev + 1))}
                      disabled={createdCols >= 4}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
                    >
                      <Grid2x2Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {userCreatedSubjects.length === 0 ? (
                <div className="w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl bg-white/40 p-6 text-center">
                  <span className="text-[12px] text-zinc-400 font-semibold">You haven&apos;t created any subjects yet.</span>
                </div>
              ) : (
                <div className={getGridColsClass(createdCols)}>
                  {userCreatedSubjects.map((subject) => {
                    const isLinked = subject.institutionId === id;
                    return (
                      <div key={subject.id} className="relative group/card">
                        <SubjectCard subject={subject} />
                        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-1 group-hover/card:translate-y-0 pointer-events-auto">
                          {isLinked ? (
                            <div className="flex items-center gap-1.5 bg-zinc-950 text-white px-3 py-1.5 rounded-full shadow-lg border border-zinc-800 text-[10px] font-bold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Linked</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-zinc-950 text-white pl-3 pr-1 py-1 rounded-full shadow-lg border border-zinc-800 text-[10px] font-bold">
                              <span>Link Subject</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkSubject(subject);
                                }}
                                className="w-6 h-6 rounded-full bg-zinc-900 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isUnlinkModalOpen}
        onClose={() => {
          setIsUnlinkModalOpen(false);
          setSelectedSubjectToUnlink(null);
        }}
        onConfirm={handleConfirmUnlink}
        title="Unlink Subject"
        message={`Are you sure you want to unlink the subject "${selectedSubjectToUnlink?.name}" from this institution?`}
        confirmText="Unlink"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isUnlinking}
      />
    </>
  );
}
