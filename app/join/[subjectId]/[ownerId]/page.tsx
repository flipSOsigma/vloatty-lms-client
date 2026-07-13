"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLms } from "../../../../context/LmsContext";
import { GraduationCap, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { getSubjectDetails, joinSubject } from "@/services/subject.service";
import { SubjectParticipant } from "@/types/subject.interface";

interface PageProps {
  params: Promise<{ subjectId: string; ownerId: string }>;
}

export default function JoinSubjectPage({ params }: PageProps) {
  const { subjectId, ownerId } = React.use(params);
  const router = useRouter();
  const { currentUser, isLoadingUser, showToast } = useLms();

  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [subjectColor, setSubjectColor] = useState("#facc15");
  const [participants, setParticipants] = useState<SubjectParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        const data = await getSubjectDetails(subjectId);
        setSubjectName(data.name);
        setSubjectDesc(data.description || "");
        setSubjectColor(data.color || "#facc15");
        setParticipants(data.participants || []);
      } catch (err: any) {
        setError(err.message || "Unable to fetch subject information.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  const handleJoin = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/join/${subjectId}/${ownerId}`);
      return;
    }

    setJoining(true);
    setError(null);
    try {
      await joinSubject(subjectId);

      showToast(`Successfully joined ${subjectName}!`, "success");
      
      setTimeout(() => {
        window.location.href = `/dashboard/subject/${subjectId}`;
      }, 800);
    } catch (err: any) {
      setError(err.message || "An error occurred while trying to join the subject.");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-zinc-50 flex items-center justify-center p-4">
        <LoadingSpinner label="Loading invite..." size="md" />
      </div>
    );
  }

  const displayedParticipants = participants.slice(0, 5);
  const hasMore = participants.length > 5;

  return (
    <div className="min-h-screen w-screen bg-zinc-50 flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden select-none">
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#facc15]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#facc15]/5 blur-3xl pointer-events-none" />

      {/* Centered layout - card frame style (bg, border, shadow) removed */}
      <div className="w-full max-w-[420px] flex flex-col items-center justify-center text-center relative z-10 transition-all duration-300 px-4 py-8">
        
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border shadow-xs"
            style={{
              backgroundColor: `${subjectColor}12`,
              borderColor: `${subjectColor}25`,
              color: subjectColor
            }}
          >
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-400 uppercase tracking-widest text-[10px] mb-1.5">
            Subject Invitation
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-800 tracking-tight leading-tight max-w-sm">
            {subjectName}
          </h2>
        </div>

        {error && (
          <div className="w-full mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-[12px] text-red-600 font-semibold text-left">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {subjectDesc && (
          <p className="mb-6 text-[13px] text-zinc-500 font-medium leading-relaxed max-w-sm text-center">
            {subjectDesc}
          </p>
        )}

        {/* User Avatars & Names display (Max 5 with dots) */}
        {participants.length > 0 && (
          <div className="flex flex-col items-center mb-8 w-full gap-3 select-none">
            <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest">
              Already enrolled ({participants.length})
            </span>
            
            <div className="flex items-center justify-center -space-x-2.5 overflow-hidden">
              {displayedParticipants.map((p) => (
                <div 
                  key={p.userId} 
                  className="relative inline-block w-8 h-8 rounded-full border-2 border-zinc-55 bg-zinc-200 overflow-hidden shadow-xs hover:z-10 transition-all group"
                  title={p.name}
                >
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[10px] font-bold text-white uppercase">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-[11.5px] font-semibold text-zinc-500 max-w-xs text-center leading-relaxed">
              {displayedParticipants.map(p => p.name).join(", ")}
              {hasMore ? "...." : ""}
            </p>
          </div>
        )}

        {/* Button kept, inputs do not exist */}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-3.5 px-6 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-300 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 select-none text-white"
        >
          {joining ? "Joining Class..." : currentUser ? "Accept Invitation" : "Sign In to Accept Invite"}
          {!joining && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="text-center mt-6 text-[12px] font-semibold text-zinc-400">
          <Link href="/dashboard" className="hover:underline">
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
