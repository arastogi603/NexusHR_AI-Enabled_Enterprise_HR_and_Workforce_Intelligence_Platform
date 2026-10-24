"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Coffee,
  HeartPulse,
  Palmtree,
  Check,
  X,
  FileText
} from "lucide-react";
import toast from "react-hot-toast";
import LiquidCarveButton from "@/components/ui/LiquidCarveButton";

interface LeaveBalance {
  casualLeave: number;
  sickLeave: number;
  earnedLeave: number;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  employeeName?: string;
}

export default function LeaveManagement() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [managerQueue, setManagerQueue] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [leaveType, setLeaveType] = useState("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdminOrManager = user?.role?.includes("ADMIN") || user?.role?.includes("MANAGER") || false;

  const loadData = async () => {
    try {
      const [balRes, leavesRes] = await Promise.allSettled([
        api.get("/leaves/balance"),
        api.get("/leaves")
      ]);

      if (balRes.status === "fulfilled") {
        setBalance(balRes.value.data);
      }

      if (leavesRes.status === "fulfilled") {
        setMyLeaves(leavesRes.value.data || []);
      }

      if (isAdminOrManager) {
        try {
          const queueRes = await api.get("/leaves/pending");
          setManagerQueue(queueRes.data || []);
        } catch {
          setManagerQueue([]);
        }
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please specify start and end dates");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/leaves", {
        leaveType,
        startDate,
        endDate,
        reason,
      });
      toast.success("Leave application submitted for approval!");
      setMyLeaves([data, ...myLeaves]);
      setStartDate("");
      setEndDate("");
      setReason("");
      // Refresh balance
      const balRes = await api.get("/leaves/balance");
      setBalance(balRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success("Leave request approved");
      setManagerQueue(managerQueue.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve leave");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/reject`);
      toast.success("Leave request rejected");
      setManagerQueue(managerQueue.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject leave");
    }
  };

  const [activeView, setActiveView] = useState<"roster" | "calendar">("roster");

  const balanceCards = [
    {
      title: "Casual Leave",
      available: balance?.casualLeave ?? 12,
      total: 14,
      icon: Coffee,
      gradient: "from-amber-500/20 to-orange-500/20 text-orange-500 border border-orange-500/30",
    },
    {
      title: "Sick & Medical Leave",
      available: balance?.sickLeave ?? 12,
      total: 14,
      icon: HeartPulse,
      gradient: "from-rose-500/20 to-pink-500/20 text-rose-500 border border-rose-500/30",
    },
    {
      title: "Annual Vacation",
      available: balance?.earnedLeave ?? 15,
      total: 20,
      icon: Palmtree,
      gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border border-emerald-500/30",
    },
  ];

  // Calendar Helpers for October 2026 (starts on Thursday, 31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 4; // Thursday

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Leave Management & Entitlements
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </h1>
          <p className="text-[10.5px] text-slate-500 dark:text-white/40 mt-0.5">
            {isAdminOrManager ? "Track organizational allocations, approve department requests, and view balances." : "Track personal annual allocations, apply for time-off, and view supervisor status."}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-200/50 dark:bg-white/[0.04] p-0.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
          <button
            onClick={() => setActiveView("roster")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeView === "roster"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Roster & Apply
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeView === "calendar"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar View
          </button>
        </div>
      </div>

      {/* Top Glass Balance Cards (Dynamic from /leaves/balance) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
        {balanceCards.map((b, idx) => {
          const Icon = b.icon;
          const percentage = Math.round((b.available / b.total) * 100);
          return (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] relative cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">{b.title}</p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {b.available} <span className="text-xs font-normal text-slate-500 dark:text-white/40">/ {b.total} Days</span>
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${b.gradient} shadow-inner`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-white/40">
                  <span>Available Balance</span>
                  <span className="font-mono text-slate-800 dark:text-white font-bold">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      {activeView === "calendar" ? (
        <div className="flex-1 min-h-0 p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-white/10 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                October 2026 Shift & Leave Schedule
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-white/40">Visual day-by-day mapping of scheduled leaves and approvals.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Casual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Sick / Medical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Vacation (Earned)</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 min-h-0 grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-white/40 py-1 uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* Empty Offset cells */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="p-1 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-dashed border-slate-200/40 dark:border-white/[0.02] opacity-30" />
            ))}

            {/* October 1..31 Days */}
            {daysInMonth.map(day => {
              const dayStr = `2026-10-${day < 10 ? `0${day}` : day}`;
              const allLeaves = [...myLeaves, ...managerQueue];
              const dayLeaves = allLeaves.filter(l => l.startDate <= dayStr && l.endDate >= dayStr);
              const isToday = day === 21;

              return (
                <div
                  key={day}
                  className={`p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? "bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10"
                      : "bg-slate-100/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isToday ? "text-amber-500" : "text-slate-800 dark:text-white"}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[8px] font-bold px-1 rounded bg-amber-500 text-white">Today</span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayLeaves.slice(0, 2).map((l, idx) => (
                      <div
                        key={idx}
                        className={`text-[8.5px] font-bold truncate rounded px-1 py-0.2 border ${
                          l.leaveType === "CASUAL"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : l.leaveType === "SICK"
                            ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        }`}
                        title={`${l.leaveType} (${l.status}): ${l.reason}`}
                      >
                        {l.leaveType.slice(0, 3)}: {l.reason.slice(0, 8)}..
                      </div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <div className="text-[8px] text-slate-400">+{dayLeaves.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Main Grid: 8 Columns Left + 4 Columns Right */
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">

        {/* Left Column: Leave Request History & Manager Approvals */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-2 overflow-hidden">

          {/* Manager Approvals Queue (Only shown to Admin & Manager) */}
          {isAdminOrManager && managerQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] shrink-0"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                  Pending Team Approvals ({managerQueue.length})
                </h3>
              </div>

              <div className="space-y-1.5">
                {managerQueue.map((req) => (
                  <div
                    key={req.id}
                    className="p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{req.employeeName || "Team Member"}</div>
                      <div className="text-[10px] text-slate-500 dark:text-white/40">
                        {req.leaveType} · {req.startDate} to {req.endDate} — <span className="italic">"{req.reason}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 transition-all"
                      >
                        <X className="w-3 h-3" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* My Leave Requests Table */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Leave Request History ({myLeaves.length})
              </h3>
            </div>

            {myLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-white/40 text-xs">
                No leave requests logged yet. Use the application form to submit.
              </div>
            ) : (
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Type</th>
                      <th className="pb-2 font-semibold">Duration</th>
                      <th className="pb-2 font-semibold">Reason</th>
                      <th className="pb-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {myLeaves.map((leave) => {
                      const isApproved = leave.status === "APPROVED";
                      const isPending = leave.status === "PENDING";
                      return (
                        <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 font-bold text-slate-900 dark:text-white">{leave.leaveType}</td>
                          <td className="py-2 text-slate-600 dark:text-white/60 font-mono text-[11px]">
                            {leave.startDate} → {leave.endDate}
                          </td>
                          <td className="py-2 text-slate-600 dark:text-white/60 max-w-xs truncate">{leave.reason}</td>
                          <td className="py-2 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : isPending
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Apply Leave Form */}
        <div className="lg:col-span-4 flex flex-col justify-between overflow-hidden">
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] h-full flex flex-col justify-between">
            <div className="shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                Submit Application
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">Specify dates and category for supervisor sign-off.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 my-1 flex-1 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-orange-500"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick & Medical</option>
                  <option value="EARNED">Annual Vacation</option>
                  <option value="MATERNITY">Parental / Family</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase mb-1">
                  Reason & Context
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for manager review..."
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300/60 dark:border-white/10 text-slate-900 dark:text-white text-xs flex-1 min-h-[50px] outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="pt-1 flex justify-end shrink-0">
                <LiquidCarveButton
                  label={submitting ? "Transmitting..." : "Send Request"}
                  padding="8px 20px"
                  rounded={10}
                  colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                  onClick={handleSubmit}
                />
              </div>
            </form>
          </div>
        </div>

        </div>
      )}
    </div>
  );
}
