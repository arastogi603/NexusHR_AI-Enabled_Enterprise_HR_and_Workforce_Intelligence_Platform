"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  Calendar,
  Timer,
  Coffee,
  AlertCircle,
  Activity,
  History
} from "lucide-react";
import toast from "react-hot-toast";
import LiquidCarveButton from "@/components/ui/LiquidCarveButton";

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

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isAdminOrManager = user?.role?.includes("ADMIN") || user?.role?.includes("MANAGER") || false;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDate(now.toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = async () => {
    try {
      const { data } = await api.get("/attendance/today");
      setTodayRecord(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTodayRecord(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryAndTeam = async () => {
    try {
      const to = new Date().toISOString().split("T")[0];
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 14);
      const from = fromDate.toISOString().split("T")[0];
      const { data } = await api.get(`/attendance/history?from=${from}&to=${to}`);
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load attendance history", err);
    }

    if (isAdminOrManager) {
      try {
        const { data } = await api.get("/attendance/my-team");
        setTeamAttendance(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        console.error("Failed to load team attendance", err);
      }
    }
  };

  useEffect(() => {
    fetchToday();
    fetchHistoryAndTeam();
  }, [user]);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/clock-in");
      setTodayRecord(data);
      toast.success(data.status === "LATE" ? "Clocked in (Marked Late - after 09:45 AM)" : "Shift active! Punch registered.");
      fetchHistoryAndTeam();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clock in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/clock-out");
      setTodayRecord(data);
      toast.success(`Shift completed! Work hours: ${data.workHours?.toFixed(1) || 0} hrs.`);
      fetchHistoryAndTeam();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clock out");
    } finally {
      setActionLoading(false);
    }
  };

  const isClockedIn = !!todayRecord?.clockIn;
  const isClockedOut = !!todayRecord?.clockOut;

  const weeklyHours = (history.reduce((acc, h) => acc + (h.workHours || 0), 0) + (todayRecord?.workHours || 0)).toFixed(1);
  const onTimeCount = history.filter(h => h.status === "PRESENT").length + (todayRecord?.status === "PRESENT" ? 1 : 0);
  const totalEntries = history.length + (todayRecord ? 1 : 0);
  const punctualityRate = totalEntries > 0 ? Math.round((onTimeCount / totalEntries) * 100) : 100;
  const targetPct = Math.min(100, Math.round((Number(weeklyHours) / 40) * 100));

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Attendance & Shift Timecard
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </h1>
          <p className="text-[10.5px] text-slate-500 dark:text-white/40 mt-0.5">
            Real-time biometric & digital punch terminal, daily shift duration, and Gateway sync.
          </p>
        </div>
      </div>

      {/* Main Grid: 8 Cols Left + 4 Cols Right */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">

        {/* Left Column: Glass Digital Punch Terminal + History */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-2 overflow-hidden">

          {/* Clock & Action Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] text-center flex flex-col justify-between flex-1 min-h-0 relative overflow-hidden"
          >
            {/* Top Date Badge */}
            <div className="inline-block px-3 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/[0.05] border border-slate-300/60 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-white/60 mx-auto">
              {currentDate || "Loading date..."}
            </div>

            {/* Glowing Big Clock Display */}
            <div className="my-1">
              <div className="text-3xl sm:text-5xl font-mono font-black text-slate-900 dark:text-white tracking-widest drop-shadow-[0_0_16px_rgba(255,107,44,0.35)]">
                {currentTime || "00:00:00"}
              </div>
              <div className="text-[9.5px] font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest mt-0.5">
                Standard Corporate Synchronized Gateway Time (UTC+05:30)
              </div>
            </div>

            {/* Punch Action Buttons */}
            <div className="flex items-center justify-center gap-3 max-w-sm mx-auto my-1">
              {!isClockedIn ? (
                <LiquidCarveButton
                  label={actionLoading ? "Punching..." : "Clock In Shift"}
                  padding="10px 28px"
                  rounded={12}
                  colors={{ fill: "#10B981", textColor: "#FFFFFF" }}
                  blob={{ color: "#34D399", size: 60, smoothness: 50 }}
                  onClick={handleClockIn}
                />
              ) : !isClockedOut ? (
                <LiquidCarveButton
                  label={actionLoading ? "Punching..." : "Clock Out Shift"}
                  padding="10px 28px"
                  rounded={12}
                  colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                  blob={{ color: "#FFA055", size: 60, smoothness: 50 }}
                  onClick={handleClockOut}
                />
              ) : (
                <div className="px-5 py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/[0.04] text-slate-600 dark:text-white/50 text-xs font-bold">
                  Shift Completed For Today · {todayRecord?.workHours?.toFixed(1) || 0} Hours Logged
                </div>
              )}
            </div>

            {/* Punch Timestamps */}
            <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto pt-2 border-t border-slate-200/60 dark:border-white/5 w-full">
              <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-white/40">In Time</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {todayRecord?.clockIn ? String(todayRecord.clockIn).slice(11, 16) : "--:--"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-white/40">Out Time</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-orange-600 dark:text-orange-400 mt-0.5">
                  {todayRecord?.clockOut ? String(todayRecord.clockOut).slice(11, 16) : "--:--"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shift Activity History */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Recent Shift Telemetry ({history.length} Records)
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono">Gateway Audited</span>
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs max-h-24 overflow-y-auto custom-scrollbar">
                {history.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id || String(rec.date)}
                    className="p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-[11px]"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{String(rec.date)}</div>
                    <div className="text-[10px] text-slate-500 dark:text-white/40 font-mono mt-0.5">
                      {rec.clockIn ? String(rec.clockIn).slice(11, 16) : "--:--"} → {rec.clockOut ? String(rec.clockOut).slice(11, 16) : "--:--"}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {rec.workHours ? `${rec.workHours.toFixed(1)} hrs` : "In Progress"} · {rec.status || "PRESENT"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-[11px] text-slate-400 dark:text-white/40">
                No prior shifts recorded in current window. Punch in above to initialize telemetry.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Shift Telemetrics & Weekly Summary + Team View */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-2 overflow-hidden">
          {/* Card 1: Cumulative Weekly Hours */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] space-y-2">
            <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              Weekly Workload Index
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{weeklyHours} hrs</h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{targetPct}% Target</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-white/40">Expected: 40.0 hrs / week scheduled.</p>
          </div>

          {/* Card 2: Shift Punctuality & Compliance */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                Punctuality & Score
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{punctualityRate}%</h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {punctualityRate >= 90 ? "A+ Grade" : "Standard"}
                </span>
              </div>
            </div>

            {isAdminOrManager && teamAttendance.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
                  Team Live Status ({teamAttendance.length})
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                  {teamAttendance.map(m => (
                    <div key={m.id || m.employeeName} className="flex justify-between items-center text-[11px] p-1 rounded bg-slate-100/50 dark:bg-white/[0.02]">
                      <span className="font-medium text-slate-800 dark:text-white">{m.employeeName}</span>
                      <span className="font-bold text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                        {m.status || "PRESENT"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
              <div className="flex justify-between text-slate-600 dark:text-white/70">
                <span>On-Time Punches:</span>
                <span className="font-bold text-slate-900 dark:text-white">{onTimeCount}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-white/70">
                <span>Grace Window:</span>
                <span className="font-bold text-slate-900 dark:text-white">15 Minutes (09:45 AM)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
