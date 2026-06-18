"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLms } from "../../context/LmsContext";
import { Mail, Key, User, Building, AlertCircle, ArrowRight, Library } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, isLoadingUser, showToast } = useLms();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, isLoadingUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          institution,
          premiumStatus: "free",
          avatar: ""
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.jwt?.accessToken) {
        localStorage.setItem("token", data.jwt.accessToken);
      }

      if (data.user && setCurrentUser) {
        setCurrentUser(data.user);
      }

      showToast("Account created successfully!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden select-none">
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#facc15]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#facc15]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[460px] bg-white border border-[#E5E1D8]/70 rounded-3xl p-6 md:p-10 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.02)] relative z-10 transition-all duration-300">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15]/10 flex items-center justify-center mb-3">
            <Library className="w-6 h-6 text-[#d97706]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#121212] tracking-tight">
            Create Account
          </h1>
          <p className="text-[12px] text-zinc-400 font-semibold mt-1">
            Join the Vloatty LMS Platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-[11px] text-red-600 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider pl-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 focus:bg-white rounded-xl text-[13px] text-zinc-800 font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your academic email"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 focus:bg-white rounded-xl text-[13px] text-zinc-800 font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider pl-1">
              Institution
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University or College name"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 focus:bg-white rounded-xl text-[13px] text-zinc-800 font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-[#E5E1D8]/70 focus:border-[#f97316]/50 focus:bg-white rounded-xl text-[13px] text-zinc-800 font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 bg-zinc-800 text-white hover:bg-zinc-700 disabled:bg-zinc-300 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 select-none"
          >
            {loading ? "Creating account..." : "Sign Up"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6 text-[11px] font-semibold text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#d97706] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
