"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Sparkles,
  Layers,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@nexushr.corp");
  const [password, setPassword] = useState("Nexus@Admin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        router.push("/");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Invalid credentials or account locked";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email: loginEmail, password: loginPass });
      const userRole = (data.roles && data.roles[0]) ? data.roles[0].replace("ROLE_", "") : (data.role || "ADMIN");
      const displayName = data.name || (loginEmail.split("@")[0].toUpperCase());
      setAuth(data.accessToken, data.refreshToken, {
        email: loginEmail,
        role: userRole,
        name: displayName,
        mustChangePassword: data.mustChangePassword,
      });

      if (data.mustChangePassword) {
        toast("First login detected: Please update your temporary password", { icon: "🔑" });
        router.push("/change-password");
      } else {
        toast.success(`Signed in as ${displayName} (${userRole})`);
        router.push("/");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo@12345");
    executeLogin(demoEmail, "Demo@12345");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-600/15 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md w-full p-7 rounded-3xl relative"
      >
        {/* Brand & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nexus<span className="text-orange-400">HR</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Enterprise Workforce & Operations Intelligence
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
              />
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
              />
              <Key className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Platform"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-1">
            <span className="text-[11px] text-white/50">Need a new organization or self-service access? </span>
            <a href="/register" className="text-[11px] font-semibold text-orange-400 hover:underline">
              Register here
            </a>
          </div>
        </form>

        {/* 1-Click Demo Evaluation Personas per README-1 / README-3 */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
              1-Click Demo Evaluation Personas
            </span>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pre-Seeded
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
            <button
              type="button"
              onClick={() => loginAsDemo("employee@nexushr.demo")}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/5 hover:border-orange-500/30 transition-all text-left flex flex-col"
            >
              <span className="font-bold text-white">Staff (Aditi)</span>
              <span className="text-[9px] text-white/40">Self-service, Clock, Leaves</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo("manager@nexushr.demo")}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/5 hover:border-orange-500/30 transition-all text-left flex flex-col"
            >
              <span className="font-bold text-white">Manager (Vikram)</span>
              <span className="text-[9px] text-white/40">Team Leaves, Reviews</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo("hr@nexushr.demo")}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/5 hover:border-orange-500/30 transition-all text-left flex flex-col"
            >
              <span className="font-bold text-white">HR Admin (Priya)</span>
              <span className="text-[9px] text-white/40">Onboard, Payroll, Policies</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo("sysadmin@nexushr.demo")}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/5 hover:border-orange-500/30 transition-all text-left flex flex-col"
            >
              <span className="font-bold text-white">SysAdmin (Rahul)</span>
              <span className="text-[9px] text-white/40">Users, Audit Hash Chain</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => loginAsDemo("chro@nexushr.demo")}
            className="w-full p-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-white/90 border border-orange-500/20 transition-all flex items-center justify-between text-[10.5px]"
          >
            <div className="text-left">
              <span className="font-bold text-orange-400">Executive CHRO (Ananya)</span>
              <span className="text-[9px] text-white/40 block">Read-only Org Attrition & Strategic Analytics</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
