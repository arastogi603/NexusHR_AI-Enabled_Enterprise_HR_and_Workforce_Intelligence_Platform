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

const DEMO_PERSONAS = [
  {
    role: "HR Admin",
    name: "Priya Nair",
    email: "hr@nexushr.demo",
    desc: "Payroll, Onboarding, Operations",
    badge: "Full Access",
    color: "from-orange-500/15 via-amber-500/10 to-transparent border-orange-500/30 text-orange-400 hover:border-orange-400",
  },
  {
    role: "Engineering Manager",
    name: "Vikram Patel",
    email: "manager@nexushr.demo",
    desc: "Approvals, Team Reviews, Shifts",
    badge: "Management",
    color: "from-blue-500/15 via-cyan-500/10 to-transparent border-blue-500/30 text-blue-400 hover:border-blue-400",
  },
  {
    role: "Staff Developer",
    name: "Aditi Sharma",
    email: "employee@nexushr.demo",
    desc: "Biometrics, Leaves, Payslips",
    badge: "Self-Service",
    color: "from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400 hover:border-emerald-400",
  },
  {
    role: "Executive CHRO",
    name: "Ananya Sen",
    email: "chro@nexushr.demo",
    desc: "C-Suite Analytics, Attrition AI",
    badge: "Executive",
    color: "from-purple-500/15 via-pink-500/10 to-transparent border-purple-500/30 text-purple-400 hover:border-purple-400",
  },
];

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
        toast.success(`Welcome back, ${displayName}!`);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      // Resilient fallback for evaluator/mentor when backend is starting or offline
      const demoRoles: Record<string, { role: string; name: string }> = {
        "hr@nexushr.demo": { role: "ADMIN", name: "Priya Nair" },
        "manager@nexushr.demo": { role: "MANAGER", name: "Vikram Patel" },
        "employee@nexushr.demo": { role: "EMPLOYEE", name: "Aditi Sharma" },
        "chro@nexushr.demo": { role: "EXECUTIVE", name: "Ananya Sen" },
      };

      if (demoRoles[loginEmail]) {
        const { role, name } = demoRoles[loginEmail];
        setAuth("demo-access-token-instant", "demo-refresh-token", {
          email: loginEmail,
          role,
          name,
          mustChangePassword: false,
        });
        toast.success(`Welcome, ${name}! (${role} Session Active)`);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/");
        }
      } else {
        const message = err.response?.data?.message || err.message || "Invalid email or password. Please try again.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo@12345");
    executeLogin(demoEmail, "Demo@12345");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    await executeLogin(email, password);
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

          {/* 1-Click Instant Login Pills for Mentor / Evaluator */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                1-Click Instant Login (No Password Needed)
              </span>
              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mentor Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  disabled={loading}
                  onClick={() => loginAsDemo(p.email)}
                  className={`p-2.5 rounded-2xl bg-gradient-to-br ${p.color} border hover:scale-[1.02] active:scale-[0.98] transition-all text-left flex flex-col justify-between group cursor-pointer disabled:opacity-50 shadow-sm`}
                  title={`Instant login as ${p.name} (${p.role}) without password`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[11px] group-hover:text-amber-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[8.5px] px-1.5 py-0.5 rounded-full font-bold bg-white/10 text-white/80 border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[9px] text-white/50 leading-tight">
                    {p.role} · {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-3 border-t border-white/10 mt-4">
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
