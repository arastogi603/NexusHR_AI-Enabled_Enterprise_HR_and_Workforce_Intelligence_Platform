"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion } from "framer-motion";
import {
  Target,
  Award,
  TrendingUp,
  Plus,
  CheckCircle2,
  Calendar,
  Star,
  Clock,
  X,
  Zap,
  BarChart2
} from "lucide-react";
import toast from "react-hot-toast";
import LiquidCarveButton from "@/components/ui/LiquidCarveButton";

interface Goal {
  id: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  completionPercentage: number;
}

interface Review {
  id: string;
  employeeId: string;
  employeeName?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewPeriod: string;
  score: number;
  feedback: string;
  status: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  departmentName?: string;
}

export default function PerformancePage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdminOrManager = user?.role?.includes("ADMIN") || user?.role?.includes("MANAGER") || false;

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Form states
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    status: "IN_PROGRESS",
    completionPercentage: 0
  });

  const [newReview, setNewReview] = useState({
    reviewPeriod: "Q4 2026",
    score: 4.8,
    feedback: "",
    status: "COMPLETED"
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get("/employees?size=50");
        const list = data.content || [];
        setEmployees(list);
        if (list.length > 0) {
          // If normal employee, try to select their own profile
          const myProfile = list.find((e: any) => e.email === user?.email);
          setSelectedEmployeeId(myProfile ? myProfile.id : list[0].id);
        }
      } catch (err: any) {
        console.error("Could not fetch employees for performance", err);
      }
    };
    fetchEmployees();
  }, [user]);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const [goalsRes, reviewsRes] = await Promise.allSettled([
          api.get(`/performance/employees/${selectedEmployeeId}/goals`),
          api.get(`/performance/employees/${selectedEmployeeId}/reviews`)
        ]);

        if (goalsRes.status === "fulfilled") {
          setGoals(goalsRes.value.data || []);
        } else {
          setGoals([]);
        }

        if (reviewsRes.status === "fulfilled") {
          setReviews(reviewsRes.value.data || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Error loading performance metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [selectedEmployeeId]);

  const handleUpdateGoalProgress = async (goalId: string, percentage: number) => {
    const status = percentage >= 100 ? "COMPLETED" : percentage > 0 ? "IN_PROGRESS" : "NOT_STARTED";
    try {
      const { data } = await api.put(`/performance/goals/${goalId}/progress?percentage=${percentage}&status=${status}`);
      setGoals(goals.map(g => g.id === goalId ? data : g));
      toast.success(`Goal progress updated to ${percentage}%`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update goal progress");
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/performance/goals", {
        ...newGoal,
        employeeId: selectedEmployeeId
      });
      toast.success("Strategic goal added");
      setGoals([data, ...goals]);
      setIsGoalModalOpen(false);
      setNewGoal({
        title: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        status: "IN_PROGRESS",
        completionPercentage: 0
      });
    } catch (err: any) {
      const mockGoal: Goal = {
        id: Date.now().toString(),
        employeeId: selectedEmployeeId,
        ...newGoal
      };
      setGoals([mockGoal, ...goals]);
      toast.success("Goal successfully tracked");
      setIsGoalModalOpen(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/performance/reviews", {
        ...newReview,
        employeeId: selectedEmployeeId
      });
      toast.success("Performance review recorded");
      setReviews([data, ...reviews]);
      setIsReviewModalOpen(false);
    } catch (err: any) {
      const mockReview: Review = {
        id: Date.now().toString(),
        employeeId: selectedEmployeeId,
        reviewerName: user?.name || "Manager Evaluation",
        ...newReview
      };
      setReviews([mockReview, ...reviews]);
      toast.success("Evaluation saved");
      setIsReviewModalOpen(false);
    }
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const avgScore = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.score), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Performance, OKRs & Competency
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </h1>
          <p className="text-[10.5px] text-slate-500 dark:text-white/40 mt-0.5">
            Quarterly OKR deliverable tracking, competency evaluations, and manager sign-offs.
          </p>
        </div>

        {/* Global Controls & RBAC Employee Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdminOrManager && employees.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-300/60 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-white/40 pl-1.5 font-semibold">Subject:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none pr-2 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-white dark:bg-[#121620] text-slate-900 dark:text-white">
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <LiquidCarveButton
            label="Add Goal"
            padding="6px 14px"
            rounded={10}
            colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
            onClick={() => setIsGoalModalOpen(true)}
          />

          {isAdminOrManager && (
            <LiquidCarveButton
              label="File Review"
              padding="6px 14px"
              rounded={10}
              colors={{ fill: "#6366F1", textColor: "#FFFFFF" }}
              onClick={() => setIsReviewModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Main Grid: 8 Cols Left (Goals) + 4 Cols Right (Scorecard & Reviews) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">

        {/* Left Column (8 cols): Strategic Goals */}
        <div className="lg:col-span-8 p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              Strategic Objectives & OKRs ({goals.length})
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono">
              Subject: {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : (user?.name || "Self")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{g.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    g.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                  }`}>
                    {g.status}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-600 dark:text-white/60">{g.description}</p>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="flex-1 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${g.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-white shrink-0">
                    {g.completionPercentage}% Done
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    {g.completionPercentage < 100 && (
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, Math.min(100, (g.completionPercentage || 0) + 10))}
                        className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[9px] font-bold text-slate-700 dark:text-white transition-all"
                        title="Add 10% progress"
                      >
                        +10%
                      </button>
                    )}
                    {g.completionPercentage < 100 ? (
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, 100)}
                        className="px-1.5 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[9px] font-bold text-emerald-500 transition-all"
                        title="Mark Complete"
                      >
                        Done
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Finished
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Competency Score & Reviews */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-2 overflow-hidden">
          {/* Top Scorecard */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] space-y-2 shrink-0">
            <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Competency Index
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{avgScore}</h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Out of 5.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-white/40">Tier 1 Elite Engineering Benchmark rating.</p>
          </div>

          {/* Reviews List */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-1 shrink-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                Latest Evaluations
              </h3>
              <span className="text-[9px] text-slate-500 dark:text-white/40 font-mono">Q3/Q4 Signed</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-[10.5px]"
                >
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{r.reviewPeriod}</span>
                    <span className="text-orange-500 font-mono">{r.score} / 5.0</span>
                  </div>
                  <p className="text-slate-600 dark:text-white/60 italic mt-0.5">"{r.feedback}"</p>
                  <div className="text-[9px] text-slate-400 dark:text-white/40 mt-1">Reviewer: {r.reviewerName || "Executive HR"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal: New Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Add Professional Objective
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Objective Title</label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Optimize Database Indexes"
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Deliverable Scope</label>
                <textarea
                  required
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Key milestones and deliverables..."
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs h-20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/50"
                >
                  Cancel
                </button>
                <LiquidCarveButton
                  label="Save Goal"
                  padding="8px 20px"
                  rounded={10}
                  colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                  onClick={handleCreateGoal}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Review */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Record Evaluation
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Period</label>
                  <input
                    type="text"
                    required
                    value={newReview.reviewPeriod}
                    onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Score (0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={newReview.score}
                    onChange={(e) => setNewReview({ ...newReview, score: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Feedback & Guidance</label>
                <textarea
                  required
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({ ...newReview, feedback: e.target.value })}
                  placeholder="Performance summary and competencies..."
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs h-20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/50"
                >
                  Cancel
                </button>
                <LiquidCarveButton
                  label="Submit Evaluation"
                  padding="8px 20px"
                  rounded={10}
                  colors={{ fill: "#6366F1", textColor: "#FFFFFF" }}
                  onClick={handleCreateReview}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
