"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../../components/views/Header";
import { useLms } from "../../../../../context/LmsContext";
import {
  ArrowLeft,
  Building2,
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  Trash2,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../../../../../components/ui/ConfirmModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInstitutionPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { showToast } = useLms();
  
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [statusInput, setStatusInput] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic-parameters");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/institutions/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch institution details");
        const data = await res.json();
        setNameInput(data.name);
        setDescInput(data.description || "");
        setStatusInput(data.subscriptionStatus);
      } catch (err: any) {
        showToast(err.message || "Failed to load institution details", "error");
        router.push("/dashboard/institutions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [id, router]);

  useEffect(() => {
    if (nameInput) {
      document.title = `${nameInput} - VLOATTY Learning Management System`;
    }
  }, [nameInput]);

  useEffect(() => {
    const sections = ["basic-parameters", "danger-zone"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((sid) => {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((sid) => {
        const el = document.getElementById(sid);
        if (el) observer.unobserve(el);
      });
    };
  }, [isLoading]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSubmitting(true);
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: "PUT",
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

      if (!res.ok) throw new Error("Failed to update institution");

      showToast("Institution updated successfully!", "success");
      router.push("/dashboard/institutions");
    } catch (err: any) {
      showToast(err.message || "Failed to update institution", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstitution = async () => {
    setIsDeleting(true);
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
      router.push("/dashboard/institutions");
    } catch (err: any) {
      showToast(err.message || "Failed to delete institution", "error");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const sidebarSections = [
    { id: "basic-parameters", label: "Basic Parameters", icon: Settings },
    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle, isDanger: true },
  ];

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
              Edit Institution Details
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium">
              Update organization name, subscription plan, and customize settings.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center bg-white border border-[#E5E1D8]/60 rounded-3xl p-8">
            <span className="text-[13px] font-bold text-zinc-400">Loading institution details...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
            <div className="lg:col-span-9 flex flex-col gap-24 w-full">
              <form onSubmit={handleUpdate} className="flex flex-col gap-24 w-full">
                <div id="basic-parameters" className="flex flex-col gap-8 w-full mb-16 lg:pl-12 scroll-mt-24">
                  <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <Settings className="w-4.5 h-4.5 text-[#f25c88]" />
                    Basic Parameters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
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
                            className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-medium focus:outline-none transition-colors duration-200 resize-none focus:border-[#f25c88]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-8 border-t border-zinc-200 mt-8 lg:pl-12">
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
                    Save Details
                  </button>
                </div>
              </form>

              <div id="danger-zone" className="flex flex-col gap-8 w-full mb-16 lg:pl-12 mt-12 scroll-mt-24">
                <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2 pb-2 border-b border-zinc-200">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                  Danger Zone
                </h3>

                <div className="flex flex-col gap-4 w-full mt-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-extrabold text-red-600 flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        Delete Institution
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold leading-normal">
                        Deleting this institution is permanent and cannot be undone. All associated users and links will be updated.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-6 py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 hover:text-red-700 font-extrabold rounded-full text-[12px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      Delete Institution
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 sticky top-6 bg-white border border-[#E5E1D8]/60 p-5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.005)] text-left self-start animate-in fade-in duration-300">
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                On This Page
              </span>
              <div className="flex flex-col gap-1.5 w-full">
                {sidebarSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-all text-left w-full group active:scale-[0.98] ${
                        isActive
                          ? sec.isDanger
                            ? "bg-red-50 text-red-600 border-l-2 border-red-500 rounded-l-none"
                            : "bg-[#f25c88]/10 text-[#f25c88] border-l-2 border-[#f25c88] rounded-l-none"
                          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/80"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? sec.isDanger
                              ? "text-red-500"
                              : "text-[#f25c88]"
                            : "text-zinc-400 group-hover:text-zinc-600"
                        }`}
                      />
                      <span className="truncate">{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteInstitution}
        title="Delete Institution"
        message={`Are you sure you want to delete "${nameInput}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeleting}
      />
    </>
  );
}
