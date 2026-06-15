"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../components/views/Header";
import { useLms } from "../../../context/LmsContext";
import { Plus, Grid2x2Plus, Grid2x2X } from "lucide-react";
import { useRouter } from "next/navigation";
import InstitutionCard from "../../../components/ui/InstitutionCard";

interface Institution {
  id: string;
  name: string;
  description?: string;
  subscriptionStatus: string;
  users: any[];
  subjects: any[];
}

export default function InstitutionsPage() {
  const router = useRouter();
  const { showToast, searchQuery } = useLms();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cols, setCols] = useState(3);

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

  const getGridColsClass = (colCount: number) => {
    switch (colCount) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-300";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300";
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300 w-full text-left">
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col gap-0.5 text-left">
            <h2 className="text-xl font-black text-zinc-950 tracking-tight">Institutions</h2>
            <span className="text-[11px] font-bold text-zinc-400">Manage SaaS subscriptions and organization structures</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/institutions/create")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Institution</span>
            </button>

            <div className="flex items-center gap-1 bg-white border border-[#E5E1D8]/45 p-1 rounded-xl shadow-sm shrink-0">
              <button
                onClick={() => setCols((prev) => Math.max(2, prev - 1))}
                disabled={cols <= 2}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
              >
                <Grid2x2X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-zinc-500 px-1 select-none">
                {cols}
              </span>
              <button
                onClick={() => setCols((prev) => Math.min(5, prev + 1))}
                disabled={cols >= 5}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 cursor-pointer"
              >
                <Grid2x2Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <span className="text-[13px] font-bold text-zinc-400">Loading institutions list...</span>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E1D8] rounded-3xl p-6 bg-white/10">
            <span className="text-[13px] font-bold text-zinc-400">No institutions found.</span>
            <button
              onClick={() => router.push("/dashboard/institutions/create")}
              className="mt-3 px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[11px]"
            >
              Register First Institution
            </button>
          </div>
        ) : (
          <div className={getGridColsClass(cols)}>
            {filteredInstitutions.map((inst) => (
              <InstitutionCard key={inst.id} inst={inst} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
