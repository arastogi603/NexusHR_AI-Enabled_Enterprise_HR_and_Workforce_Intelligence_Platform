"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Key,
  Bell,
  Check,
  Save,
  Mail,
  Briefcase,
  Building,
  Smartphone,
  Lock,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import LiquidCarveButton from "@/components/ui/LiquidCarveButton";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "Alex Harrison");
  const [email, setEmail] = useState(user?.email || "alex.harrison@nexushr.corp");
  const [role, setRole] = useState(user?.role || "ADMIN");
  const [department, setDepartment] = useState("Platform Systems Architecture");
  const [twoFactorActive, setTwoFactorActive] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Account preferences updated successfully");
    }, 400);
  };

  return (
    <div className="w-full relative space-y-4">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Profile & Settings
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </h1>
          <p className="text-[11px] text-white/40 mt-0.5">
            Manage your personal profile, credentials, and notification preferences.
          </p>
        </div>
      </div>

      {/* Main Grid: 4 Cols Left + 8 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Profile Badge Card */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl text-center space-y-4"
          >
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-orange-500/25">
                {name ? name[0] : "A"}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#121620]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{name}</h2>
              <p className="text-xs text-orange-400 font-medium mt-0.5">{department}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/80 border border-white/10 uppercase tracking-wider">
                {role === "ADMIN" ? "Executive Director" : "Team Member"}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 text-left text-xs">
              <div className="flex justify-between text-white/40">
                <span>Account Security</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High
                </span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Last Sign-In</span>
                <span className="text-white/80 font-mono">Today, 09:12</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Employee ID</span>
                <span className="text-white/80 font-mono">NX-DIR-901</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Profile Form & Preferences */}
        <div className="lg:col-span-8 space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl space-y-5"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-semibold focus:border-orange-500/50 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase mb-1">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-orange-500/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase mb-1">Division</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-semibold focus:border-orange-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase mb-1">Role Title</label>
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/40 text-xs font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Two-Factor Authentication</div>
                    <div className="text-[11px] text-white/40">Protect sign-in with authenticator app</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorActive(!twoFactorActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      twoFactorActive ? "bg-orange-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        twoFactorActive ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Email Digest & Alerts</div>
                    <div className="text-[11px] text-white/40">Receive weekly summaries and leave notifications</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      emailAlerts ? "bg-orange-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        emailAlerts ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <LiquidCarveButton
                  label={saving ? "Saving..." : "Save Preferences"}
                  padding="10px 22px"
                  rounded={12}
                  colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                  blob={{ color: "#FFA055", size: 50, smoothness: 50 }}
                  onClick={handleSave}
                />
              </div>
            </form>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
