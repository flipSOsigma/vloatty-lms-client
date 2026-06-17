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

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/institutions")}
            className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center text-zinc-600 hover:bg-white hover:border-zinc-400 transition-all duration-200 bg-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Create New Institution
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium">
              Register a new organization, company, or clinical portal profile.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-5 w-full mb-8 lg:pl-12">
            <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Settings className="w-4.5 h-4.5 text-[#f25c88]" />
              Basic Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Institution Name *</label>
                  <div className="relative flex items-center w-full">
                    <Building2 className="absolute left-1 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      placeholder="e.g. Vloatty Technology"
                      className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 focus:border-[#f25c88]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-zinc-600">Subscription Plan</label>
                  <div className="relative flex items-center w-full">
                    <Sparkles className="absolute left-1 w-4 h-4 text-zinc-400" />
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-semibold focus:outline-none transition-colors duration-200 cursor-pointer focus:border-[#f25c88]"
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
                  <label className="text-[12px] font-bold text-zinc-600">Description</label>
                  <div className="relative flex items-start w-full">
                    <FileText className="absolute left-1 top-2.5 w-4 h-4 text-zinc-400" />
                    <textarea
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      rows={4}
                      placeholder="Write a brief overview of this organization..."
                      className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 resize-none focus:border-[#f25c88]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-8 border-t border-zinc-200 mt-4 lg:pl-12">
            <button
              type="button"
              onClick={() => router.push("/dashboard/institutions")}
              className="px-6 py-2.5 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-full text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
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
    </>
  );
}
