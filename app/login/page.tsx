"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLms } from "../../context/LmsContext";
import { Mail, Key, Sparkles, AlertCircle, ArrowRight, Library } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, isLoadingUser } = useLms();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      if (data.jwt?.accessToken) {
        localStorage.setItem("token", data.jwt.accessToken);
      }
      
      if (data.user && setCurrentUser) {
        setCurrentUser(data.user);
      }

      // Success redirect
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login server error, attempting local mock login fallback:", err);
      
      // Fallback: Validate against mock credentials
      if (email === "turing.y@vloatty.edu" && password === "password123") {
        try {
          const fallbackRes = await fetch("/data/user.json");
          const fallbackData = await fallbackRes.json();
          
          if (fallbackData.jwt?.accessToken) {
            localStorage.setItem("token", fallbackData.jwt.accessToken);
          }
          if (fallbackData.user && setCurrentUser) {
            setCurrentUser(fallbackData.user);
          }
          router.push("/dashboard");
        } catch (fallbackErr) {
          setError("Offline fallback failed. Please check backend connection.");
        }
      } else {
        setError(err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail("turing.y@vloatty.edu");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden select-none">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#f25c88]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#f25c88]/5 blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-[460px] bg-white border border-[#EFECE6]/80 rounded-[32px] p-6 md:p-10 shadow-sm relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#f25c88]/10 flex items-center justify-center mb-3">
            <Library className="w-6 h-6 text-[#f25c88]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#121212] tracking-tight">
            Vloatty LMS
          </h1>
          <p className="text-[12px] text-zinc-400 font-semibold mt-1">
            Learning Management System Client Portal
          </p>
        </div>

        {/* Quick Demo Info Box */}
        <div 
          onClick={handleQuickLogin}
          className="mb-6 p-4 bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl cursor-pointer hover:border-[#f25c88]/30 group transition-all duration-200 active:scale-98"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-[#f25c88] font-extrabold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Login (Click here)
          </div>
          <div className="text-[12px] text-zinc-500 font-medium group-hover:text-zinc-700 transition-colors">
            Email: <span className="font-bold text-[#121212]">turing.y@vloatty.edu</span>
            <br />
            Password: <span className="font-bold text-[#121212]">password123</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-[12px] text-red-600 font-semibold">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-extrabold text-[#121212] uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your academic email"
                className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#EFECE6] focus:border-[#f25c88]/50 focus:bg-white rounded-2xl text-[13px] text-[#121212] font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[11px] font-extrabold text-[#121212] uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#EFECE6] focus:border-[#f25c88]/50 focus:bg-white rounded-2xl text-[13px] text-[#121212] font-semibold outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 bg-[#121212] text-white hover:bg-zinc-800 disabled:bg-zinc-300 rounded-full text-[13px] font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 select-none"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6 text-[12px] font-semibold text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#f25c88] hover:underline">
            Sign Up
          </Link>
        </div>

        <p className="text-[11px] text-zinc-400 font-semibold mt-8 text-center">
          Protected portal. Managed credentials required.
        </p>

      </div>
    </div>
  );
}
