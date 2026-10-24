"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Download,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Users,
  Award,
  ChevronRight,
  GraduationCap,
  Activity,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FileText,
  BarChart2,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import toast from "react-hot-toast";

interface AttritionFactor {
  factorName: string;
  weight: number;
  score: number;
  impactPercentage: number;
  insight: string;
}

interface AttritionPrediction {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  contributingFactors: AttritionFactor[];
  recommendedActions: string[];
  narrative: string;
  source: string;
  generatedAt: string;
}

interface SkillGap {
  departmentName: string;
  designation: string;
  skill: string;
  requiredLevel: number;
  currentProficiency: number;
  gap: number;
  criticality: number;
  priorityScore: number;
  suggestedTraining: string;
}

interface EngagementScore {
  departmentName: string;
  overallScore: number;
  attendanceQuality: number;
  goalProgress: number;
  feedbackScore: number;
  leaveHealth: number;
  trend: "POSITIVE" | "STABLE" | "DECLINING";
  employeeCount: number;
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"attrition" | "skills" | "engagement" | "ai">("attrition");

  // State for data
  const [predictions, setPredictions] = useState<AttritionPrediction[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [engagementScores, setEngagementScores] = useState<EngagementScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Detail for Attrition
  const [selectedPrediction, setSelectedPrediction] = useState<AttritionPrediction | null>(null);

  // Load all intelligence data
  const loadData = async () => {
    try {
      setLoading(true);
      const [predRes, skillRes, engRes] = await Promise.allSettled([
        api.get("/analytics/attrition/predictions"),
        api.get("/analytics/skills/gaps"),
        api.get("/analytics/engagement/scores"),
      ]);

      if (predRes.status === "fulfilled") {
        setPredictions(predRes.value.data || []);
      }
      if (skillRes.status === "fulfilled") {
        setSkillGaps(skillRes.value.data || []);
      }
      if (engRes.status === "fulfilled") {
        setEngagementScores(engRes.value.data || []);
      }
    } catch (err: any) {
      toast.error("Failed to load workforce intelligence telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate Model
  const handleRefreshModel = async () => {
    setRefreshing(true);
    try {
      await api.post("/analytics/attrition/refresh");
      toast.success("Workforce attrition telemetry refreshed via deterministic rules engine");
      await loadData();
    } catch (err: any) {
      toast.error("Unable to refresh attrition model: " + (err.response?.data?.message || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  // Export Reports
  const handleExport = async (type: "CSV" | "TEXT") => {
    try {
      toast.loading(`Generating ${type} report...`, { id: "export-load" });
      const res = await api.get(`/analytics/reports/export?type=${type}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: type === "CSV" ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `NexusHR_Workforce_Intelligence_${new Date().toISOString().slice(0, 10)}.${type.toLowerCase() === "csv" ? "csv" : "txt"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} intelligence report exported successfully!`, { id: "export-load" });
    } catch (err: any) {
      toast.error("Failed to export report: " + (err.response?.data?.message || err.message), { id: "export-load" });
    }
  };

  // Filtered Predictions
  const filteredPredictions = predictions.filter((p) => {
    const matchDept = deptFilter === "ALL" || p.departmentName.toLowerCase().includes(deptFilter.toLowerCase());
    const matchRisk = riskFilter === "ALL" || p.riskLevel === riskFilter;
    const matchSearch =
      searchQuery === "" ||
      p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchRisk && matchSearch;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(predictions.map((p) => p.departmentName))).filter(Boolean);

  // Statistics
  const highRiskCount = predictions.filter((p) => p.riskLevel === "HIGH").length;
  const mediumRiskCount = predictions.filter((p) => p.riskLevel === "MEDIUM").length;
  const avgRiskScore =
    predictions.length > 0
      ? (predictions.reduce((acc, p) => acc + p.riskScore, 0) / predictions.length).toFixed(1)
      : "0.0";

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Workforce Intelligence & AI
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3" />
                M7 Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Predictive Attrition Matrix • Skill-Gap Heatmap • Engagement Telemetry • Zero External Leak Engine
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshModel}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-black/10 dark:border-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Recalculate Attrition Factors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            <span className="hidden sm:inline">Refresh Model</span>
          </button>

          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 transition-all shadow-sm active:scale-95">
              <Download className="w-3.5 h-3.5" />
              <span>Export Brief</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 py-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-black/10 dark:border-white/10 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => handleExport("CSV")}
                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export CSV Dataset</span>
              </button>
              <button
                onClick={() => handleExport("TEXT")}
                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Export Executive Brief</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 pt-3 pb-2 border-b border-black/5 dark:border-white/10 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("attrition")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "attrition"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Attrition Risk Predictor</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20">
            {predictions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "skills"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Skill-Gap Heatmap</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/5 dark:bg-white/10">
            {skillGaps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("engagement")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "engagement"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Workforce Engagement</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/5 dark:bg-white/10">
            {engagementScores.length} Depts
          </span>
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto pt-3 sm:pt-4 pr-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs">Computing workforce intelligence models...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ATTRITION RISK PREDICTOR */}
            {activeTab === "attrition" && (
              <div className="space-y-4">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Evaluated Talent</span>
                    <span className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                      {predictions.length}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                      100% Active Workforce
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col">
                    <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Elevated Risk (≥65)</span>
                    <span className="text-xl sm:text-2xl font-bold mt-1 text-rose-700 dark:text-rose-300">
                      {highRiskCount}
                    </span>
                    <span className="text-[10px] text-rose-500 mt-1">Requires Immediate Retention</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Moderate Risk (35-64)</span>
                    <span className="text-xl sm:text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">
                      {mediumRiskCount}
                    </span>
                    <span className="text-[10px] text-amber-500 mt-1">Monitor Career Velocity</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Avg Turnover Risk</span>
                    <span className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                      {avgRiskScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Deterministic Section 9.5
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search employee, designation, code..."
                        className="w-full bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="ALL">All Departments</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="ALL">All Risk Bands</option>
                      <option value="HIGH">High Risk Only</option>
                      <option value="MEDIUM">Medium Risk Only</option>
                      <option value="LOW">Low Risk Only</option>
                    </select>
                  </div>

                  <span className="text-[11px] text-slate-500 self-center sm:self-auto">
                    Showing {filteredPredictions.length} of {predictions.length} profiles
                  </span>
                </div>

                {/* Attrition Matrix Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPredictions.map((pred) => {
                    const isHigh = pred.riskLevel === "HIGH";
                    const isMedium = pred.riskLevel === "MEDIUM";

                    const badgeColor = isHigh
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : isMedium
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

                    const barColor = isHigh
                      ? "bg-rose-500"
                      : isMedium
                      ? "bg-amber-500"
                      : "bg-emerald-500";

                    return (
                      <div
                        key={pred.employeeId}
                        onClick={() => setSelectedPrediction(pred)}
                        className="group p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800/90 border border-black/5 dark:border-white/10 hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                  {pred.employeeName}
                                </h4>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-500">
                                  {pred.employeeCode}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {pred.designation} • {pred.departmentName}
                              </p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                              {pred.riskLevel}
                            </span>
                          </div>

                          {/* Risk Score Progress Bar */}
                          <div className="mt-3.5 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 text-[11px]">Turnover Probability</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {pred.riskScore.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(100, Math.max(5, pred.riskScore))}%` }}
                              />
                            </div>
                          </div>

                          {/* Contributing Factors Breakdown */}
                          <div className="mt-3.5 space-y-2">
                            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                              Top Contributing Levers
                            </span>
                            <div className="space-y-1.5">
                              {pred.contributingFactors?.slice(0, 2).map((factor, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                                    {factor.factorName}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-slate-400 text-[10px]">
                                      {factor.impactPercentage}% impact
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          <span className="text-[11px]">View Diagnostic Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SKILL-GAP HEATMAP */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Competency Matrix & Skill-Gap Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Evaluated against role benchmark profiles: Priority Score = Net Gap × Criticality Index
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold">
                    {skillGaps.length} Core Skill Tracks
                  </span>
                </div>

                <div className="rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden bg-white/70 dark:bg-slate-900/70 shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/5 dark:bg-white/5 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-black/5 dark:border-white/10">
                        <tr>
                          <th className="py-3 px-4">Department & Role</th>
                          <th className="py-3 px-4">Skill Track</th>
                          <th className="py-3 px-4 text-center">Required Level</th>
                          <th className="py-3 px-4 text-center">Current Level</th>
                          <th className="py-3 px-4 text-center">Net Gap</th>
                          <th className="py-3 px-4 text-center">Criticality</th>
                          <th className="py-3 px-4 text-center">Priority</th>
                          <th className="py-3 px-4">Recommended Learning Pathway</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {skillGaps.map((sg, idx) => {
                          const isHighPriority = sg.priorityScore >= 2.0;
                          return (
                            <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-slate-900 dark:text-white">{sg.designation}</p>
                                <p className="text-[10px] text-slate-400">{sg.departmentName}</p>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                                {sg.skill}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-semibold">
                                Level {sg.requiredLevel} / 5
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                Level {sg.currentProficiency.toFixed(1)} / 5
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  sg.gap > 0.5 ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-emerald-500/15 text-emerald-600"
                                }`}>
                                  -{sg.gap.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                {sg.criticality} ★
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isHighPriority
                                    ? "bg-rose-500 text-white shadow-xs shadow-rose-500/30"
                                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                }`}>
                                  {sg.priorityScore.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                💡 {sg.suggestedTraining}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WORKFORCE ENGAGEMENT */}
            {activeTab === "engagement" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Department Workforce Engagement Telemetry
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Composite formulation: 30% Attendance Quality + 30% OKR Progress + 25% Performance Feedback + 15% Leave Health
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                    Organization Average: 82.4%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {engagementScores.map((dept, idx) => {
                    const isPositive = dept.trend === "POSITIVE";
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {dept.departmentName}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {dept.employeeCount} Total Team Members
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositive
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                {dept.trend}
                              </span>
                              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                                {dept.overallScore.toFixed(0)}/100
                              </span>
                            </div>
                          </div>

                          {/* 4 Factor Gauges */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Attendance Stability</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {dept.attendanceQuality.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${dept.attendanceQuality}%` }}
                                />
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Goal Velocity (OKRs)</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {dept.goalProgress.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${dept.goalProgress}%` }}
                                />
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Performance Reviews</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {dept.feedbackScore.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${dept.feedbackScore}%` }}
                                />
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Leave Balance Health</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {dept.leaveHealth.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${dept.leaveHealth}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DIAGNOSTIC DOSSIER MODAL */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-600/15 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedPrediction.employeeName}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    {selectedPrediction.employeeCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    selectedPrediction.riskLevel === "HIGH"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : selectedPrediction.riskLevel === "MEDIUM"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  }`}>
                    {selectedPrediction.riskLevel} RISK ({selectedPrediction.riskScore.toFixed(1)}%)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPrediction.designation} • {selectedPrediction.departmentName}
                </p>
              </div>

              <button
                onClick={() => setSelectedPrediction(null)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Executive Narrative */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Diagnostic Narrative
                </span>
                <p className="mt-1 text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedPrediction.narrative}
                </p>
              </div>

              {/* Factors Table */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Section 9.5 Factor Breakdown
                </h4>
                <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/5 dark:bg-white/5 text-slate-500 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Predictive Factor</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3 text-center">Weight</th>
                        <th className="py-2.5 px-3 text-center">Impact</th>
                        <th className="py-2.5 px-3">Diagnostic Insight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {selectedPrediction.contributingFactors?.map((f, idx) => (
                        <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {f.factorName}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            {(f.score * 100).toFixed(0)}%
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {(f.weight * 100).toFixed(0)}%
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                            {f.impactPercentage}%
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                            {f.insight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Action Items */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Recommended Retention Interventions
                </h4>
                <div className="space-y-1.5">
                  {selectedPrediction.recommendedActions?.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 leading-normal">
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 transition-opacity"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
