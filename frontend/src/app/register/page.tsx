"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  User,
  Mail,
  Building,
  Key,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("HR_ADMIN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    // Simulate enterprise tenant provisioning handshake
    setTimeout(() => {
      setLoading(false);
      setRegistered(true);
      toast.success("Enterprise tenant request submitted successfully!");
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-600/15 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-lg w-full p-7 rounded-3xl relative"
      >
        {/* Brand & Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register for Nexus<span className="text-orange-400">HR</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Enterprise Workforce & Tenant Onboarding Portal
          </p>
        </div>

        {registered ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tenant Access Requested</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
                Your enterprise registration for <strong className="text-white">{company || "your organization"}</strong> ({email}) has been queued. In an enterprise HRMS, staff accounts are officially provisioned by HR Admins via the Onboarding Protocol.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                Go to Sign In & Use Demo Personas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditi Sharma"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                  <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@company.corp"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                  <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nexus Technologies Ltd."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                  <Building className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Primary Domain / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                >
                  <option value="HR_ADMIN">HR Administrator / Talent Lead</option>
                  <option value="DEPT_MANAGER">Department Engineering Manager</option>
                  <option value="STAFF">Employee Self-Service</option>
                  <option value="EXECUTIVE">Executive / Board Governance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                  <Key className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                  <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-3"
            >
              {loading ? "Provisioning Tenant..." : "Register Organization & Account"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-white/50">Already have credentials? </span>
              <Link href="/login" className="text-[11px] font-semibold text-orange-400 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
