"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../components/views/Header";
import { useLms } from "../../../context/LmsContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import InstitutionCard from "../../../components/ui/InstitutionCard";
import ThirtyDaysActivityChart from "../../../components/ui/ThirtyDaysActivityChart";
import { animate, stagger } from "animejs";

export default function InstitutionsPage() {
  const router = useRouter();
  const { showToast, searchQuery, events } = useLms();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchInstitutions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/institutions`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch institutions");
      const data = await res.json();
      console.log("Fetched institutions:", data);
      setInstitutions(data);
    } catch (err: any) {
      console.error(err);
      showToast("Could not load institutions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    animate(".anime-card", {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(120),
      duration: 800,
      easing: "easeOutQuad"
    });
  }, [isLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this institution?")) return;

    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: "DELETE",
        headers: {
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
        }
      });

      if (!res.ok) throw new Error("Failed to delete institution");

      showToast("Institution deleted successfully!", "success");
      fetchInstitutions();
    } catch (err: any) {
      showToast(err.message || "Failed to delete institution", "error");
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="Institutions" subtitle="Organization" />

      <div className="flex-1 overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">
          <div className="anime-card opacity-0 flex justify-end items-center gap-3 w-full mb-1">
            <button
              onClick={() => router.push("/dashboard/institutions/create")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-[11px] cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Institution</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full items-stretch">
            <div className="anime-card opacity-0 lg:col-span-4 w-full flex flex-col">
              {isLoading ? (
                <div className="w-full h-64 flex items-center justify-center bg-white border border-[#E5E1D8]/70 rounded-3xl">
                  <span className="text-[13px] font-semibold text-zinc-400 animate-pulse">Loading institutions list...</span>
                </div>
              ) : filteredInstitutions.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8]/70 rounded-3xl p-6 bg-white/40">
                  <span className="text-[13px] font-semibold text-zinc-400">No institutions found.</span>
                  <button
                    onClick={() => router.push("/dashboard/institutions/create")}
                    className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-[10.5px]"
                  >
                    Register First Institution
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredInstitutions.map((inst) => (
                    <InstitutionCard key={inst.id} inst={inst} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            <div className="anime-card opacity-0 lg:col-span-6 w-full h-full">
              <div className="bg-white border border-[#E5E1D8]/70 rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left h-full min-h-[290px] relative overflow-hidden group">
                <div className="w-full flex-grow min-h-[200px] flex flex-col justify-between h-full">
                  <ThirtyDaysActivityChart events={events} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
