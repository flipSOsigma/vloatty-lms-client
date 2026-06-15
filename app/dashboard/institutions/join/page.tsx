"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLms } from "../../../../context/LmsContext";
import { Building2, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function JoinInstitutionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { currentUser, isLoadingUser, showToast } = useLms();

  const [instName, setInstName] = useState("");
  const [instDesc, setInstDesc] = useState("");
  const [instThumbnail, setInstThumbnail] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("No invitation code provided.");
      setLoading(false);
      return;
    }

    const fetchInstitutionDetails = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      try {
        const response = await fetch(`${API_BASE_URL}/institutions/invite/${code}`);
        if (!response.ok) {
          throw new Error("Invalid or expired invitation link.");
        }
        const data = await response.json();
        setInstName(data.name);
        setInstDesc(data.description || "");
        setInstThumbnail(data.thumbnail || "");
      } catch (err: any) {
        setError(err.message || "Unable to fetch invitation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionDetails();
  }, [code]);

  const handleJoin = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/dashboard/institutions/join?code=${code}`);
      return;
    }

    setJoining(true);
    setError(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/institutions/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ inviteCode: code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join institution.");
      }

      const resData = await response.json();
      showToast(`Successfully joined ${instName}!`, "success");

      setTimeout(() => {
        window.location.href = `/dashboard/institutions/${resData.institution.id}`;
      }, 800);
    } catch (err: any) {
      setError(err.message || "An error occurred while trying to join the institution.");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-[#f25c88] animate-spin" />
          <span className="text-[13px] text-zinc-500 font-semibold">Loading invitation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden select-none">
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#f25c88]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#f25c88]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[460px] bg-white border border-[#EFECE6]/80 rounded-[32px] p-6 md:p-10 shadow-sm relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          {instThumbnail ? (
            <img
              src={instThumbnail}
              alt={instName}
              className="w-16 h-16 rounded-full object-cover mb-4 border border-[#FAF7F2] shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-[#f25c88]/10 border border-[#f25c88]/20 flex items-center justify-center mb-4 text-[#f25c88]">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-extrabold text-[#121212] tracking-tight text-center">
            Organization Invite
          </h1>
          <h2 className="text-lg font-bold text-zinc-700 text-center mt-1">
            Join {instName}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-[12px] text-red-600 font-semibold">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {instDesc && (
          <div className="mb-6 p-4 bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl text-[12.5px] text-zinc-500 font-medium leading-relaxed max-h-32 overflow-y-auto no-scrollbar">
            {instDesc}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining || !code}
          className="w-full py-3.5 px-6 bg-[#121212] text-white hover:bg-zinc-800 disabled:bg-zinc-300 rounded-full text-[13px] font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 select-none"
        >
          {joining ? "Joining..." : currentUser ? "Accept Invitation" : "Sign In to Accept Invite"}
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
