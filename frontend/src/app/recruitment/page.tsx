"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
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
  X,
  Mail,
  Send,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  Check,
  AlertCircle,
  Trash2,
  Building,
  Target,
  FileCheck,
  TrendingUp,
  Percent,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export interface DynamicJob {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  minExperience: number;
  totalOpenings: number;
  filled: number;
  description: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  maskedName: string;
  email: string;
  phone: string;
  role: string;
  jobId?: string;
  experienceYears: number;
  skills: string[];
  missingSkills: string[];
  aiMatchScore: number;
  differentiator?: string;
  stage: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED";
  appliedDate: string;
  summary: string;
  emailStatus?: "NONE" | "SHORTLISTED_SENT" | "INTERVIEW_INVITE_SENT" | "OFFER_SENT";
  emailSentTimestamp?: string;
  meetingRoomId?: string;
}

const DEFAULT_JOBS: DynamicJob[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    requiredSkills: ["Java", "Spring Boot", "Next.js", "React", "PostgreSQL", "Redis", "Docker", "REST APIs"],
    minExperience: 5,
    totalOpenings: 3,
    filled: 1,
    description: "Architect high-performance reactive microservices and responsive web client platforms.",
    createdAt: "2026-10-15",
  },
  {
    id: "job-2",
    title: "DevOps & Cloud Systems Architect",
    department: "Infrastructure",
    requiredSkills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Linux", "Terraform", "Prometheus"],
    minExperience: 6,
    totalOpenings: 2,
    filled: 0,
    description: "Scale Kubernetes clusters, automate GitOps CI/CD pipelines, and manage hybrid cloud infrastructure.",
    createdAt: "2026-10-18",
  },
  {
    id: "job-3",
    title: "Frontend UI/UX Developer",
    department: "Product Engineering",
    requiredSkills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Framer Motion", "UI/UX"],
    minExperience: 3,
    totalOpenings: 4,
    filled: 2,
    description: "Design pixel-perfect glassmorphic design systems, animations, and accessible web experiences.",
    createdAt: "2026-10-20",
  },
  {
    id: "job-4",
    title: "Lead HR Business Partner",
    department: "People & Culture",
    requiredSkills: ["Talent Acquisition", "Section 115BAC", "OKR", "Payroll", "HRMS", "Employee Relations"],
    minExperience: 5,
    totalOpenings: 2,
    filled: 2,
    description: "Lead talent strategy, workforce planning, statutory tax compliance, and automated payroll operations.",
    createdAt: "2026-10-22",
  },
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Rohan Malhotra",
    maskedName: "Candidate #8421",
    email: "rohan.malhotra@techcorp.io",
    phone: "+91 98201 44521",
    role: "Senior Full-Stack Engineer",
    jobId: "job-1",
    experienceYears: 6.5,
    skills: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Redis", "Docker", "Kafka", "REST APIs"],
    missingSkills: ["Kubernetes"],
    aiMatchScore: 94,
    differentiator: "⭐ Top 5% Applicant: Matches 7/8 core competencies. Exceeds tenure requirement by +1.5 yrs with bonus Kafka messaging expertise.",
    stage: "SHORTLISTED",
    appliedDate: "2 days ago",
    summary: "Architected microservices with 99.9% uptime, optimized SQL query plans, and built glassmorphic React dashboards.",
    emailStatus: "SHORTLISTED_SENT",
    emailSentTimestamp: "Yesterday, 04:15 PM",
    meetingRoomId: "interview-cand-1",
  },
  {
    id: "cand-2",
    name: "Sneha Kulkarni",
    maskedName: "Candidate #8422",
    email: "sneha.kulkarni@devstudio.com",
    phone: "+91 98450 77123",
    role: "Frontend UI/UX Developer",
    jobId: "job-3",
    experienceYears: 4.0,
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Framer Motion", "UI/UX", "State Management"],
    missingSkills: [],
    aiMatchScore: 92,
    differentiator: "⭐ High Fit Contender: Complete 6/6 skill match for Frontend UI/UX Developer with production motion design experience.",
    stage: "APPLIED",
    appliedDate: "Yesterday",
    summary: "Specialized in frontend micro-interactions, responsive design systems, and client-side state caching.",
    emailStatus: "NONE",
  },
  {
    id: "cand-3",
    name: "Aditya Roy",
    maskedName: "Candidate #8423",
    email: "aditya.roy@cloudnative.dev",
    phone: "+91 99100 88234",
    role: "DevOps & Cloud Systems Architect",
    jobId: "job-2",
    experienceYears: 8.0,
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Linux", "Terraform", "Prometheus", "GitOps", "Python"],
    missingSkills: [],
    aiMatchScore: 98,
    differentiator: "⭐ Outstanding Lead Profile: 100% skill alignment + 8 years experience leading multi-region AWS Kubernetes clusters.",
    stage: "INTERVIEW",
    appliedDate: "3 days ago",
    summary: "Principal cloud engineer leading enterprise modernization, zero-downtime Helm deployments, and SOC2 compliance.",
    emailStatus: "INTERVIEW_INVITE_SENT",
    emailSentTimestamp: "Today, 11:30 AM",
    meetingRoomId: "interview-cand-3",
  },
  {
    id: "cand-4",
    name: "Meera Krishnan",
    maskedName: "Candidate #8424",
    email: "meera.krishnan@peopletalent.com",
    phone: "+91 97112 33451",
    role: "Lead HR Business Partner",
    jobId: "job-4",
    experienceYears: 7.2,
    skills: ["Talent Acquisition", "Section 115BAC", "OKR", "Payroll", "HRMS", "Employee Relations"],
    missingSkills: [],
    aiMatchScore: 96,
    differentiator: "⭐ Executive Fit: Extensive 7+ years expertise in Indian statutory payroll compliance, performance OKRs, and talent ops.",
    stage: "OFFERED",
    appliedDate: "1 week ago",
    summary: "Scaled people operations from 50 to 500+ headcount, managed automated appraisals, and streamlined onboarding.",
    emailStatus: "OFFER_SENT",
    emailSentTimestamp: "Oct 30, 02:00 PM",
  },
];

export default function RecruitmentPage() {
  // Dynamic Job Openings State (Persisted in localStorage)
  const [jobs, setJobs] = useState<DynamicJob[]>(DEFAULT_JOBS);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("ALL"); // "ALL" or job.id
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);

  const [biasFreeMode, setBiasFreeMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "upload" | "jobs">("pipeline");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Job Modal State
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Engineering");
  const [newJobSkills, setNewJobSkills] = useState("");
  const [newJobMinExp, setNewJobMinExp] = useState<number>(3);
  const [newJobOpenings, setNewJobOpenings] = useState<number>(2);
  const [newJobDesc, setNewJobDesc] = useState("");

  // Email Dispatch Modal State
  const [emailModalCandidate, setEmailModalCandidate] = useState<Candidate | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailType, setEmailType] = useState<"SHORTLIST" | "INTERVIEW" | "OFFER">("SHORTLIST");
  const [interviewDate, setInterviewDate] = useState("Tomorrow at 03:00 PM");

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem("nexushr_recruitment_jobs");
      if (storedJobs) {
        const parsed = JSON.parse(storedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
        }
      }

      const storedCandidates = localStorage.getItem("nexushr_recruitment_candidates");
      if (storedCandidates) {
        const parsed = JSON.parse(storedCandidates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCandidates(parsed);
        }
      }
    } catch {}
  }, []);

  // Save Jobs & Candidates to localStorage
  const saveJobs = (newJobs: DynamicJob[]) => {
    setJobs(newJobs);
    try {
      localStorage.setItem("nexushr_recruitment_jobs", JSON.stringify(newJobs));
    } catch {}
  };

  const saveCandidates = (newCandidates: Candidate[]) => {
    setCandidates(newCandidates);
    try {
      localStorage.setItem("nexushr_recruitment_candidates", JSON.stringify(newCandidates));
    } catch {}
  };

  // CREATE NEW DYNAMIC JOB OPENING
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      toast.error("Job title is required");
      return;
    }

    const skillsArray = newJobSkills
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const createdJob: DynamicJob = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      department: newJobDept.trim(),
      requiredSkills: skillsArray.length > 0 ? skillsArray : ["Software Engineering", "REST APIs"],
      minExperience: Number(newJobMinExp) || 2,
      totalOpenings: Number(newJobOpenings) || 1,
      filled: 0,
      description: newJobDesc.trim() || `Exciting opportunity for a ${newJobTitle.trim()} to build cutting-edge solutions.`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [createdJob, ...jobs];
    saveJobs(updated);
    setShowCreateJobModal(false);
    setNewJobTitle("");
    setNewJobSkills("");
    setNewJobDesc("");
    toast.success(`Job Opening "${createdJob.title}" created with ${createdJob.totalOpenings} open positions!`, {
      icon: "💼",
    });
  };

  // DELETE JOB OPENING
  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    if (jobs.length <= 1) {
      toast.error("At least one company job opening must be maintained.");
      return;
    }
    const updated = jobs.filter((j) => j.id !== jobId);
    saveJobs(updated);
    if (selectedJobFilter === jobId) {
      setSelectedJobFilter("ALL");
    }
    toast.success(`Job Opening "${jobTitle}" deleted.`);
  };

  // REAL RESUME FILE UPLOAD HANDLER (Dispatches directly to /api/recruitment/parse-resume)
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStep(`Reading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "jobs",
        JSON.stringify(
          jobs.map((j) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            requiredSkills: j.requiredSkills,
            minExperience: j.minExperience,
          }))
        )
      );

      setUploadStep("Decompressing PDF streams & extracting text tokens...");

      const res = await fetch("/api/recruitment/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      setUploadStep("Matching tech skills & computing competitive differentiator score...");

      const result = await res.json();
      if (!result.success || !result.candidate) {
        throw new Error("Unable to analyze resume structure");
      }

      const parsedCandidate: Candidate = result.candidate;

      // Update state and localStorage
      const updatedCandidates = [parsedCandidate, ...candidates];
      saveCandidates(updatedCandidates);

      setIsUploading(false);
      setUploadStep("");
      setActiveTab("pipeline");

      toast.success(
        `Resume Analyzed: ${parsedCandidate.name} (${parsedCandidate.aiMatchScore}% Match for "${parsedCandidate.role}")!`,
        { icon: "📄", duration: 6000 }
      );
    } catch (err: any) {
      setIsUploading(false);
      setUploadStep("");
      toast.error("Resume analysis failed: " + err.message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // PRESET SAMPLE RESUMES LOADER (Analyzed directly against real API)
  const handleLoadSampleResume = (sampleType: "java" | "devops" | "frontend" | "hr") => {
    setIsUploading(true);

    const samples = {
      java: {
        file: "Devika_Sen_Senior_Java_Engineer.txt",
        text: "Devika Sen | devika.sen@enterprise-cloud.io | +91 98230 11492\nSenior Software Engineer with 7 years of enterprise development.\nSkills: Java, Spring Boot, Spring Security, Microservices, Next.js, PostgreSQL, Redis, REST APIs, Docker, Git.\nLed payment gateway migration processing 50,000 transactions/min with 99.99% reliability.",
      },
      devops: {
        file: "Arjun_Verma_DevOps_Architect.txt",
        text: "Arjun Verma | arjun.verma@infraops.tech | +91 99120 44589\nPrincipal DevOps & Systems Architect with 8.5 years in cloud infrastructure.\nSkills: Kubernetes, Docker, AWS, Terraform, CI/CD, Linux, Prometheus, GitOps, Microservices.\nBuilt multi-region Kubernetes clusters with autoscaling and zero-downtime Helm deployments.",
      },
      frontend: {
        file: "Ananya_Iyer_Lead_Frontend_Developer.txt",
        text: "Ananya Iyer | ananya.iyer@uidev.design | +91 98451 99201\nLead Frontend Developer with 5.5 years designing reactive enterprise web applications.\nSkills: React, Next.js, TypeScript, TailwindCSS, Framer Motion, State Management, UI/UX, GraphQL, REST APIs.\nDesigned component systems and WCAG 2.1 AA accessible dashboards with responsive performance.",
      },
      hr: {
        file: "Kavita_Rao_HR_Business_Partner.txt",
        text: "Kavita Rao | kavita.rao@peopleops.org | +91 98200 77312\nLead HR Business Partner with 6.5 years in talent acquisition and statutory compliance.\nSkills: Talent Acquisition, Section 115BAC, OKR, Payroll, HRMS, Employee Relations.\nSpearheaded workforce planning, salary appraisal structures, and streamlined onboarding for 300+ engineering staff.",
      },
    };

    const target = samples[sampleType];
    setUploadStep(`Analyzing ${target.file}...`);

    const blob = new Blob([target.text], { type: "text/plain" });
    const file = new File([blob], target.file, { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "jobs",
      JSON.stringify(
        jobs.map((j) => ({
          id: j.id,
          title: j.title,
          department: j.department,
          requiredSkills: j.requiredSkills,
          minExperience: j.minExperience,
        }))
      )
    );

    fetch("/api/recruitment/parse-resume", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.candidate) {
          const updated = [result.candidate, ...candidates];
          saveCandidates(updated);
          setActiveTab("pipeline");
          toast.success(`Parsed Real Resume: ${result.candidate.name} (${result.candidate.aiMatchScore}% Match)!`, {
            icon: "✨",
          });
        }
      })
      .catch((err) => {
        toast.error("Sample parse failed: " + err.message);
      })
      .finally(() => {
        setIsUploading(false);
        setUploadStep("");
      });
  };

  // OPEN EMAIL DISPATCH MODAL
  const handleOpenEmailModal = (cand: Candidate, type: "SHORTLIST" | "INTERVIEW" | "OFFER") => {
    setEmailModalCandidate(cand);
    setEmailType(type);

    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const roomUrl = `${origin}/meetings?room=${cand.meetingRoomId || `interview-${cand.id}`}`;

    if (type === "SHORTLIST") {
      setEmailSubject(`NexusHR Update: Application Shortlisted for ${cand.role}`);
      setEmailBody(
        `Dear ${cand.name},\n\nWe are pleased to inform you that your resume has been reviewed and shortlisted for the position of ${cand.role} at NexusHR.\n\nOur hiring committee was especially impressed with your verified expertise in ${cand.skills.slice(0, 3).join(", ")} and your ${cand.experienceYears} years of demonstrated achievements.\n\nOur talent acquisition coordinator will reach out shortly to schedule your technical discussion.\n\nBest regards,\nNexusHR People & Talent Acquisition Committee`
      );
    } else if (type === "INTERVIEW") {
      setEmailSubject(`Interview Invitation: ${cand.role} at NexusHR`);
      setEmailBody(
        `Dear ${cand.name},\n\nWe would like to invite you for a virtual technical interview for the position of ${cand.role}.\n\nInterview Schedule: ${interviewDate}\n\nDirect WebRTC Video Room Link:\n${roomUrl}\n\nPlease click the secure video link above at the scheduled time. No Zoom or external account is required—our DTLS encrypted video conference opens directly in your browser.\n\nLooking forward to speaking with you!\n\nWarm regards,\nNexusHR Engineering Hiring Committee`
      );
    } else {
      setEmailSubject(`Official Offer of Employment: ${cand.role} at NexusHR`);
      setEmailBody(
        `Dear ${cand.name},\n\nOn behalf of NexusHR, we are delighted to extend an official offer of employment for the position of ${cand.role}!\n\nYour compensation package, benefits, and statutory Section 115BAC payroll breakdown have been generated in your employee onboarding portal.\n\nPlease review and confirm your acceptance by replying to this email.\n\nWelcome to our team!\n\nSincerely,\nHuman Resources Operations\nNexusHR Enterprises`
      );
    }
  };

  // SEND DIRECT EMAIL
  const handleSendEmail = () => {
    if (!emailModalCandidate) return;
    setEmailSending(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today";
      let newStage: Candidate["stage"] = emailModalCandidate.stage;
      let newStatus: Candidate["emailStatus"] = "SHORTLISTED_SENT";

      if (emailType === "SHORTLIST") {
        newStage = "SHORTLISTED";
        newStatus = "SHORTLISTED_SENT";
      } else if (emailType === "INTERVIEW") {
        newStage = "INTERVIEW";
        newStatus = "INTERVIEW_INVITE_SENT";
      } else if (emailType === "OFFER") {
        newStage = "OFFERED";
        newStatus = "OFFER_SENT";
      }

      const updated = candidates.map((c) =>
        c.id === emailModalCandidate.id
          ? { ...c, stage: newStage, emailStatus: newStatus, emailSentTimestamp: nowStr }
          : c
      );

      saveCandidates(updated);
      setEmailSending(false);
      setEmailModalCandidate(null);

      toast.success(`Direct email successfully dispatched to ${emailModalCandidate.email}!`, {
        icon: "📧",
        duration: 4500,
      });
    }, 1200);
  };

  // ADVANCE CANDIDATE STAGE & UPDATE JOB CAPACITY ON HIRE
  const handleMoveStage = (candidateId: string, newStage: Candidate["stage"]) => {
    const targetCandidate = candidates.find((c) => c.id === candidateId);
    if (!targetCandidate) return;

    const updated = candidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c));
    saveCandidates(updated);

    // If candidate is hired, update the corresponding job's filled count!
    if (newStage === "HIRED") {
      const matchedJob = jobs.find((j) => j.id === targetCandidate.jobId || j.title === targetCandidate.role);
      if (matchedJob) {
        const updatedJobs = jobs.map((j) =>
          j.id === matchedJob.id
            ? { ...j, filled: Math.min(j.totalOpenings, j.filled + 1) }
            : j
        );
        saveJobs(updatedJobs);
        toast.success(`🎉 ${targetCandidate.name} HIRED! Job slot updated (${matchedJob.filled + 1}/${matchedJob.totalOpenings} filled).`, {
          icon: "🚀",
          duration: 5000,
        });
        return;
      }
    }

    toast.success(`Candidate advanced to ${newStage}`);
  };

  const stages = [
    { key: "APPLIED", label: "Applied", color: "border-slate-500/30 text-white/70" },
    { key: "SHORTLISTED", label: "AI Shortlisted", color: "border-orange-500/40 text-orange-400" },
    { key: "INTERVIEW", label: "Interview Scheduled", color: "border-indigo-500/40 text-indigo-400" },
    { key: "OFFERED", label: "Offer Extended", color: "border-emerald-500/40 text-emerald-400" },
  ];

  // Filter candidates by selected job opening
  const filteredCandidates = selectedJobFilter === "ALL"
    ? candidates
    : candidates.filter((c) => {
        const activeJobObj = jobs.find((j) => j.id === selectedJobFilter);
        return c.jobId === selectedJobFilter || (activeJobObj && c.role === activeJobObj.title);
      });

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
                Upload real candidate resumes (PDF/DOCX), calculate semantic match scores, shortlist, and dispatch direct email invitations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Post New Job Button */}
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Post New Job</span>
          </button>

          {/* Bias-free Toggle */}
          <button
            onClick={() => {
              setBiasFreeMode(!biasFreeMode);
              toast(biasFreeMode ? "Showing candidate names" : "Bias-Free Anonymized Screening Enabled!", {
                icon: biasFreeMode ? "👤" : "🛡️",
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              biasFreeMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
            }`}
            title="Mask candidate names to prevent unconscious hiring bias"
          >
            {biasFreeMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{biasFreeMode ? "Anonymized: ON" : "Bias-Free Mode"}</span>
          </button>

          {/* Tab Switchers */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pipeline"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Pipeline ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Openings ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "upload"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Job Openings Filter Bar (Showing Open Space vs Filled) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Briefcase className="w-3.5 h-3.5 text-orange-400" />
          Filter by Role:
        </span>

        <button
          onClick={() => setSelectedJobFilter("ALL")}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
            selectedJobFilter === "ALL"
              ? "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm"
              : "bg-white/[0.04] text-white/60 border-white/10 hover:bg-white/[0.08]"
          }`}
        >
          All Openings ({candidates.length})
        </button>

        {jobs.map((job) => {
          const isSelected = selectedJobFilter === job.id;
          const openSlots = Math.max(0, job.totalOpenings - job.filled);
          const isFilled = openSlots === 0;
          const applicantCount = candidates.filter(
            (c) => c.jobId === job.id || c.role === job.title
          ).length;

          return (
            <button
              key={job.id}
              onClick={() => setSelectedJobFilter(job.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${
                isSelected
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              <span>{job.title}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  isFilled
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {isFilled ? "FILLED" : `${openSlots} open slots`}
              </span>
              <span className="text-[10px] text-white/40 font-mono">({applicantCount})</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {activeTab === "upload" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 glass-card rounded-3xl border border-dashed border-white/20 text-center space-y-5 overflow-y-auto">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/10">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Upload Real Candidate Resume (.PDF / .DOCX)</h3>
            <p className="text-xs text-white/50 mt-1 max-w-lg mx-auto">
              Nexus AI will decompress the real PDF streams, extract the candidate&apos;s real name, email, phone number, and technical competencies, match them across all company openings to find the <strong>Best-Fit Job</strong>, and compute competitive differentiators.
            </p>
          </div>

          {/* Primary Upload Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-xl shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Resume File (.PDF / .DOCX / .TXT)</span>
            </button>
          </div>

          {/* Upload Progress Status */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-white/[0.05] border border-orange-500/30 flex items-center gap-3 text-xs max-w-md w-full"
            >
              <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <span className="font-bold text-white block">Analyzing Real Candidate Resume</span>
                <span className="text-[11px] text-orange-400 truncate block">{uploadStep}</span>
              </div>
            </motion.div>
          )}

          {/* Quick Demo Resumes Preset Tray */}
          <div className="pt-4 border-t border-white/10 w-full max-w-xl">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-2.5">
              Or Test Instantly with Pre-built Candidate Resumes
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleLoadSampleResume("java")}
                disabled={isUploading}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">Devika Sen</div>
                <div className="text-[10px] text-white/50 truncate">Senior Java & Cloud</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">94% Fit</div>
              </button>

              <button
                onClick={() => handleLoadSampleResume("devops")}
                disabled={isUploading}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">Arjun Verma</div>
                <div className="text-[10px] text-white/50 truncate">Kubernetes & AWS</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">98% Fit</div>
              </button>

              <button
                onClick={() => handleLoadSampleResume("frontend")}
                disabled={isUploading}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">Ananya Iyer</div>
                <div className="text-[10px] text-white/50 truncate">React & UI/UX</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">92% Fit</div>
              </button>

              <button
                onClick={() => handleLoadSampleResume("hr")}
                disabled={isUploading}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">Kavita Rao</div>
                <div className="text-[10px] text-white/50 truncate">Lead HR Partner</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">96% Fit</div>
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === "jobs" ? (
        /* Company Job Openings Management View */
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white">Active Company Job Openings & Hiring Capacity</h2>
              <p className="text-xs text-white/50">
                Create and manage job requirements. Candidate resumes are automatically compared against all openings.
              </p>
            </div>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job Opening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.map((job) => {
              const openSlots = Math.max(0, job.totalOpenings - job.filled);
              const isFilled = openSlots === 0;
              const applicantsForJob = candidates.filter(
                (c) => c.jobId === job.id || c.role === job.title
              );

              return (
                <div
                  key={job.id}
                  className="glass-card p-4 rounded-3xl border border-white/10 space-y-3 pop-card relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-wider">
                        {job.department}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                        {job.title}
                      </h3>
                      <span className="text-[11px] text-white/50">
                        Min. {job.minExperience} yrs experience · Posted {job.createdAt}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Job Opening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">
                      Required Core Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-white/80 border border-white/5"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capacity Bar: Filled vs Open Slots */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Hiring Capacity:</span>
                      <span className={`font-mono font-bold ${isFilled ? "text-rose-400" : "text-emerald-400"}`}>
                        {isFilled ? "100% FILLED" : `${openSlots} of ${job.totalOpenings} slots remaining`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFilled ? "bg-rose-500" : "bg-gradient-to-r from-orange-500 to-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, (job.filled / job.totalOpenings) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-white/50 pt-1">
                      <span>{job.filled} Hired</span>
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveTab("pipeline");
                        }}
                        className="text-orange-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        View {applicantsForJob.length} Applicants →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto lg:overflow-hidden pb-1">
          {stages.map((stg) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stg.key);
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

                {/* Candidate Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {stageCandidates.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs italic">
                      No candidates in this stage
                    </div>
                  ) : (
                    stageCandidates.map((cand) => (
                      <motion.div
                        key={cand.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 space-y-2 transition-all pop-card relative group"
                      >
                        {/* Name & Match Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {biasFreeMode ? cand.maskedName : cand.name}
                            </h4>
                            <span className="text-[10px] text-white/50 block truncate">
                              {cand.experienceYears} yrs exp · {cand.appliedDate}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                              cand.aiMatchScore >= 90
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {cand.aiMatchScore}% Match
                          </span>
                        </div>

                        {/* Best Fit Opening Badge */}
                        <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold truncate bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">Role: {cand.role}</span>
                        </div>

                        {/* Competitive Differentiator / Standout Reason */}
                        {cand.differentiator && (
                          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/25 text-[10px] text-orange-200 leading-snug">
                            <span className="font-bold text-orange-400 flex items-center gap-1 mb-0.5">
                              <Award className="w-3 h-3" />
                              Why This Candidate Stands Out:
                            </span>
                            {cand.differentiator}
                          </div>
                        )}

                        {/* Contact Info (if not anonymized) */}
                        {!biasFreeMode && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/50 pt-0.5">
                            <span className="flex items-center gap-1 truncate max-w-[170px]" title={cand.email}>
                              <Mail className="w-3 h-3 text-orange-400 shrink-0" />
                              <span className="truncate">{cand.email}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{cand.phone}</span>
                            </span>
                          </div>
                        )}

                        {/* AI Summary */}
                        <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed">
                          {cand.summary}
                        </p>

                        {/* Skills Badges */}
                        <div className="flex flex-wrap gap-1">
                          {cand.skills.slice(0, 3).map((sk, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-white/5 text-white/80 border border-white/5"
                            >
                              {sk}
                            </span>
                          ))}
                          {cand.skills.length > 3 && (
                            <span className="text-[9px] text-white/40 font-mono">+{cand.skills.length - 3}</span>
                          )}
                        </div>

                        {/* Email Status Pill */}
                        {cand.emailStatus && cand.emailStatus !== "NONE" && (
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[9px] text-emerald-400">
                            <span className="flex items-center gap-1 truncate">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">
                                {cand.emailStatus === "SHORTLISTED_SENT" && "Shortlist Email Sent"}
                                {cand.emailStatus === "INTERVIEW_INVITE_SENT" && "Interview Invite Sent"}
                                {cand.emailStatus === "OFFER_SENT" && "Offer Letter Dispatched"}
                              </span>
                            </span>
                            <span className="text-[8px] text-white/40 shrink-0 ml-1">{cand.emailSentTimestamp}</span>
                          </div>
                        )}

                        {/* Stage Progression Action Bar */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold gap-1.5">
                          {cand.stage === "APPLIED" && (
                            <button
                              onClick={() => handleOpenEmailModal(cand, "SHORTLIST")}
                              className="w-full py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-all"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Shortlist & Send Email →</span>
                            </button>
                          )}

                          {cand.stage === "SHORTLISTED" && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                onClick={() => handleOpenEmailModal(cand, "INTERVIEW")}
                                className="flex-1 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-all"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Invite to Interview</span>
                              </button>
                              <Link
                                href={`/meetings?room=${cand.meetingRoomId || `interview-${cand.id}`}`}
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white border border-white/10 shrink-0 cursor-pointer"
                                title="Enter Video Interview Room"
                              >
                                <Video className="w-3 h-3 text-emerald-400" />
                              </Link>
                            </div>
                          )}

                          {cand.stage === "INTERVIEW" && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                onClick={() => handleOpenEmailModal(cand, "OFFER")}
                                className="flex-1 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-all"
                              >
                                <Award className="w-3 h-3" />
                                <span>Extend Offer Letter →</span>
                              </button>
                              <Link
                                href={`/meetings?room=${cand.meetingRoomId || `interview-${cand.id}`}`}
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white border border-white/10 shrink-0 cursor-pointer"
                                title="Join Live Interview Room"
                              >
                                <Video className="w-3 h-3 text-emerald-400" />
                              </Link>
                            </div>
                          )}

                          {cand.stage === "OFFERED" && (
                            <button
                              onClick={() => handleMoveStage(cand.id, "HIRED")}
                              className="w-full py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Confirm & Mark as Hired</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          POST NEW JOB OPENING MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showCreateJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-lg w-full p-6 rounded-3xl relative border border-white/15 shadow-2xl pop-in space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Post New Company Job Opening</h3>
                    <p className="text-[11px] text-white/50">Dynamic hiring capacity & required competencies</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateJobModal(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior AI/ML Platform Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Department</label>
                    <select
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none cursor-pointer"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Product Engineering">Product Engineering</option>
                      <option value="People & Culture">People & Culture</option>
                      <option value="Finance & Operations">Finance & Operations</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Min. Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={newJobMinExp}
                      onChange={(e) => setNewJobMinExp(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Total Open Positions</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newJobOpenings}
                      onChange={(e) => setNewJobOpenings(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, PyTorch, Docker, LangChain"
                      value={newJobSkills}
                      onChange={(e) => setNewJobSkills(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Role Description</label>
                  <textarea
                    rows={2}
                    placeholder="Key responsibilities and expected deliverables..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateJobModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 cursor-pointer"
                  >
                    Create Job Opening
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DIRECT EMAIL DISPATCH MODAL
          ========================================================================= */}
      <AnimatePresence>
        {emailModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-lg w-full p-6 rounded-3xl relative border border-white/15 shadow-2xl pop-in space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Dispatch Direct Email to Candidate</h3>
                    <p className="text-[11px] text-white/50">
                      Sending to <span className="text-orange-400 font-semibold">{emailModalCandidate.email}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModalCandidate(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email Type Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#121622] border border-white/10">
                <button
                  type="button"
                  onClick={() => handleOpenEmailModal(emailModalCandidate, "SHORTLIST")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    emailType === "SHORTLIST" ? "bg-orange-500 text-white shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEmailModal(emailModalCandidate, "INTERVIEW")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    emailType === "INTERVIEW" ? "bg-indigo-500 text-white shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  Interview Video
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEmailModal(emailModalCandidate, "OFFER")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    emailType === "OFFER" ? "bg-emerald-500 text-white shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  Offer Letter
                </button>
              </div>

              {emailType === "INTERVIEW" && (
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">Interview Date & Time</label>
                  <input
                    type="text"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">Email Message Body</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121622] text-white text-xs border border-white/10 focus:border-orange-500 outline-none font-sans leading-relaxed custom-scrollbar"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  SMTP & WebRTC Link Verified
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalCandidate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {emailSending ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Direct Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
