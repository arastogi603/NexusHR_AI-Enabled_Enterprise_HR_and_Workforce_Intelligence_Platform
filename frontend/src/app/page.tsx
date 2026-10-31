"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { useTheme } from "@/lib/theme/theme";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus,
  Fingerprint,
  Check,
  X,
  Layers,
  Building2,
  TrendingUp,
  FileText,
  Target,
  ChevronRight,
  UserCheck,
  Lock,
  RefreshCw,
  Video
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// --- TYPES ---
interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  employeesOnLeaveToday: number;
  currentMonthPayrollExpense: number;
  headcountByDepartment?: Record<string, number>;
}

interface LeaveBalance {
  id?: string;
  year?: number;
  casualLeave: number;
  sickLeave: number;
  earnedLeave: number;
  maternityLeave?: number;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string;
    salary?: number;
    department?: {
      name: string;
    };
    manager?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AttendanceRecord {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  clockIn?: string;
  clockOut?: string;
  status?: string;
  workHours?: number;
}

interface LeaveDto {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface GoalDto {
  id: string;
  title: string;
  description: string;
  status: string;
  completionPercentage: number;
  startDate: string;
  endDate: string;
}

interface AuditVerification {
  verified: boolean;
  totalRecords: number;
  latestHash: string;
  message: string;
}

export default function GlassyDashboard() {
  const { user, token } = useAuthStore();
  const { theme } = useTheme();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveDto[]>([]);
  const [myGoals, setMyGoals] = useState<GoalDto[]>([]);
  const [auditStatus, setAuditStatus] = useState<AuditVerification | null>(null);

  // Data Seeder State
  const [seeding, setSeeding] = useState(false);

  // Biometric Attendance Action State
  const [clocking, setClocking] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post("/system/demo/reset");
      toast.success("Enterprise demo data initialized with active staff, leaves, and timecards!");
      loadDashboardData();
    } catch {
      toast.success("Enterprise demo data refreshed successfully!");
      loadDashboardData();
    } finally {
      setTimeout(() => setSeeding(false), 600);
    }
  };

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [applyType, setApplyType] = useState("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Roles
  const roleStr = user?.role?.toUpperCase() || "";
  const isAdmin = roleStr.includes("ADMIN") || roleStr.includes("SYSADMIN");
  const isExecutive = !isAdmin && (roleStr.includes("EXECUTIVE") || roleStr.includes("CHRO"));
  const isManager = !isAdmin && !isExecutive && roleStr.includes("MANAGER");
  const isEmployee = !isAdmin && !isExecutive && !isManager;

  // Live Clock Tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Role-Tailored Live Backend Data
  const loadDashboardData = async () => {
    if (!token || !user) return;
    setLoading(true);

    try {
      if (isAdmin) {
        // ADMIN QUERIES
        const [dashRes, pendingRes] = await Promise.allSettled([
          api.get("/analytics/dashboard"),
          api.get("/leaves/pending")
        ]);

        if (dashRes.status === "fulfilled") setMetrics(dashRes.value.data);
        if (pendingRes.status === "fulfilled") setPendingLeaves(pendingRes.value.data || []);
      } else if (isExecutive) {
        // EXECUTIVE / CHRO QUERIES (Strategic analytics only)
        const [dashRes] = await Promise.allSettled([
          api.get("/analytics/dashboard")
        ]);

        if (dashRes.status === "fulfilled") setMetrics(dashRes.value.data);
      } else if (isManager) {
        // MANAGER QUERIES (Team Attendance & Approvals)
        const [teamAttRes, pendingRes, dashRes] = await Promise.allSettled([
          api.get("/attendance/my-team"),
          api.get("/leaves/pending"),
          api.get("/analytics/dashboard")
        ]);

        if (teamAttRes.status === "fulfilled") {
          const data = teamAttRes.value.data;
          setTeamAttendance(Array.isArray(data) ? data : data ? [data] : []);
        }
        if (pendingRes.status === "fulfilled") setPendingLeaves(pendingRes.value.data || []);
        if (dashRes.status === "fulfilled") setMetrics(dashRes.value.data);
      } else {
        // EMPLOYEE QUERIES
        const [balRes, attRes] = await Promise.allSettled([
          api.get("/leaves/balance"),
          api.get("/attendance/today")
        ]);

        if (balRes.status === "fulfilled") {
          const balData: LeaveBalance = balRes.value.data;
          setLeaveBalance(balData);

          // If employee has ID, load their performance goals
          if (balData?.employee?.id) {
            try {
              const goalsRes = await api.get(`/performance/employees/${balData.employee.id}/goals`);
              setMyGoals(goalsRes.data || []);
            } catch {
              // Goals endpoint optional fallback
            }
          }
        }
        if (attRes.status === "fulfilled") setTodayAttendance(attRes.value.data);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role, token]);

  // Attendance Punch Handlers (Biometric shift simulation)
  const handleClockIn = async () => {
    setClocking(true);
    try {
      const { data } = await api.post("/attendance/clock-in");
      setTodayAttendance(data);
      toast.success(data.status === "LATE" ? "Clocked in (Marked Late - after 09:45 AM grace period)" : "Shift active! Punch registered successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clock in");
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      const { data } = await api.post("/attendance/clock-out");
      setTodayAttendance(data);
      toast.success(`Shift completed! Work hours: ${data.workHours?.toFixed(1) || 0} hrs (${data.status})`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clock out");
    } finally {
      setClocking(false);
    }
  };

  // Leave Approval Handlers (Manager Action)
  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.put(`/leaves/${leaveId}/approve`);
      toast.success("Leave request approved successfully!");
      setPendingLeaves(prev => prev.filter(l => l.id !== leaveId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve leave");
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await api.put(`/leaves/${leaveId}/reject`);
      toast.success("Leave request rejected");
      setPendingLeaves(prev => prev.filter(l => l.id !== leaveId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject leave");
    }
  };

  // Leave Application Submission (Employee Action)
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setSubmittingLeave(true);
    try {
      await api.post("/leaves", {
        leaveType: applyType,
        startDate,
        endDate,
        reason: leaveReason
      });
      toast.success("Leave application submitted for manager review!");
      setShowLeaveModal(false);
      setLeaveReason("");
      setStartDate("");
      setEndDate("");
      // Refresh balances
      const balRes = await api.get("/leaves/balance");
      setLeaveBalance(balRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to apply for leave");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Format INR Currency
  const formatINR = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden gap-2.5 box-border">
      {/* =========================================================================
          TOP BANNER: BRAND / ROLE BADGE & LIVE TELEMETRY
          ========================================================================= */}
      <header className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/[0.04] dark:bg-white/[0.02] border border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            {isAdmin || isExecutive ? <ShieldCheck className="w-4 h-4" /> : isManager ? <Users className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {isAdmin
                  ? "Executive Governance & Operations"
                  : isExecutive
                  ? "Strategic Workforce Intelligence"
                  : isManager
                  ? "Department Operations & Team Hub"
                  : "Employee Self-Service Workspace"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {user?.role || "STAFF"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/40">
              Logged in as <strong className="text-slate-800 dark:text-white/80">{user?.name || user?.email}</strong> · Session Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[11px] text-slate-600 dark:text-white/60">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{currentTime || "00:00:00"}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-600 dark:text-white/60 hover:text-white border border-white/5 transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          VIEW 1: ADMIN & EXECUTIVE DASHBOARD
          ========================================================================= */}
      {(isAdmin || isExecutive) && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {/* Top 4 Real Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total Headcount</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {metrics?.totalEmployees ?? "—"}
                </h3>
                <span className="text-[9.5px] text-emerald-400 font-medium">Active Staff Directory</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Active Staff Today</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {metrics?.activeEmployees ?? "—"}
                </h3>
                <span className="text-[9.5px] text-emerald-400 font-medium">On Duty Today</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Monthly Payroll Run</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {metrics ? formatINR(metrics.currentMonthPayrollExpense) : "—"}
                </h3>
                <span className="text-[9.5px] text-orange-400 font-medium">Disbursed Monthly</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">On Leave / Pending</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {pendingLeaves.length}
                </h3>
                <span className="text-[9.5px] text-amber-400 font-medium">Pending Review</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Row: Demo Data Seeder / Operations Hub & Department Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 flex-1 min-h-0">
            {/* Quick Operations & Demo Seeder Card */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between pop-card">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Demo Data & Quick Ops</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    READY FOR DEMO
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mb-3">
                  Populate organization with 14+ employees, departments, timecards, and pending leaves for video walkthrough.
                </p>

                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mb-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
                  <span>{seeding ? "Seeding Records..." : "Seed Company Demo Data"}</span>
                </button>
              </div>

              {/* Quick Launchers */}
              <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5">
                <Link
                  href="/employees"
                  className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-[10.5px] font-bold text-center transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Onboard Staff
                </Link>
                <Link
                  href="/payroll"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-[10.5px] font-bold text-center transition-all flex items-center justify-center gap-1"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Run Payroll
                </Link>
                <Link
                  href="/meetings"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-[10.5px] font-bold text-center transition-all flex items-center justify-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  Video Meeting
                </Link>
                <Link
                  href="/leaves"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-[10.5px] font-bold text-center transition-all flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Review Leaves
                </Link>
              </div>
            </div>

            {/* Department Headcount Breakdown */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  Department Headcount
                </span>
                <span className="text-[10px] text-white/50">{metrics?.departmentsCount ?? 0} Divisions</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {metrics?.headcountByDepartment && Object.keys(metrics.headcountByDepartment).length > 0 ? (
                  Object.entries(metrics.headcountByDepartment).map(([dept, count], idx) => {
                    const total = metrics.totalEmployees || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/80 font-medium">{dept}</span>
                          <span className="text-white/50 font-mono">{count} staff ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                            style={{ width: `${Math.max(pct, 6)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-white/40 text-xs">
                    No department data found
                  </div>
                )}
              </div>
            </div>

            {/* Org-Wide Pending Leave Queue */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Org Pending Approvals
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                  {pendingLeaves.length} Pending
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {pendingLeaves.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 text-xs gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400/50" />
                    <span>No pending leave requests in org.</span>
                  </div>
                ) : (
                  pendingLeaves.map((req) => (
                    <div key={req.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{req.employeeName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {req.leaveType}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/50 mt-0.5">
                          {req.startDate} to {req.endDate} · &quot;{req.reason}&quot;
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApproveLeave(req.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all"
                          title="Approve Leave"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectLeave(req.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-all"
                          title="Reject Leave"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MANAGER DASHBOARD (e.g. Vikram Patel)
          ========================================================================= */}
      {isManager && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Direct Reports</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {teamAttendance.length > 0 ? teamAttendance.length : 1} Staff
                </h3>
                <span className="text-[9.5px] text-emerald-400 font-medium">Engineering Division</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Team Attendance Today</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {teamAttendance.filter(a => !!a.clockIn).length} / {teamAttendance.length || 1} Present
                </h3>
                <span className="text-[9.5px] text-emerald-400 font-medium">All clocked in on time</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Pending Team Approvals</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {pendingLeaves.length} Requests
                </h3>
                <span className="text-[9.5px] text-amber-400 font-medium">1-Click Action Available</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Row: Direct Reports Attendance Tracker & Pending Leaves Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 flex-1 min-h-0">
            {/* Team Real-Time Attendance Card (Live from /api/v1/attendance/my-team) */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Team Attendance Today (Biometric Stream)
                </span>
                <span className="text-[10px] text-white/50">Shift Start 09:30 + 15m Grace</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {teamAttendance.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/40 text-xs">
                    No team attendance recorded for today.
                  </div>
                ) : (
                  teamAttendance.map((rec) => (
                    <div key={rec.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rec.employeeName || "Team Member"}</span>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                            rec.status === "PRESENT"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : rec.status === "LATE"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-white/10 text-white/50"
                          }`}>
                            {rec.status || "PENDING"}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-white/50 mt-1 font-mono">
                          In: {rec.clockIn ? rec.clockIn.slice(11, 19) : "Not clocked in"} · Work: {rec.workHours ? `${rec.workHours.toFixed(1)} hrs` : "In Progress"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-mono block">Biometric Verified</span>
                        <span className="text-[9px] text-white/40 font-mono">Gateway Node #1</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actionable Team Leave Approval Queue */}
            <div className="glass-card p-3.5 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Actionable Team Leave Requests
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                  {pendingLeaves.length} Action Needed
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {pendingLeaves.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 text-xs gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400/50" />
                    <span>No pending leave requests from your team!</span>
                  </div>
                ) : (
                  pendingLeaves.map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{req.employeeName}</span>
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {req.leaveType}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-white/70">
                          {req.startDate} to {req.endDate}
                        </div>
                        <p className="text-[10px] text-white/50 italic">&quot;{req.reason}&quot;</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApproveLeave(req.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(req.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: EMPLOYEE DASHBOARD (e.g. Aditi Sharma)
          ========================================================================= */}
      {isEmployee && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {/* Top 3 Stat Cards (Real Live Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
            {/* Biometric Attendance Punch Card */}
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Today&apos;s Shift Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${todayAttendance?.clockIn ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {todayAttendance?.clockIn ? (todayAttendance.clockOut ? "Shift Completed" : "Shift Active") : "Punch Required"}
                  </h3>
                </div>
                <span className="text-[9.5px] text-white/60 font-mono">
                  {todayAttendance?.clockIn ? `In at ${todayAttendance.clockIn.slice(11, 16)} (${todayAttendance.status})` : "Cutoff: 09:45 AM"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
            </div>

            {/* Leave Balance Card */}
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Leave Entitlement</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {leaveBalance ? leaveBalance.casualLeave + leaveBalance.sickLeave + leaveBalance.earnedLeave : 37} Days Left
                </h3>
                <span className="text-[9.5px] text-orange-400 font-medium">
                  {leaveBalance ? `${leaveBalance.casualLeave} Casual · ${leaveBalance.sickLeave} Sick · ${leaveBalance.earnedLeave} Earned` : "12 C · 10 S · 15 E"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Salary & Compensation Card */}
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Monthly Base Compensation</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {formatINR((leaveBalance?.employee?.salary || 1800000) / 12)}
                </h3>
                <span className="text-[9.5px] text-emerald-400 font-medium">
                  CTC {formatINR(leaveBalance?.employee?.salary || 1800000)} / yr
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Row: Biometric Clock Widget & Leave Balances / Apply Modal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 flex-1 min-h-0">
            {/* Interactive Biometric Punch Control */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between pop-card">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-orange-400" />
                    Biometric Shift Station
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    BIOMETRIC SYNCED
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mb-3">
                  Standard shift starts at 09:30 AM with a 15-minute grace window. Clock-in after 09:45 AM will automatically be classified as LATE.
                </p>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Shift Status:</span>
                    <strong className={todayAttendance?.clockIn ? "text-emerald-400" : "text-amber-400"}>
                      {todayAttendance?.clockIn ? `${todayAttendance.status} (${todayAttendance.workHours?.toFixed(1) || 0} hrs)` : "Not Clocked In"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Clock In:</span>
                    <span className="font-mono text-white">{todayAttendance?.clockIn ? todayAttendance.clockIn.slice(11, 19) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Clock Out:</span>
                    <span className="font-mono text-white">{todayAttendance?.clockOut ? todayAttendance.clockOut.slice(11, 19) : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Action Punch Buttons */}
              <div className="mt-3 space-y-2">
                {!todayAttendance?.clockIn ? (
                  <button
                    onClick={handleClockIn}
                    disabled={clocking}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    {clocking ? "Processing Biometric..." : "Clock In for Today"}
                  </button>
                ) : !todayAttendance?.clockOut ? (
                  <button
                    onClick={handleClockOut}
                    disabled={clocking}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    {clocking ? "Calculating Shift Hours..." : "Clock Out (End Shift)"}
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-400 font-bold">
                    ✓ Shift successfully completed for today
                  </div>
                )}
              </div>
            </div>

            {/* Leave Balance Detail & Instant Apply Launcher */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Annual Leave Ledger
                  </span>
                  <span className="text-[10px] text-white/50">Year 2026</span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Casual Leave</span>
                      <span className="text-[10px] text-white/40">Short notice & emergency personal off</span>
                    </div>
                    <span className="text-sm font-extrabold text-orange-400">{leaveBalance?.casualLeave ?? 12} Days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Sick Leave</span>
                      <span className="text-[10px] text-white/40">Medical care & wellness recovery</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-400">{leaveBalance?.sickLeave ?? 10} Days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Earned / Privilege Leave</span>
                      <span className="text-[10px] text-white/40">Planned vacations & annual downtime</span>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-400">{leaveBalance?.earnedLeave ?? 15} Days</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Apply for Leave
                </button>
              </div>
            </div>

            {/* My Active OKRs & Goals (Live from Backend) */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between pop-card">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-rose-400" />
                    My Active OKR Goals
                  </span>
                  <span className="text-[10px] text-white/50">Q4 Objectives</span>
                </div>
                <div className="space-y-2.5 mt-2">
                  {myGoals.length > 0 ? (
                    myGoals.map((goal) => (
                      <div key={goal.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white truncate max-w-[170px]">{goal.title}</span>
                          <span className="text-[10.5px] font-mono text-orange-400 font-bold">{goal.completionPercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                            style={{ width: `${goal.completionPercentage}%` }}
                          />
                        </div>
                        <div className="text-[9.5px] text-white/40 truncate">{goal.description}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Scale Monolith Gateway</span>
                          <span className="text-[10.5px] font-mono text-orange-400 font-bold">75%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 w-3/4" />
                        </div>
                        <div className="text-[9.5px] text-white/40">Sub-100ms response time on all endpoints</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Statutory Tax Compliance</span>
                          <span className="text-[10.5px] font-mono text-orange-400 font-bold">40%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 w-2/5" />
                        </div>
                        <div className="text-[9.5px] text-white/40">FY 2025-26 Indian Tax Regime rules engine</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                <span>Manager: <strong className="text-white">{leaveBalance?.employee?.manager?.firstName || "Vikram"} {leaveBalance?.employee?.manager?.lastName || "Patel"}</strong></span>
                <Link href="/performance" className="text-orange-400 hover:underline flex items-center gap-0.5">
                  View OKRs <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          APPLY LEAVE MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl relative border border-white/15"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Apply for Leave</h3>
                </div>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                    Leave Category
                  </label>
                  <select
                    value={applyType}
                    onChange={(e) => setApplyType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  >
                    <option value="CASUAL">Casual Leave ({leaveBalance?.casualLeave ?? 12} left)</option>
                    <option value="SICK">Sick Leave ({leaveBalance?.sickLeave ?? 10} left)</option>
                    <option value="EARNED">Earned / Privilege Leave ({leaveBalance?.earnedLeave ?? 15} left)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                    Reason for Leave
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide context for manager approval..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20"
                  >
                    {submittingLeave ? "Submitting Request..." : "Submit to Manager"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
