"use client";

import React, { useState, useEffect } from "react";
import Header from "../../../components/views/Header";
import Link from "next/link";
import { useLms } from "../../../context/LmsContext";
import ImageCropModal from "../../../components/ui/ImageCropModal";
import {
  User,
  Mail,
  Building,
  Award,
  ArrowLeft,
  Camera,
  Loader2,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  premiumStatus: "free" | "premium" | "professional";
  institution: string;
  avatar: string;
  banner?: string | null;
}

export default function ProfilePage() {
  const { currentUser, setCurrentUser, showToast } = useLms();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form edit states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [premiumStatus, setPremiumStatus] = useState<"free" | "premium" | "professional">("free");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Image upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Image cropping states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner" | null>(null);
  const [cropFileName, setCropFileName] = useState("");

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Sync profile form fields with LmsContext user state
  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
      setName(currentUser.name);
      setEmail(currentUser.email);
      setInstitution(currentUser.institution || "");
      setPremiumStatus(currentUser.premiumStatus);
      setAvatar(currentUser.avatar || "");
      setBanner(currentUser.banner || null);
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const response = await fetch(`${API_BASE_URL}/users/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          email,
          institution,
          premiumStatus,
          avatar,
          banner,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save profile on server");
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }
      
      setSaveSuccess(true);
      if (showToast) {
        showToast("Profile settings updated successfully!", "success");
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile details:", err);
      if (showToast) {
        showToast("Failed to save profile changes", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onFileSelect = (type: "avatar" | "banner") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFileName(file.name);
    setCropType(type);
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!profile || !cropType) return;
    const isAvatar = cropType === "avatar";
    const fileName = cropFileName || (isAvatar ? "avatar.jpg" : "banner.jpg");
    const file = new File([croppedImageBlob], fileName, { type: "image/jpeg" });

    // Reset crop modal state immediately
    setCropImageSrc(null);
    setCropType(null);

    if (isAvatar) {
      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/upload?userId=${profile.id}&type=avatar`, {
          method: "POST",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Avatar upload failed");
        }
        const data = await res.json();
        if (!data.url) throw new Error("Server returned an empty upload URL");
        setAvatar(data.url);
        if (showToast) {
          showToast("Avatar image uploaded!", "success");
        }
      } catch (err: any) {
        console.error(err);
        if (showToast) {
          showToast(`Failed: ${err.message || err}`, "error");
        }
      } finally {
        setIsUploadingAvatar(false);
      }
    } else {
      setIsUploadingBanner(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/upload?userId=${profile.id}&type=banner`, {
          method: "POST",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Banner upload failed");
        }
        const data = await res.json();
        if (!data.url) throw new Error("Server returned an empty upload URL");
        setBanner(data.url);
        if (showToast) {
          showToast("Banner image uploaded!", "success");
        }
      } catch (err: any) {
        console.error(err);
        if (showToast) {
          showToast(`Failed: ${err.message || err}`, "error");
        }
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 text-left">
        <Header />
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#EFECE6]/70 rounded-3xl p-6 bg-white/10 select-none">
          <span className="text-[14px] text-zinc-400 font-semibold animate-pulse">Loading profile settings...</span>
        </div>
      </div>
    );
  }

  // Premium status styling
  const premiumConfig = {
    free: {
      label: "Free Plan",
      color: "bg-zinc-200/10 text-zinc-700 border-zinc-300/30",
      accent: "text-zinc-600",
      bgLight: "bg-zinc-100/30",
    },
    premium: {
      label: "Premium",
      color: "bg-[#facc15]/10 text-[#d97706] border-[#f97316]/20",
      accent: "text-[#d97706]",
      bgLight: "bg-[#facc15]/5",
    },
    professional: {
      label: "Professional",
      color: "bg-amber-150/10 text-amber-800 border-amber-200/20",
      accent: "text-amber-700",
      bgLight: "bg-amber-50/40",
    },
  }[profile.premiumStatus];

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden">
      {/* Header Panel */}
      <Header />

      {/* Main scrollable container matching ref.jpg layout (borderless, blending with background, hides scrollbar) */}
      <div className="px-2 md:px-4 flex flex-col gap-6 w-full flex-grow overflow-y-auto no-scrollbar pb-8">
        
        {/* Navigation row */}
        <div className="flex items-center justify-between mt-1 text-left">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E1D8] rounded-xl hover:bg-zinc-100 font-bold text-[12px] text-zinc-700 cursor-pointer transition-colors shadow-xs bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            User Settings
          </span>
        </div>

        {/* Full-width Banner Container */}
        <div className="h-44 bg-gradient-to-r from-sky-100 via-blue-50 to-emerald-50/50 w-full rounded-[24px] relative shadow-xs overflow-hidden group shrink-0">
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-sky-100 via-blue-50 to-emerald-50/50"></div>
          )}
          
          {/* Banner Change Hover Overlay */}
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white font-bold text-[12px] cursor-pointer transition-opacity duration-200">
            {isUploadingBanner ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading Banner...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Change Banner Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect("banner")}
              disabled={isUploadingBanner}
              className="hidden"
            />
          </label>
        </div>

        {/* Overlapping Avatar and Identity details stacked below */}
        <div className="pb-4 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4 px-2 md:px-4 border-b border-[#EFECE6]/50">
          <div className="-mt-14 flex flex-col items-start gap-4">
            {/* Avatar Upload Container */}
            <div className="relative group rounded-full overflow-hidden w-20 h-20 border-4 border-[#FAF7F2] shadow-md bg-white">
              {avatar ? (
                <img
                  src={avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover animate-in zoom-in-75 duration-200"
                />
              ) : (
                <div className="w-full h-full bg-[#121212] text-white flex items-center justify-center font-bold text-3xl">
                  {getInitials(profile.name)}
                </div>
              )}
              
              {/* Avatar Change Hover Overlay */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200">
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileSelect("avatar")}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Name & Email (stacked directly below the avatar) */}
            <div className="flex flex-col gap-1 text-left pb-1">
              <h2 className="text-[22px] font-black text-[#121212] tracking-tight flex items-center gap-1.5 leading-none">
                {profile.name}
                <span 
                  className="inline-flex items-center justify-center w-4 h-4 bg-sky-500 rounded-full text-white text-[9px] font-bold select-none cursor-help shadow-xs" 
                  title="Verified Academic Account"
                >
                  ✓
                </span>
              </h2>
              <span className="text-[12.5px] text-zinc-550 font-semibold leading-none mt-1">
                {profile.email}
              </span>
            </div>
          </div>

          {/* Right side status badge */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-3.5 py-1.5 rounded-xl border ${premiumConfig.color}`}
            >
              <Award className="w-3.5 h-3.5" />
              {premiumConfig.label}
            </span>
          </div>
        </div>

        {/* Tab View Panels (No tabs selector row, only Personal Details directly rendered) */}
        <div className="w-full mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-4 items-start">
            
            {/* Form details section (no-card styling: background transparent, no border/shadow) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h3 className="text-[16px] font-black text-zinc-950">
                  Personal Details
                </h3>
                <p className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">
                  Manage your display name, institution configurations, and membership plan.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1">
                      Display Name
                    </label>
                    <div className="flex items-center bg-[#FAF7F2] border border-[#E5E1D8] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-1 focus-within:ring-zinc-800/10 focus-within:border-zinc-800 transition-all">
                      <User className="w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-transparent border-none outline-none text-[13px] text-zinc-800 font-bold w-full"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1">
                      Email Address
                    </label>
                    <div className="flex items-center bg-[#FAF7F2] border border-[#E5E1D8] rounded-2xl px-3.5 py-2.5 gap-2.5 opacity-70">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="bg-transparent border-none outline-none text-[13px] text-zinc-555 font-bold w-full cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Institution field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1">
                      Institution Name
                    </label>
                    <div className="flex items-center bg-[#FAF7F2] border border-[#E5E1D8] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-1 focus-within:ring-zinc-800/10 focus-within:border-zinc-800 transition-all">
                      <Building className="w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="E.g. Vloatty University"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] text-zinc-800 font-bold w-full placeholder-zinc-300"
                      />
                    </div>
                  </div>

                  {/* Premium Status Plan Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1">
                      Membership Plan
                    </label>
                    <div className="flex items-center bg-[#FAF7F2] border border-[#E5E1D8] rounded-2xl px-3.5 py-2 gap-2">
                      <Award className="w-4 h-4 text-zinc-400 pl-1" />
                      <select
                        value={premiumStatus}
                        onChange={(e) => setPremiumStatus(e.target.value as any)}
                        className="bg-transparent border-none outline-none text-[13px] text-zinc-800 font-bold w-full py-1 cursor-pointer"
                      >
                        <option value="free">Free Plan</option>
                        <option value="premium">Premium Plan</option>
                        <option value="professional">Professional Plan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#EFECE6]/50">
                  {saveSuccess && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                      ✓ Settings updated successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-xl text-[12.5px] cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSaving ? "Saving changes..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Quick Info card (no-card styling) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div>
                <h3 className="text-[16px] font-black text-zinc-950">
                  Quick Status
                </h3>
                <p className="text-[11.5px] text-zinc-400 font-semibold mt-0.5">
                  Your current configurations on the portal.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-[12px] bg-[#FAF7F2] border border-[#EFECE6] p-3.5 rounded-2xl">
                  <span className="font-semibold text-zinc-450">Institution</span>
                  <span className="font-bold text-zinc-800">
                    {profile.institution || "Not Configured"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[12px] bg-[#FAF7F2] border border-[#EFECE6] p-3.5 rounded-2xl">
                  <span className="font-semibold text-zinc-450">Security Mode</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Replicated JWT
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {cropImageSrc && cropType && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          aspect={cropType === "avatar" ? 1 : 16 / 5}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImageSrc(null);
            setCropType(null);
          }}
        />
      )}
    </div>
  );
}
