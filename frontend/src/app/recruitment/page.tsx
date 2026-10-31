"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Users,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  Search,
  Plus,
  Video,
  Award,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Candidate {
  id: string;
  name: string;
  maskedName: string;
  role: string;
  experienceYears: number;
  skills: string[];
  missingSkills: string[];
  aiMatchScore: number;
  stage: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED";
  appliedDate: string;
  summary: string;
}

export default function RecruitmentPage() {
  const [selectedJob, setSelectedJob] = useState("Senior Full-Stack Engineer");
  const [biasFreeMode, setBiasFreeMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "upload">("pipeline");

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "cand-1",
      name: "Rohan Malhotra",
      maskedName: "Candidate #8421",
      role: "Senior Full-Stack Engineer",
      experienceYears: 6.5,
      skills: ["Java Spring Boot", "Next.js", "PostgreSQL", "Redis", "Docker", "Kafka"],
      missingSkills: ["Kubernetes"],
      aiMatchScore: 94,
      stage: "SHORTLISTED",
      appliedDate: "2 days ago",
      summary: "Architected microservices with 99.9% uptime, optimized SQL query plans, and built glassmorphic React dashboards.",
    },
    {
      id: "cand-2",
      name: "Sneha Kulkarni",
      maskedName: "Candidate #8422",
      role: "Senior Full-Stack Engineer",
      experienceYears: 5.0,
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "TailwindCSS"],
      missingSkills: ["Java Spring Boot", "Redis Pub/Sub"],
      aiMatchScore: 78,
      stage: "APPLIED",
      appliedDate: "Yesterday",
      summary: "Specialized in frontend micro-interactions, responsive design systems, and client-side state caching.",
    },
    {
      id: "cand-3",
      name: "Aditya Roy",
      maskedName: "Candidate #8423",
      role: "Senior Full-Stack Engineer",
      experienceYears: 8.0,
      skills: ["Java", "Spring Boot", "AWS", "Kubernetes", "PostgreSQL", "Redis", "Next.js"],
      missingSkills: [],
      aiMatchScore: 98,
      stage: "INTERVIEW",
      appliedDate: "3 days ago",
      summary: "Principal developer leading enterprise platform modernization and high-concurrency payment gateways.",
    },
    {
      id: "cand-4",
      name: "Meera Krishnan",
      maskedName: "Candidate #8424",
      role: "Lead HR Business Partner",
      experienceYears: 7.2,
      skills: ["Talent Acquisition", "Section 115BAC Statutory Compliance", "OKR Frameworks", "Payroll Systems"],
      missingSkills: [],
      aiMatchScore: 96,
      stage: "OFFERED",
      appliedDate: "1 week ago",
      summary: "Scaled people operations from 50 to 500+ headcount, managed automated appraisals, and streamlined onboarding.",
    },
  ]);

  const stages = [
    { key: "APPLIED", label: "Applied", color: "border-slate-500/30 text-white/70" },
    { key: "SHORTLISTED", label: "AI Shortlisted", color: "border-orange-500/40 text-orange-400" },
    { key: "INTERVIEW", label: "Interview Scheduled", color: "border-indigo-500/40 text-indigo-400" },
    { key: "OFFERED", label: "Offer Extended", color: "border-emerald-500/40 text-emerald-400" },
  ];

  const handleSimulateResumeUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        name: "Devika Sen",
        maskedName: `Candidate #${Math.floor(1000 + Math.random() * 9000)}`,
        role: selectedJob,
        experienceYears: 5.8,
        skills: ["Spring Boot", "React", "Next.js", "PostgreSQL", "REST APIs"],
        missingSkills: ["Kafka"],
        aiMatchScore: 91,
        stage: "SHORTLISTED",
        appliedDate: "Just now",
        summary: "Extracted via AI Parser: Strong expertise in enterprise Java, Spring Boot 3, and modern Next.js frontend state.",
      };
      setCandidates([newCand, ...candidates]);
      setIsUploading(false);
      setActiveTab("pipeline");
      toast.success("Resume parsed by AI: 91% Match Score!");
    }, 1200);
  };

  const handleMoveStage = (candidateId: string, newStage: Candidate["stage"]) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    toast.success(`Candidate moved to ${newStage.replace("_", " ")}`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden gap-3 font-sans pop-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                AI Resume Screener & ATS Talent Pipeline
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </h1>
              <p className="text-xs text-white/50">
                Automated resume semantic scoring, skills gap extraction, and bias-free candidate evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          {/* Bias-free Toggle */}
          <button
            onClick={() => {
              setBiasFreeMode(!biasFreeMode);
              toast(biasFreeMode ? "Bias-Free Mode Disabled (Showing real names)" : "Bias-Free Anonymized Screening Enabled!", {
                icon: biasFreeMode ? "👤" : "🛡️",
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              biasFreeMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
            }`}
            title="Mask names and personal attributes to prevent unconscious hiring bias"
          >
            {biasFreeMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{biasFreeMode ? "Anonymized Mode: ON" : "Bias-Free Mode: OFF"}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => setActiveTab(activeTab === "pipeline" ? "upload" : "pipeline")}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{activeTab === "pipeline" ? "Screen New Resume" : "View Pipeline"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "upload" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 glass-card rounded-3xl border border-dashed border-white/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload Candidate Resume (PDF / DOCX)</h3>
            <p className="text-xs text-white/50 mt-1 max-w-md">
              Nexus AI will extract skills, years of experience, and match score against <strong>{selectedJob}</strong>.
            </p>
          </div>

          <button
            onClick={handleSimulateResumeUpload}
            disabled={isUploading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUploading ? "AI Parsing Resume & Computing Embeddings..." : "Upload & Run AI Screener"}</span>
          </button>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto lg:overflow-hidden pb-1">
          {stages.map((stg) => {
            const stageCandidates = candidates.filter((c) => c.stage === stg.key);
            return (
              <div
                key={stg.key}
                className="glass-card p-3 rounded-2xl flex flex-col overflow-hidden border border-white/5 space-y-2.5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stg.label}</h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {stageCandidates.map((cand) => (
                    <motion.div
                      key={cand.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 space-y-2 transition-all pop-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            {biasFreeMode ? cand.maskedName : cand.name}
                          </h4>
                          <span className="text-[10px] text-white/40 block">
                            {cand.experienceYears} yrs exp · {cand.appliedDate}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            cand.aiMatchScore >= 90
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {cand.aiMatchScore}% Match
                        </span>
                      </div>

                      <p className="text-[10.5px] text-white/60 line-clamp-2 leading-relaxed">
                        {cand.summary}
                      </p>

                      {/* Skills Badges */}
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.slice(0, 3).map((sk, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-white/5 text-white/70"
                          >
                            {sk}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="text-[9px] text-white/40">+{cand.skills.length - 3}</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        {cand.stage === "APPLIED" && (
                          <button
                            onClick={() => handleMoveStage(cand.id, "SHORTLISTED")}
                            className="text-orange-400 hover:underline font-bold"
                          >
                            Shortlist →
                          </button>
                        )}
                        {cand.stage === "SHORTLISTED" && (
                          <Link
                            href="/meetings"
                            className="text-indigo-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <Video className="w-3 h-3" /> Interview Room
                          </Link>
                        )}
                        {cand.stage === "INTERVIEW" && (
                          <button
                            onClick={() => handleMoveStage(cand.id, "OFFERED")}
                            className="text-emerald-400 hover:underline font-bold"
                          >
                            Extend Offer →
                          </button>
                        )}
                        {cand.stage === "OFFERED" && (
                          <span className="text-emerald-400 font-bold">Offer Awaiting Sign</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
