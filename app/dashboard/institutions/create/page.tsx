"use client";

import React, { useState } from "react";
import Header from "../../../../components/views/Header";
import { useLms } from "../../../../context/LmsContext";
import {
  ArrowLeft,
  Building2,
  FileText,
  Sparkles,
  Check,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateInstitutionPage() {
  const router = useRouter();
  const { showToast } = useLms();
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [statusInput, setStatusInput] = useState("free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSubmitting(true);
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/institutions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
        },
        body: JSON.stringify({
          name: nameInput.trim(),
          description: descInput.trim(),
          subscriptionStatus: statusInput,
        }),
      });

      if (!res.ok) throw new Error("Failed to create institution");

      showToast("Institution created successfully!", "success");
      router.push("/dashboard/institutions");
    } catch (err: any) {
      showToast(err.message || "Failed to create institution", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full">
        <div className="w-full px-6 md:px-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => router.push("/dashboard/institutions")}
            className="w-10 h-10 rounded-full border border-[#E5E1D8]/70 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">Institution</span>
            <h1 className="text-[34px] font-semibold text-zinc-800 tracking-tight leading-none mt-1">
              Create New Institution
            </h1>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-5 w-full mb-8">
            <h3 className="text-[14.5px] font-semibold text-zinc-800 flex items-center gap-2 pb-2 border-b border-[#E5E1D8]/70">
              <Settings className="w-4.5 h-4.5 text-[#d97706]" />
              Basic Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Institution Name *</label>
                  <div className="relative flex items-center w-full">
                    <Building2 className="absolute left-1 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      placeholder="e.g. Vloatty Technology"
                      className="w-full pl-7 pr-1 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Subscription Plan</label>
                  <div className="relative flex items-center w-full">
                    <Sparkles className="absolute left-1 w-4 h-4 text-zinc-400" />
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full pl-7 pr-1 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none transition-colors duration-200 cursor-pointer"
                    >
                      <option value="free">Free Tier</option>
                      <option value="premium">Premium</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Description</label>
                  <div className="relative flex items-start w-full">
                    <FileText className="absolute left-1 top-2.5 w-4 h-4 text-zinc-400" />
                    <textarea
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      rows={4}
                      placeholder="Write a brief overview of this organization..."
                      className="w-full pl-7 pr-1 py-2 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 rounded-xl text-zinc-800 font-semibold text-[13px] focus:outline-none transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-8 border-t border-[#E5E1D8]/70 mt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/institutions")}
              className="px-6 py-2.5 border border-[#E5E1D8]/70 text-zinc-700 hover:text-zinc-800 hover:border-zinc-300 font-semibold rounded-xl text-[11px] bg-white transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Create Institution
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
