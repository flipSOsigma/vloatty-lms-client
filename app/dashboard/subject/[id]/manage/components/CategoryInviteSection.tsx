"use client";

import React from "react";
import { Sparkles, Tag, Link as LinkIcon, Mail } from "lucide-react";

interface CategoryInviteSectionProps {
  category: string;
  setCategory: (val: string) => void;
  subjectColor: string;
  subjectId: string;
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  invitedEmails: string[];
  setInvitedEmails: React.Dispatch<React.SetStateAction<string[]>>;
  copied: boolean;
  setCopied: (val: boolean) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function CategoryInviteSection({
  category,
  setCategory,
  subjectColor,
  subjectId,
  inviteEmail,
  setInviteEmail,
  invitedEmails,
  setInvitedEmails,
  copied,
  setCopied,
  showToast,
}: CategoryInviteSectionProps) {
  return (
    <div id="category-invite" className="flex flex-col gap-6 w-full mb-16 lg:pl-12 scroll-mt-24">
      <div className="flex flex-col">
        <h3 className="text-[14.5px] font-bold text-[#121212] flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5" style={{ color: subjectColor }} />
          Category &amp; Invite Settings
        </h3>
        <p className="text-[12px] text-zinc-400 font-medium -mt-1 pl-6">
          Adjust the learning module category type and invite students or auditors via custom join links and email notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col gap-5 border-r border-zinc-100/50 pr-0 md:pr-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-zinc-600">Class Category</label>
            <div className="relative flex items-center w-full">
              <Tag className="absolute left-1 w-4 h-4 text-zinc-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[14px] font-semibold focus:outline-none transition-colors duration-200 cursor-pointer"
                onFocus={(e) => {
                  e.target.style.borderColor = subjectColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                }}
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Seminar">Seminar</option>
                <option value="Clinical">Clinical</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-zinc-600 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-zinc-500" />
              Invite via Link
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/dashboard/subject/${subjectId}/join` : ""}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-[13px] bg-[#FAF7F2]/50 text-zinc-500 font-semibold outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const link = typeof window !== "undefined" ? `${window.location.origin}/dashboard/subject/${subjectId}/join` : "";
                  navigator.clipboard.writeText(link);
                  setCopied(true);
                  showToast("Invite link copied to clipboard!", "success");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2.5 bg-[#121212] hover:bg-zinc-800 text-white text-[12px] font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-zinc-600 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-zinc-500" />
              Invite via Email (Mock)
            </span>
            <div className="flex gap-2 w-full">
              <div className="relative flex items-center flex-1">
                <Mail className="absolute left-1 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="academic-email@institution.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-7 pr-1 py-2 bg-transparent border-b border-zinc-200 text-[13px] font-medium focus:outline-none transition-colors duration-200"
                  onFocus={(e) => {
                    e.target.style.borderColor = subjectColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
                    showToast("Please enter a valid email address.", "error");
                    return;
                  }
                  setInvitedEmails((prev) => [...prev, inviteEmail.trim()]);
                  setInviteEmail("");
                  showToast(`Invitation sent to ${inviteEmail}!`, "success");
                }}
                className="px-5 py-2.5 bg-[#f25c88] hover:bg-[#d84b72] text-white text-[12px] font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                Send Invite
              </button>
            </div>

            {invitedEmails.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1.5 bg-[#FAF7F2]/30 border border-[#E5E1D8]/20 p-3 rounded-2xl max-h-[120px] overflow-y-auto no-scrollbar">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                  Invited Members
                </span>
                {invitedEmails.map((email, index) => (
                  <div key={index} className="flex justify-between items-center text-[12px] font-medium text-zinc-600 bg-white border border-[#E5E1D8]/20 px-3 py-1.5 rounded-xl">
                    <span className="truncate">{email}</span>
                    <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
