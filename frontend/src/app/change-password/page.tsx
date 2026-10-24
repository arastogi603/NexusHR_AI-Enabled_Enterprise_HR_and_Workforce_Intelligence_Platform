"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { KeyRound, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 10) {
      toast.error("New password must be at least 10 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });

      updateUser({ mustChangePassword: false });
      toast.success("Password successfully changed! Session secured.");
      router.push("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
        className="glass-card max-w-md w-full p-7 rounded-3xl relative"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Update Security Credentials
          </h1>
          <p className="text-xs text-white/50 mt-1">
            {user?.mustChangePassword
              ? "First-time authentication detected. You must establish a secure personal password."
              : "Update your NexusHR account password."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
              Current (Provisional) Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
              />
              <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
              New Password <span className="text-white/40 font-normal">(Min. 10 chars)</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
              />
              <KeyRound className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
              />
              <CheckCircle2 className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? "Hide Passwords" : "Show Passwords"}</span>
            </button>
            <span className="font-mono text-[10px]">Argon2id Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Securing Credentials..." : "Confirm & Update Password"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {!user?.mustChangePassword && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-[11px] text-white/40 hover:text-white transition-colors"
              >
                Cancel and return to Dashboard
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
