"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
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
  BarChart2,
  Activity,
  Dna,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Flame,
  ThumbsUp,
  Filter,
  Check,
  Sliders,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { getStoredEmployees, generatePerformanceReviews } from "@/lib/demo-data-generator";

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
  email?: string;
}

interface GenomeSkill {
  id: string;
  name: string;
  category: "Architecture" | "AI & Systems" | "Velocity" | "Security" | "Leadership";
  proficiency: number;
  level: string;
  endorsements: number;
  growth: string;
}

// Enterprise Demo Default OKRs
const DEFAULT_GOALS: Goal[] = [
  {
    id: "g-1",
    employeeId: "demo-emp",
    title: "Migrate Auth Pipeline to Argon2 & Hash-Chained Audits",
    description: "Upgrade cryptographic identity layer and implement immutable SHA-256 audit trails with zero downtime.",
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    status: "IN_PROGRESS",
    completionPercentage: 90
  },
  {
    id: "g-2",
    employeeId: "demo-emp",
    title: "Real-time STOMP & Distributed Redis Attendance Architecture",
    description: "Deploy distributed WebSocket event push with Redis pub/sub for instant shift punch telemetry.",
    startDate: "2026-08-15",
    endDate: "2026-11-15",
    status: "IN_PROGRESS",
    completionPercentage: 75
  },
  {
    id: "g-3",
    employeeId: "demo-emp",
    title: "AI-Powered Resume Screener with Bias-Free Semantic Matching",
    description: "Build ATS pipeline integrating Google Gemini Flash for unbiased rubric scoring and PDF parsing.",
    startDate: "2026-10-01",
    endDate: "2026-12-15",
    status: "IN_PROGRESS",
    completionPercentage: 60
  },
  {
    id: "g-4",
    employeeId: "demo-emp",
    title: "GPS Geofencing & Biometric Liveness Verification Engine",
    description: "Implement 150m boundary verification for Bangalore HQ and facial biometric liveness checks.",
    startDate: "2026-07-01",
    endDate: "2026-10-15",
    status: "COMPLETED",
    completionPercentage: 100
  },
  {
    id: "g-5",
    employeeId: "demo-emp",
    title: "Automated Tax Proof OCR & Section 115BAC Engine",
    description: "Simulate Tesseract OCR for Section 80C, 80D, and HRA rent receipts with statutory compliance verification.",
    startDate: "2026-10-15",
    endDate: "2026-12-31",
    status: "IN_PROGRESS",
    completionPercentage: 45
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r-1",
    employeeId: "demo-emp",
    reviewerName: "Vikram Patel (Engineering Manager)",
    reviewPeriod: "Q3 2026 Annual Cycle",
    score: 4.9,
    feedback: "Exceptional technical execution across distributed event pipelines and security compliance. Delivered Argon2 authentication migration 2 weeks ahead of schedule with zero production regression.",
    status: "COMPLETED"
  },
  {
    id: "r-2",
    employeeId: "demo-emp",
    reviewerName: "Priya Nair (HR Operations Lead)",
    reviewPeriod: "H1 2026 Mid-Year Review",
    score: 4.8,
    feedback: "Consistently demonstrates high velocity, cross-departmental collaboration, and proactive mentorship of junior engineers. Strong adherence to company culture and agile ceremonies.",
    status: "COMPLETED"
  },
  {
    id: "r-3",
    employeeId: "demo-emp",
    reviewerName: "Ananya Sen (Chief Human Resources Officer)",
    reviewPeriod: "Annual Strategic Review",
    score: 5.0,
    feedback: "Instrumental in architecting our AI-enabled workforce platform. Outstanding innovation, leadership maturity, and business value delivery.",
    status: "COMPLETED"
  }
];

const DEFAULT_GENOME_SKILLS: GenomeSkill[] = [
  { id: "s1", name: "Distributed Systems & Redis STOMP", category: "Architecture", proficiency: 94, level: "L6 Principal", endorsements: 28, growth: "+14% this quarter" },
  { id: "s2", name: "LLM Orchestration & Gemini Flash", category: "AI & Systems", proficiency: 91, level: "L5 Lead", endorsements: 24, growth: "+26% this quarter" },
  { id: "s3", name: "Argon2 & Cryptographic Audit Trails", category: "Security", proficiency: 96, level: "L6 Principal", endorsements: 32, growth: "+10% this quarter" },
  { id: "s4", name: "Spring Boot 3.3 Microservices Reactor", category: "Architecture", proficiency: 92, level: "L5 Lead", endorsements: 30, growth: "+8% this quarter" },
  { id: "s5", name: "Next.js 15 & Framer Motion UX", category: "Velocity", proficiency: 88, level: "L5 Lead", endorsements: 19, growth: "+15% this quarter" },
  { id: "s6", name: "Cross-Functional Agile Leadership", category: "Leadership", proficiency: 89, level: "L5 Lead", endorsements: 22, growth: "+12% this quarter" },
  { id: "s7", name: "PostgreSQL 17 Hash Partitioning", category: "Architecture", proficiency: 87, level: "L4 Senior", endorsements: 17, growth: "+9% this quarter" },
  { id: "s8", name: "Tesseract OCR & Computer Vision", category: "AI & Systems", proficiency: 82, level: "L4 Senior", endorsements: 15, growth: "+22% this quarter" },
];

export default function PerformancePage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [genomeSkills, setGenomeSkills] = useState<GenomeSkill[]>(DEFAULT_GENOME_SKILLS);
  const [loading, setLoading] = useState(false);

  // Active View Tab: 'okrs' | 'genome' | 'reviews'
  const [activeTab, setActiveTab] = useState<"okrs" | "genome" | "reviews">("okrs");

  // OKR Status Filter: 'ALL' | 'IN_PROGRESS' | 'COMPLETED'
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  // Radar Chart Toggle: Overlay Team Benchmark
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Genome Filter
  const [genomeCategory, setGenomeCategory] = useState<string>("ALL");

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

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      const stored = getStoredEmployees().map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        designation: e.designation,
        departmentName: e.departmentName,
        email: e.email
      }));

      try {
        const { data } = await api.get("/employees?size=50");
        const list = data.content || [];
        if (list.length > 0) {
          setEmployees(list);
          const myProfile = list.find((e: any) => e.email === user?.email);
          setSelectedEmployeeId(myProfile ? myProfile.id : list[0].id);
        } else {
          setEmployees(stored);
          setSelectedEmployeeId(stored[0]?.id || "emp-nx-0003");
        }
      } catch (err) {
        setEmployees(stored);
        setSelectedEmployeeId(stored[0]?.id || "emp-nx-0003");
      }
    };
    fetchEmployees();
  }, [user]);

  // Load performance data for selected employee
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchPerformanceData = async () => {
      try {
        const stored = getStoredEmployees();
        const genReviews = generatePerformanceReviews(stored);

        const [goalsRes, reviewsRes] = await Promise.allSettled([
          api.get(`/performance/employees/${selectedEmployeeId}/goals`),
          api.get(`/performance/employees/${selectedEmployeeId}/reviews`)
        ]);

        if (goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value.data) && goalsRes.value.data.length > 0) {
          setGoals(goalsRes.value.data);
        } else {
          setGoals(DEFAULT_GOALS);
        }

        if (reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value.data) && reviewsRes.value.data.length > 0) {
          setReviews(reviewsRes.value.data);
        } else {
          setReviews(genReviews);
        }
      } catch {
        const stored = getStoredEmployees();
        setGoals(DEFAULT_GOALS);
        setReviews(generatePerformanceReviews(stored));
      }
    };

    fetchPerformanceData();
  }, [selectedEmployeeId]);

  // Live Goal Progress Increment
  const handleUpdateGoalProgress = async (goalId: string, percentage: number) => {
    const clamped = Math.min(100, Math.max(0, percentage));
    const status = clamped >= 100 ? "COMPLETED" : clamped > 0 ? "IN_PROGRESS" : "NOT_STARTED";

    try {
      await api.put(`/performance/goals/${goalId}/progress?percentage=${clamped}&status=${status}`);
    } catch {
      // Local state fallback update
    }

    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completionPercentage: clamped, status } : g));
    toast.success(`Goal progress updated to ${clamped}%!`);
  };

  // Endorse Skill in Genome
  const handleEndorseSkill = (skillId: string) => {
    setGenomeSkills(prev => prev.map(s => {
      if (s.id === skillId) {
        toast.success(`Endorsed ${s.name}!`);
        return { ...s, endorsements: s.endorsements + 1, proficiency: Math.min(99, s.proficiency + 1) };
      }
      return s;
    }));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: Goal = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      ...newGoal
    };

    try {
      const { data } = await api.post("/performance/goals", { ...newGoal, employeeId: selectedEmployeeId });
      setGoals([data, ...goals]);
    } catch {
      setGoals([created, ...goals]);
    }

    toast.success("Strategic OKR Objective successfully added!");
    setIsGoalModalOpen(false);
    setNewGoal({
      title: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      status: "IN_PROGRESS",
      completionPercentage: 0
    });
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: Review = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      reviewerName: user?.name || "Manager Evaluation",
      ...newReview
    };

    try {
      const { data } = await api.post("/performance/reviews", { ...newReview, employeeId: selectedEmployeeId });
      setReviews([data, ...reviews]);
    } catch {
      setReviews([created, ...reviews]);
    }

    toast.success("Quarterly review evaluation recorded!");
    setIsReviewModalOpen(false);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Compute Aggregates
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === "COMPLETED" || g.completionPercentage >= 100).length;
  const inProgressGoals = totalGoals - completedGoals;
  const overallCompletionRate = totalGoals > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.completionPercentage || 0), 0) / totalGoals) 
    : 80;

  const avgReviewScore = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.score), 0) / reviews.length).toFixed(1)
    : "4.9";

  const filteredGoals = useMemo(() => {
    if (statusFilter === "ALL") return goals;
    if (statusFilter === "COMPLETED") return goals.filter(g => g.status === "COMPLETED" || g.completionPercentage >= 100);
    return goals.filter(g => g.status !== "COMPLETED" && g.completionPercentage < 100);
  }, [goals, statusFilter]);

  const filteredGenomeSkills = useMemo(() => {
    if (genomeCategory === "ALL") return genomeSkills;
    return genomeSkills.filter(s => s.category === genomeCategory);
  }, [genomeSkills, genomeCategory]);

  // Radar Chart Calculations (6 Axes)
  const radarAxes = [
    { label: "System Architecture", key: "arch", value: 94, benchmark: 82 },
    { label: "AI Integration", key: "ai", value: 91, benchmark: 76 },
    { label: "Security & Audits", key: "sec", value: 96, benchmark: 80 },
    { label: "Code Velocity", key: "vel", value: 88, benchmark: 84 },
    { label: "Agile Leadership", key: "lead", value: 89, benchmark: 78 },
    { label: "Execution Quality", key: "qual", value: 93, benchmark: 85 }
  ];

  const radarCenter = 120;
  const radarRadius = 90;

  const getCoordinates = (index: number, total: number, valuePct: number, radius = radarRadius) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const r = (radius * valuePct) / 100;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle)
    };
  };

  const subjectPolygonPoints = radarAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, radarAxes.length, axis.value);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const benchmarkPolygonPoints = radarAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, radarAxes.length, axis.benchmark);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Sprint Velocity Burndown Data (12 Weeks)
  const burndownWeeks = [
    { week: "W1", planned: 8, actual: 10 },
    { week: "W2", planned: 16, actual: 20 },
    { week: "W3", planned: 25, actual: 28 },
    { week: "W4", planned: 33, actual: 40 },
    { week: "W5", planned: 42, actual: 46 },
    { week: "W6", planned: 50, actual: 55 },
    { week: "W7", planned: 58, actual: 64 },
    { week: "W8", planned: 67, actual: 75 },
    { week: "W9", planned: 75, actual: 82 },
    { week: "W10", planned: 83, actual: 88 },
    { week: "W11", planned: 92, actual: 94 },
    { week: "W12", planned: 100, actual: 98 }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden gap-2.5 font-sans pop-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/60 dark:border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Performance, OKRs & Competency Genome
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-white/50">
                Quarterly OKR deliverable tracking, competency DNA matrices, velocity burndown curves, and 360° reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Selector */}
          {isAdminOrManager && employees.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.04] py-1 px-2.5 rounded-xl border border-slate-300/60 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-white/40 font-semibold">Subject:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none pr-1 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-white dark:bg-[#121620] text-slate-900 dark:text-white">
                    {emp.firstName} {emp.lastName} ({emp.designation?.split(" ")[0] || "Staff"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Goal Button */}
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add OKR</span>
          </button>

          {/* File Review Button (Manager/Admin) */}
          {isAdminOrManager && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>File Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        {/* KPI 1: Overall OKR Completion Rate */}
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between pop-card">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Overall OKR Execution</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{overallCompletionRate}%</h3>
              <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14% vs Q3
              </span>
            </div>
            <span className="text-[9.5px] text-slate-500 dark:text-white/40">{completedGoals} of {totalGoals} Delivered</span>
          </div>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90">
              <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" className="text-slate-200 dark:text-white/10" fill="transparent" />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={(2 * Math.PI * 18) * (1 - overallCompletionRate / 100)}
                strokeLinecap="round"
                className="text-orange-500"
                fill="transparent"
              />
            </svg>
            <Target className="w-4 h-4 text-orange-500 absolute" />
          </div>
        </div>

        {/* KPI 2: Competency Index Rating */}
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between pop-card">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Competency Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{avgReviewScore}</h3>
              <span className="text-[10px] text-slate-500 dark:text-white/40">/ 5.0</span>
            </div>
            <span className="text-[9.5px] text-emerald-500 font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" /> Top 5% Benchmark
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Active Objectives */}
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between pop-card">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Active Objectives</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{inProgressGoals} In Flight</h3>
            </div>
            <span className="text-[9.5px] text-amber-500 font-bold">100% On Schedule</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Skill Genome Maturity Level */}
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between pop-card">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Genome Maturity</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Level 5 Lead</h3>
            </div>
            <span className="text-[9.5px] text-indigo-400 font-bold">94.2% Capability Matrix</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Dna className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View Selector Tabs */}
      <div className="flex items-center gap-2 shrink-0 border-b border-slate-200/60 dark:border-white/5 pb-1">
        <button
          onClick={() => setActiveTab("okrs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "okrs"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Strategic OKRs & Velocity Curve</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/15 text-white">{goals.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("genome")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "genome"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <Dna className="w-3.5 h-3.5" />
          <span>Competency Radar & Skill Genome</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/15 text-white">{genomeSkills.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>360° Evaluations & Scorecards</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/15 text-white">{reviews.length}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: STRATEGIC OKRS & VELOCITY CURVE
          ========================================================================= */}
      {activeTab === "okrs" && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
          {/* Left Column (7 cols): Interactive OKR List */}
          <div className="lg:col-span-7 glass-card p-3 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Header Filter */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Deliverable Milestones ({filteredGoals.length})
                </h2>
              </div>

              {/* Status Pill Filters */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.04] p-0.5 rounded-xl border border-slate-300/60 dark:border-white/10">
                {(["ALL", "IN_PROGRESS", "COMPLETED"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                      statusFilter === s
                        ? "bg-orange-500 text-white shadow-xs"
                        : "text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Flight" : "Done"}
                  </button>
                ))}
              </div>
            </div>

            {/* OKR Cards Scroll Track */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {filteredGoals.map((g) => {
                const isDone = g.completionPercentage >= 100 || g.status === "COMPLETED";
                return (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.04] hover:border-orange-500/30 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                        }`}>
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{g.title}</h3>
                          <p className="text-[10px] text-slate-500 dark:text-white/60 mt-0.5 leading-relaxed">
                            {g.description}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                        isDone
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                      }`}>
                        {isDone ? "DELIVERED" : `${g.completionPercentage}% ON TRACK`}
                      </span>
                    </div>

                    {/* Progress Bar & Real-Time Slider Action */}
                    <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-slate-200/60 dark:border-white/5">
                      <div className="flex-1 bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? "bg-emerald-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
                          }`}
                          style={{ width: `${g.completionPercentage}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-white shrink-0">
                        {g.completionPercentage}%
                      </span>

                      {/* Interactive Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isDone && (
                          <button
                            onClick={() => handleUpdateGoalProgress(g.id, (g.completionPercentage || 0) + 10)}
                            className="px-2 py-0.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-[9px] font-bold text-orange-500 transition-all cursor-pointer"
                            title="Add 10% progress"
                          >
                            +10%
                          </button>
                        )}

                        {!isDone ? (
                          <button
                            onClick={() => handleUpdateGoalProgress(g.id, 100)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-[9px] font-bold text-emerald-600 hover:text-white dark:text-emerald-400 transition-all cursor-pointer flex items-center gap-0.5"
                            title="Mark as 100% Complete"
                          >
                            <Check className="w-2.5 h-2.5" /> Done
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateGoalProgress(g.id, 0)}
                            className="px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-white/10 text-[9px] font-bold text-slate-600 dark:text-white/60 hover:text-white transition-all cursor-pointer"
                            title="Reset for testing"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Dynamic Burndown Curve & Milestone Checkpoints */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 overflow-hidden">
            {/* Dynamic Velocity Burndown SVG Area Chart */}
            <div className="glass-card p-3 rounded-2xl flex flex-col justify-between pop-card">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Quarterly Sprint Burndown
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="flex items-center gap-1 text-orange-400">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Actual Velocity
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full border border-dashed border-white/60" /> Target
                  </span>
                </div>
              </div>

              {/* Responsive SVG Area Chart */}
              <div className="w-full h-36 relative">
                <svg viewBox="0 0 340 140" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b2c" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ff6b2c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 35, 70, 105, 140].map((y, idx) => (
                    <line key={idx} x1="20" y1={y} x2="330" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  ))}

                  {/* Planned Target Line (Dashed) */}
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    points={burndownWeeks.map((d, i) => `${20 + i * 28},${140 - (d.planned * 1.3)}`).join(" ")}
                  />

                  {/* Actual Delivered Fill Area */}
                  <polygon
                    fill="url(#velocityGrad)"
                    points={`20,140 ${burndownWeeks.map((d, i) => `${20 + i * 28},${140 - (d.actual * 1.3)}`).join(" ")} 328,140`}
                  />

                  {/* Actual Delivered Line */}
                  <polyline
                    fill="none"
                    stroke="#ff6b2c"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={burndownWeeks.map((d, i) => `${20 + i * 28},${140 - (d.actual * 1.3)}`).join(" ")}
                  />

                  {/* Interactive Dot Markers */}
                  {burndownWeeks.map((d, i) => (
                    <g key={i} className="cursor-pointer group">
                      <circle
                        cx={20 + i * 28}
                        cy={140 - (d.actual * 1.3)}
                        r="3.5"
                        fill="#ff6b2c"
                        stroke="#fff"
                        strokeWidth="1.5"
                        className="transition-transform group-hover:r-5"
                      />
                    </g>
                  ))}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[8.5px] font-mono text-slate-500 dark:text-white/40 pt-1 px-1">
                  <span>W1 (Kickoff)</span>
                  <span>W4 (Sprint 2)</span>
                  <span>W8 (Mid-Q)</span>
                  <span>W12 (Release)</span>
                </div>
              </div>
            </div>

            {/* OKR Velocity Insights Card */}
            <div className="glass-card p-3 rounded-2xl flex-1 flex flex-col justify-between pop-card">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Strategic Sprint Checkpoints
              </span>

              <div className="space-y-2 mt-1">
                <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Argon2 Password Hashing & Audit Chaining</div>
                    <div className="text-[9.5px] text-slate-500 dark:text-white/40">Sprint 8 Objective · Production Ready</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">90% Done</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Redis STOMP Biometric Gateway</div>
                    <div className="text-[9.5px] text-slate-500 dark:text-white/40">Sprint 9 Objective · In Progress</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">75% Done</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-white/40">
                <span>Team Velocity Index: <strong>48 pts / sprint</strong></span>
                <span className="text-emerald-400 font-bold">Velocity Surpassing SLA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COMPETENCY RADAR & SKILL GENOME MATRIX
          ========================================================================= */}
      {activeTab === "genome" && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
          {/* Left Column (5 cols): Interactive 6-Axis Radar Spider Chart */}
          <div className="lg:col-span-5 glass-card p-3 rounded-2xl flex flex-col justify-between pop-card">
            <div className="flex items-center justify-between mb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Competency Radar (6-Axis)
                </h3>
              </div>

              <button
                onClick={() => setShowBenchmark(!showBenchmark)}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${
                  showBenchmark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    : "bg-white/5 text-white/50 border-white/10"
                }`}
              >
                {showBenchmark ? "Benchmark ON" : "Benchmark OFF"}
              </button>
            </div>

            {/* SVG Radar */}
            <div className="flex-1 flex items-center justify-center relative">
              <svg viewBox="0 0 240 240" className="w-60 h-60 overflow-visible">
                {/* Concentric Grid Rings (25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
                  const ringPoints = radarAxes
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, radarAxes.length, level * 100);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={idx}
                      points={ringPoints}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 6 Radial Axes */}
                {radarAxes.map((_, i) => {
                  const { x, y } = getCoordinates(i, radarAxes.length, 100);
                  return (
                    <line
                      key={i}
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={x}
                      y2={y}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Team Benchmark Polygon (Indigo) */}
                {showBenchmark && (
                  <polygon
                    points={benchmarkPolygonPoints}
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Subject Candidate Polygon (Warm Orange) */}
                <polygon
                  points={subjectPolygonPoints}
                  fill="rgba(255, 107, 44, 0.45)"
                  stroke="#ff6b2c"
                  strokeWidth="2.5"
                />

                {/* Interactive Points on Vertices */}
                {radarAxes.map((axis, i) => {
                  const { x, y } = getCoordinates(i, radarAxes.length, axis.value);
                  const isHovered = hoveredAxis === axis.key;
                  return (
                    <g key={i} onMouseEnter={() => setHoveredAxis(axis.key)} onMouseLeave={() => setHoveredAxis(null)} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        fill="#ff6b2c"
                        stroke="#fff"
                        strokeWidth="1.5"
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {radarAxes.map((axis, i) => {
                  const { x, y } = getCoordinates(i, radarAxes.length, 118);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-700 dark:fill-white/70 text-[8.5px] font-bold"
                    >
                      {axis.label} ({axis.value}%)
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Radar Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] pt-1 border-t border-slate-200/60 dark:border-white/5">
              <span className="flex items-center gap-1.5 font-bold text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" /> Candidate DNA (Avg 93.5%)
              </span>
              {showBenchmark && (
                <span className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Engineering Benchmark (80.8%)
                </span>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Skill Genome DNA Matrix */}
          <div className="lg:col-span-7 glass-card p-3 rounded-2xl flex flex-col justify-between overflow-hidden pop-card">
            {/* Header & Category Pills */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Skill Genome DNA Matrix ({filteredGenomeSkills.length})
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 text-[9.5px]">
                {["ALL", "Architecture", "AI & Systems", "Security", "Leadership"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGenomeCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      genomeCategory === cat
                        ? "bg-orange-500 text-white"
                        : "bg-slate-200/60 dark:bg-white/[0.04] text-slate-600 dark:text-white/50 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Genome Cards Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
              {filteredGenomeSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] hover:border-orange-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono text-orange-400 uppercase tracking-wider">
                        {skill.category}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-indigo-500/15 text-indigo-300">
                        {skill.level}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{skill.name}</h4>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-slate-500 dark:text-white/40">Proficiency Mastery</span>
                      <span className="font-bold text-orange-400 font-mono">{skill.proficiency}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[9.5px] text-slate-500 dark:text-white/40">
                      <span>{skill.growth}</span>
                      <button
                        onClick={() => handleEndorseSkill(skill.id)}
                        className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold transition-all cursor-pointer"
                        title="Endorse this competency"
                      >
                        <ThumbsUp className="w-2.5 h-2.5" />
                        <span>{skill.endorsements} Endorsements</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 360° EVALUATIONS & SCORECARDS
          ========================================================================= */}
      {activeTab === "reviews" && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
          {/* Left Column (8 cols): Signed Reviews Feed */}
          <div className="lg:col-span-8 glass-card p-3 rounded-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Verified Executive & Peer Reviews ({reviews.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono">
                Cryptographically Signed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{r.reviewerName || "Executive Reviewer"}</span>
                      <div className="text-[10px] text-orange-400 font-medium">{r.reviewPeriod}</div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      <span>{r.score} / 5.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-white/70 italic leading-relaxed">
                    &quot;{r.feedback}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[9.5px] text-slate-400 dark:text-white/40 pt-1 border-t border-slate-200/60 dark:border-white/5">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" /> Signed & Approved
                    </span>
                    <span>Status: {r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (4 cols): Performance Rubric Scorecard */}
          <div className="lg:col-span-4 glass-card p-3.5 rounded-2xl flex flex-col justify-between pop-card">
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Performance Benchmark
              </span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{avgReviewScore}</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/60 mt-0.5">
                Eligible for Tier 1 Annual Bonus and Principal Architect track.
              </p>
            </div>

            <div className="space-y-2 my-2 py-2 border-y border-slate-200/60 dark:border-white/5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-white/50">Technical Mastery</span>
                <span className="font-bold text-emerald-400">96 / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-white/50">Sprint Commitment Ratio</span>
                <span className="font-bold text-emerald-400">98.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-white/50">Peer Net Promoter Score</span>
                <span className="font-bold text-indigo-400">+84</span>
              </div>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Performance Evaluation</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: New Strategic OKR */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl pop-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Add Strategic OKR Objective
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
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
                  placeholder="e.g. Optimize Database Partitioning SLA"
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Deliverable Description</label>
                <textarea
                  required
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Key measurable deliverables and business outcome..."
                  rows={3}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Create Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Review */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl pop-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Record Performance Review
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Evaluation Period</label>
                <input
                  type="text"
                  required
                  value={newReview.reviewPeriod}
                  onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value })}
                  placeholder="e.g. Q4 2026 Annual Cycle"
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Score (0.0 - 5.0)</label>
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

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-white/60 uppercase">Detailed Feedback & Citations</label>
                <textarea
                  required
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({ ...newReview, feedback: e.target.value })}
                  placeholder="Highlight key sprint deliveries, architecture contributions, and impact..."
                  rows={3}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
