"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../components/views/Header";
import { useLms } from "../../../../context/LmsContext";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen, Link2, Link2Off, CheckCircle, Grid2x2X, Grid2x2Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import SubjectCard from "../../../../components/ui/SubjectCard";
import { StorageTracker } from "../../../../components/ui/StorageTracker";

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
  inviteCode?: string;
  createdAt?: string;
}

const formatDate = (isoString: string | undefined) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

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

  useEffect(() => {
    if (institution) {
      document.title = `${institution.name} - VLOATTY Learning Management System`;
    }
  }, [institution]);

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
        logoBg: "bg-[#facc15] text-white",
        tagBg: "bg-pink-50 text-pink-700 border border-pink-200/50",
        colorHex: "#facc15"
      };
    }
    if (status === "professional") {
      return {
        bg: "bg-white",
        border: "border border-emerald-200/60",
        shadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.06)]",
        logoBg: "bg-emerald-600 text-white",
        tagBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
        colorHex: "#facc15"
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

      <div className="flex-1 overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-6 md:px-8 flex flex-col gap-6">
        <div className="flex items-center justify-between w-full mt-1">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/institutions"
              className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">Institution</span>
              <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">{institution.name}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-0">
            <div className="flex flex-col gap-5 w-full">


              <div className="flex flex-col gap-1">
                <span
                  className="inline-block text-[9px] font-semibold px-3 py-1 rounded-full w-fit uppercase tracking-wider"
                  style={{
                    backgroundColor: "#facc1515",
                    color: "#facc15",
                    border: "1px solid #facc1530"
                  }}
                >
                  {institution.subscriptionStatus} Plan
                </span>
                <h2 className="text-2xl font-semibold text-zinc-800 tracking-tight mt-2 leading-tight">
                  {institution.name}
                </h2>
              </div>

              {institution.description && (
                <p className="text-[12px] text-zinc-500 leading-relaxed font-medium bg-zinc-50 p-4 border border-[#E5E1D8]/70 rounded-xl">
                  {institution.description}
                </p>
              )}

              {institution.users && institution.users.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Active Directory
                  </span>
                  <div className="flex flex-col gap-2">
                    {institution.users.slice(0, 5).map((user: any) => {
                      const userInitials = user.name
                        ? user.name
                            .split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "?";
                      return (
                        <div key={user.id} className="flex items-center justify-between bg-zinc-50 p-2.5 border border-[#E5E1D8]/70 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#facc15]/10 border border-[#f97316]/15 text-[#d97706] flex items-center justify-center text-[10.5px] font-semibold shrink-0">
                                {userInitials}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12.5px] font-semibold text-zinc-800 truncate">{user.name}</span>
                              <span className="text-[10px] text-zinc-400 font-semibold truncate capitalize">{user.institutionRole || "Lecturer"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {institution.users.length > 5 && (
                      <span className="text-[11px] font-bold text-zinc-400 mt-1 pl-1">
                        + {institution.users.length - 5} more members
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E1D8]/40">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Organization Info
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-700 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                    <span>Invite Code</span>
                    <span className="text-zinc-500 text-[11px] select-all font-mono">{institution.inviteCode || "None"}</span>
                  </div>
                  {institution.createdAt && (
                    <div className="flex justify-between items-center text-[12px] font-semibold text-zinc-700 bg-zinc-50 px-3.5 py-2 border border-[#E5E1D8]/70 rounded-xl">
                      <span>Joined Date</span>
                      <span className="text-zinc-500 text-[11px]">{formatDate(institution.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/institutions/${institution.id}/manage`}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[11px] rounded-xl transition-all cursor-pointer active:scale-[0.98] mt-2 text-center"
              >
                <span>Manage Institution</span>
              </Link>

              <div className="mt-2 w-full">
                <StorageTracker institutionId={institution.id} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-zinc-800 tracking-tight">Linked Subjects</h3>
                  <span className="bg-zinc-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {linkedSubjects.length}
                  </span>
                </div>
                {linkedSubjects.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/70 p-1 rounded-xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] shrink-0">
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
                <div className="w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl bg-white/40 p-6 text-center">
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
