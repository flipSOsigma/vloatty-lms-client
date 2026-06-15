"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../../../components/views/Header";
import { useLms } from "../../../../../context/LmsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../../../../../components/ui/ConfirmModal";
import ImageCropModal from "../../../../../components/ui/ImageCropModal";
import {
  ArrowLeft,
  Check,
  Settings,
  BookOpen,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";

import BasicParametersSection from "./components/BasicParametersSection";
import ClassesLinkedSection from "./components/ClassesLinkedSection";
import UserPermissionsSection, { UserPermission } from "./components/UserPermissionsSection";
import OrganizeFilesSection, { InstitutionFile } from "./components/OrganizeFilesSection";
import DangerZoneSection from "./components/DangerZoneSection";
import LinkClassModal from "./components/LinkClassModal";
import UnsavedChangesModal from "./components/UnsavedChangesModal";
import { Subject } from "../../../../../types/subject";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageInstitutionPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { subjects, currentUser, updateSubject, showToast } = useLms();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [statusInput, setStatusInput] = useState("free");
  const [thumbnailInput, setThumbnailInput] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [activeSection, setActiveSection] = useState("basic-parameters");
  const [isUploading, setIsUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("");

  const [linkedSubjects, setLinkedSubjects] = useState<Subject[]>([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState("");

  const [usersPermissions, setUsersPermissions] = useState<UserPermission[]>([]);

  const [files, setFiles] = useState<InstitutionFile[]>([
    {
      id: "f1",
      name: "institution_handbook.pdf",
      size: "2.4 MB",
      uploadedAt: "2026-06-12",
      uploadedBy: "Turing Yeager",
      uploaderRole: "Owner",
      downloads: 142,
      category: "Policy",
    },
    {
      id: "f2",
      name: "syllabus_template.docx",
      size: "1.1 MB",
      uploadedAt: "2026-06-14",
      uploadedBy: "Sarah Connor",
      uploaderRole: "Admission",
      downloads: 89,
      category: "Academic",
    },
    {
      id: "f3",
      name: "campus_map.png",
      size: "4.8 MB",
      uploadedAt: "2026-06-15",
      uploadedBy: "Turing Yeager",
      uploaderRole: "Owner",
      downloads: 231,
      category: "General",
    },
  ]);

  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      document.title = `${initialData.name} - VLOATTY Learning Management System`;
    }
  }, [initialData]);

  const hasChanges = React.useMemo(() => {
    if (isSaving || isDeleting || !initialData) return false;

    if (nameInput !== initialData.name) return true;
    if (descInput !== (initialData.description || "")) return true;
    if (statusInput !== initialData.subscriptionStatus) return true;
    if (thumbnailInput !== (initialData.thumbnail || "")) return true;

    const origLinkedIds = subjects
      .filter((s) => s.institutionId === id)
      .map((s) => s.id)
      .sort();
    const currentLinkedIds = linkedSubjects.map((s) => s.id).sort();

    if (origLinkedIds.length !== currentLinkedIds.length) return true;
    for (let i = 0; i < origLinkedIds.length; i++) {
      if (origLinkedIds[i] !== currentLinkedIds[i]) return true;
    }

    const origUsers = initialData.users || [];
    if (usersPermissions.length !== origUsers.length) return true;
    for (let i = 0; i < usersPermissions.length; i++) {
      const origMatch = origUsers.find((ou: any) => ou.id === usersPermissions[i].id);
      if (!origMatch) return true;
      if ((origMatch.institutionRole || "lecturer") !== usersPermissions[i].role) return true;
    }

    return false;
  }, [
    initialData,
    nameInput,
    descInput,
    statusInput,
    thumbnailInput,
    linkedSubjects,
    usersPermissions,
    subjects,
    isSaving,
    isDeleting,
  ]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchInstitutionDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load institution details");
      const data = await res.json();
      setNameInput(data.name);
      setDescInput(data.description || "");
      setStatusInput(data.subscriptionStatus);
      setThumbnailInput(data.thumbnail || "");
      setInitialData(data);

      if (data.users) {
        setUsersPermissions(data.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.institutionRole || "lecturer",
          avatar: u.avatar || "",
          department: u.institutionRole === "owner" ? "Administration" : "Academic Staff",
          permissions: u.institutionRole === "owner" ? "All Access" : u.institutionRole === "admission" ? "Admission Access" : "Lecturer Access",
          status: "Active"
        })));
      }

      const token = localStorage.getItem("token");
      const codeRes = await fetch(`${API_BASE_URL}/institutions/${id}/invite`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setInviteCode(codeData.inviteCode);
      }
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

  useEffect(() => {
    setLinkedSubjects(subjects.filter((s) => s.institutionId === id));
  }, [subjects, id]);

  const isOwner = React.useMemo(() => {
    if (!currentUser || usersPermissions.length === 0) return false;
    const me = usersPermissions.find((u) => u.id === currentUser.id);
    return me?.role === "owner";
  }, [currentUser, usersPermissions]);

  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!hasChanges) return;
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href) {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(target.href, window.location.href);
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          setPendingUrl(target.href);
          setIsUnsavedModalOpen(true);
        }
      }
    };
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [hasChanges]);

  useEffect(() => {
    const sections = ["basic-parameters", "classes-linked", "user-permissions", "organize-files", "danger-zone"];
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

  const sidebarSections = [
    { id: "basic-parameters", label: "Basic Parameters", icon: Settings },
    { id: "classes-linked", label: "Classes Linked", icon: BookOpen },
    { id: "user-permissions", label: "User Permissions", icon: Users },
    { id: "organize-files", label: "Organize Files", icon: FileText },
    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle, isDanger: true },
  ];

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setCropImageSrc(null);
    const file = new File([croppedImageBlob], cropFileName || "logo.jpg", { type: "image/jpeg" });
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/upload?institutionId=${id}`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newUrl: string = data.url || "";
      setThumbnailInput(newUrl);

      const saveRes = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ thumbnail: newUrl }),
      });
      if (saveRes.ok) {
        const saved = await saveRes.json();
        setInitialData((prev: any) => ({ ...prev, thumbnail: saved.thumbnail }));
      }

      showToast("Profile picture updated successfully!", "success");
    } catch (err) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const saveAndNavigate = async (destinationUrl?: string) => {
    if (!nameInput.trim()) {
      showToast("Institution name is required.", "error");
      return false;
    }

    setIsSaving(true);
    try {
      const currentToken = localStorage.getItem("token");
      const instRes = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify({
          name: nameInput.trim(),
          description: descInput.trim(),
          subscriptionStatus: statusInput,
          thumbnail: thumbnailInput,
        }),
      });

      if (!instRes.ok) throw new Error("Failed to update institution");

      const originalUsers = initialData.users || [];
      const currentUsersMap = new Map(usersPermissions.map((u) => [u.id, u]));

      const toRemove = originalUsers.filter((u: any) => !currentUsersMap.has(u.id));
      for (const u of toRemove) {
        await fetch(`${API_BASE_URL}/institutions/${id}/users/${u.id}`, {
          method: "DELETE",
          headers: {
            ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
          },
        });
      }

      for (const u of usersPermissions) {
        const orig = originalUsers.find((ou: any) => ou.id === u.id);
        if (orig && (orig.institutionRole || "lecturer") !== u.role) {
          await fetch(`${API_BASE_URL}/institutions/${id}/users/${u.id}/role`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
            },
            body: JSON.stringify({ role: u.role }),
          });
        }
      }

      const originalLinked = subjects.filter((s) => s.institutionId === id);
      const currentLinkedIds = new Set(linkedSubjects.map((s) => s.id));

      const toUnlink = originalLinked.filter((s) => !currentLinkedIds.has(s.id));
      for (const s of toUnlink) {
        await updateSubject({ ...s, institutionId: null });
      }

      const originalLinkedIds = new Set(originalLinked.map((s) => s.id));
      const toLink = linkedSubjects.filter((s) => !originalLinkedIds.has(s.id));
      for (const s of toLink) {
        await updateSubject({ ...s, institutionId: id });
      }

      showToast("Institution details updated successfully!", "success");
      router.push(destinationUrl || `/dashboard/institutions/${id}`);
      return true;
    } catch (err: any) {
      showToast(err.message || "Failed to save details", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    saveAndNavigate();
  };

  const handleDeleteInstitution = async () => {
    setIsDeleting(true);
    try {
      const currentToken = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: "DELETE",
        headers: {
          ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {}),
        },
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

  const availableSubjects = subjects.filter((s) => {
    const isAlreadyLinked = linkedSubjects.some((ls) => ls.id === s.id);
    if (isAlreadyLinked) return false;

    const q = classSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.room && s.room.toLowerCase().includes(q))
    );
  });

  const hexToRgba = (hex: string, opacity: number) => {
    try {
      let c = hex.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (e) {
      return hex;
    }
  };

  return (
    <>
      <Header />

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4 flex flex-col gap-6 text-left select-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/institutions/${id}`}
            className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center text-zinc-600 hover:bg-white hover:border-zinc-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
              Manage Institution
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium -mt-1">
              Update organization identity, custom profile picture, linked classes, and subscription level.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center bg-white border border-[#E5E1D8]/60 rounded-3xl p-8">
            <span className="text-[13px] font-bold text-zinc-400">Loading details...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
            <div className="lg:col-span-9 flex flex-col gap-24 w-full lg:pr-20">
              <form onSubmit={handleSaveDetails} className="flex flex-col gap-24 w-full">
                <BasicParametersSection
                  nameInput={nameInput}
                  setNameInput={setNameInput}
                  descInput={descInput}
                  setDescInput={setDescInput}
                  thumbnailInput={thumbnailInput}
                  setThumbnailInput={setThumbnailInput}
                  isUploading={isUploading}
                  setCropFileName={setCropFileName}
                  setCropImageSrc={setCropImageSrc}
                  showToast={showToast}
                />

                <ClassesLinkedSection
                  linkedSubjects={linkedSubjects}
                  setLinkedSubjects={setLinkedSubjects}
                  setIsClassModalOpen={setIsClassModalOpen}
                  setClassSearchQuery={setClassSearchQuery}
                  hexToRgba={hexToRgba}
                  showToast={showToast}
                />

                <UserPermissionsSection
                  usersPermissions={usersPermissions}
                  setUsersPermissions={setUsersPermissions}
                  showToast={showToast}
                  inviteCode={inviteCode}
                  isOwner={isOwner}
                  institutionId={id}
                />

                <OrganizeFilesSection
                  files={files}
                  setFiles={setFiles}
                  currentUser={currentUser}
                  showToast={showToast}
                />

                <div className="flex items-center gap-3 justify-end pt-8 border-t border-zinc-200 mt-8 pl-12">
                  <Link
                    href={`/dashboard/institutions/${id}`}
                    className="px-6 py-2.5 border border-zinc-200 text-zinc-700 hover:text-[#121212] hover:border-zinc-400 font-bold rounded-full text-[12px] bg-white hover:bg-[#FAF9F5] transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-full text-[12px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Details
                  </button>
                </div>
              </form>

              <DangerZoneSection
                statusInput={statusInput}
                setStatusInput={setStatusInput}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                showToast={showToast}
              />
            </div>

            <div className="lg:col-span-3 hidden lg:flex flex-col gap-5 sticky top-6 text-left self-start pl-6">
              {thumbnailInput && thumbnailInput.trim().length > 0 && (
                <div className="w-24 h-24 rounded-full overflow-hidden border border-[#E5E1D8]/60 shadow-sm shrink-0 mb-2">
                  <img
                    src={thumbnailInput}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider px-3">
                On This Page
              </span>
              <div className="flex flex-col gap-1 w-full">
                {sidebarSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all text-left w-full group active:scale-[0.98] ${
                        isActive
                          ? sec.isDanger
                            ? "bg-red-50 text-red-600 border-l-2 border-red-500 rounded-l-none -ml-[25px] pl-[23px]"
                            : "bg-[#f25c88]/5 text-[#f25c88] border-l-2 border-[#f25c88] rounded-l-none -ml-[25px] pl-[23px]"
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

      <LinkClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassSearchQuery("");
        }}
        classSearchQuery={classSearchQuery}
        setClassSearchQuery={setClassSearchQuery}
        availableSubjects={availableSubjects}
        onLinkClass={(sub) => {
          setLinkedSubjects((prev) => [...prev, sub]);
          setIsClassModalOpen(false);
          setClassSearchQuery("");
        }}
      />

      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => {
          setIsUnsavedModalOpen(false);
          setPendingUrl(null);
        }}
        isSaving={isSaving}
        onSave={async () => {
          if (pendingUrl) {
            const saved = await saveAndNavigate(pendingUrl);
            if (saved) {
              setIsUnsavedModalOpen(false);
            }
          }
        }}
        onDecline={() => {
          setIsUnsavedModalOpen(false);
          if (pendingUrl) {
            router.push(pendingUrl);
          }
        }}
      />

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          aspect={1}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </>
  );
}
