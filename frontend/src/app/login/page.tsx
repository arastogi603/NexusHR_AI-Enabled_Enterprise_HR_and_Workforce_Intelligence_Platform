"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const userRole = (data.roles && data.roles[0]) ? data.roles[0].replace("ROLE_", "") : (data.role || "ADMIN");
      const displayName = data.name || (email.split("@")[0].toUpperCase());
      setAuth(data.accessToken, data.refreshToken, {
        email,
        role: userRole,
        name: displayName,
        mustChangePassword: data.mustChangePassword,
      });

      if (data.mustChangePassword) {
        toast("First login detected: Please update your temporary password", { icon: "🔑" });
        router.push("/change-password");
      } else {
        toast.success(`Welcome back, ${displayName}!`);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Invalid email or password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative font-sans">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card max-w-md w-full p-8 rounded-3xl relative border border-white/10 shadow-2xl backdrop-blur-xl"
      >
        {/* Brand & Header */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-4"
          >
            <Layers className="w-7 h-7" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nexus<span className="text-orange-400">HR</span>
          </h1>
          <p className="text-xs text-white/60 mt-1.5 font-normal">
            Enterprise Workforce & Operations Intelligence
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Clean Enterprise Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hr@nexushr.demo"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Password
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Contact your IT / HR Administrator to reset corporate credentials.", { icon: "🔒" });
                }}
                className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
              <Key className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Remember me</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 256-bit Encrypted</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Platform"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-3 border-t border-white/10 mt-5">
            <span className="text-[11px] text-white/50">Need a new organization workspace? </span>
            <Link href="/register" className="text-[11px] font-semibold text-orange-400 hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-white/50">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
