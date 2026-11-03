"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import { useTheme } from "@/lib/theme/theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ShieldCheck,
  Search,
  X,
  UserPlus,
  UserMinus,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  FileCheck2,
  ArrowRight,
  Lock,
  FileText,
  FolderTree,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import LiquidCarveButton from "@/components/ui/LiquidCarveButton";
import { DocumentManagerModal } from "@/components/employee/DocumentManagerModal";
import {
  ENTERPRISE_DEPARTMENTS,
  DEFAULT_5_EMPLOYEES,
  getStoredEmployees,
  isSeededMode,
  saveEmployees,
  appendNewEmployee,
  seedEnterpriseCompanyData,
  resetToFivePersonas
} from "@/lib/demo-data-generator";

const LineSidebar: any = dynamic(() => import("@/components/LineSidebar"), { ssr: false });

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Employee {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation: string;
  status: string;
  hireDate: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  salary?: number;
  metadata?: string;
}

interface EmployeeHistoryItem {
  id: string;
  changeType: string;
  effectiveDate: string;
  remarks?: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.includes("ADMIN") || false;
  const isManager = user?.role?.includes("MANAGER") || false;

  // Filters
  const [selectedDeptIndex, setSelectedDeptIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSeeded, setIsSeeded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals & Drawers
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [createdCredentials, setCreatedCredentials] = useState<{
    code: string;
    email: string;
    provisionalPassword: string;
    name: string;
  } | null>(null);

  const [isOffboardModalOpen, setIsOffboardModalOpen] = useState(false);
  const [selectedEmployeeForOffboard, setSelectedEmployeeForOffboard] = useState<Employee | null>(null);

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<Employee | null>(null);
  const [historyItems, setHistoryItems] = useState<EmployeeHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  const handleOpenDetail = (emp: Employee) => {
    setSelectedEmployeeForDetail(emp);
    setIsDetailDrawerOpen(true);
  };

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [docModalEmployee, setDocModalEmployee] = useState<Employee | null>(null);

  // 5-Step Onboarding Form State
  const [onboardingForm, setOnboardingForm] = useState({
    // Step 1: Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 98200 44321",
    dateOfBirth: "1996-05-14",
    emergencyContact: "+91 98200 99887",

    // Step 2: Job Details
    designation: "Software Engineer",
    departmentId: "",
    managerId: "",
    hireDate: new Date().toISOString().split("T")[0],
    workLocation: "Mumbai Tech Hub",

    // Step 3: Compensation (Indian statutory default breakdown)
    salary: 1500000,
    basicSalary: 750000,
    hra: 375000,
    specialAllowance: 375000,

    // Step 4: System Access & Provisioning
    initialPassword: "",
    sendWelcomeEmail: true,

    // Step 5: Verification & Checklist
    documentsVerified: true,
    taxDeclarationSubmitted: true,
    bankDetailsSubmitted: true,
    complianceAcknowledged: true
  });

  // Offboarding Form State
  const [offboardingForm, setOffboardingForm] = useState({
    exitDate: new Date().toISOString().split("T")[0],
    reason: "Resignation - Career Advancement",
    hardwareReturned: true,
    companyAssetsCleared: true,
    systemAccessRevoked: true,
    exitInterviewCompleted: true,
    remarks: "All handover documentation validated by engineering lead."
  });

  const [newDept, setNewDept] = useState({
    name: "",
    description: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const seeded = isSeededMode();
      setIsSeeded(seeded);
      const stored = getStoredEmployees();

      let finalEmps: Employee[] = stored;
      try {
        const empRes = await api.get("/employees?size=150");
        const backendEmps = empRes.data.content || [];
        if (backendEmps.length > 0) {
          if (!seeded) {
            finalEmps = backendEmps.slice(0, 5);
          } else {
            finalEmps = backendEmps.length >= 20 ? backendEmps : stored;
          }
        }
      } catch {
        finalEmps = stored;
      }

      setEmployees(finalEmps);

      // Ensure all 8 enterprise departments exist
      try {
        const deptRes = await api.get("/departments");
        const depts = deptRes.data || [];
        if (depts.length >= 5) {
          setDepartments(depts);
        } else {
          setDepartments(ENTERPRISE_DEPARTMENTS);
        }
      } catch {
        setDepartments(ENTERPRISE_DEPARTMENTS);
      }
    } catch (err) {
      console.error("Error loading directory", err);
      setEmployees(getStoredEmployees());
      setDepartments(ENTERPRISE_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeed = async () => {
    setLoading(true);
    try {
      if (!isSeeded) {
        try {
          await api.post("/system/demo/reset");
        } catch {
          // offline fallback
        }
        seedEnterpriseCompanyData();
        setIsSeeded(true);
        setEmployees(getStoredEmployees());
        setCurrentPage(1);
        toast.success("Seeded 100 enterprise employees across 8 departments!");
      } else {
        resetToFivePersonas();
        setIsSeeded(false);
        setEmployees(getStoredEmployees());
        setCurrentPage(1);
        toast.success("Reset directory to 5 core foundational personas.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalaryChange = (annualCtc: number) => {
    const basic = Math.round(annualCtc * 0.5);
    const hra = Math.round(annualCtc * 0.25);
    const allowance = annualCtc - (basic + hra);
    setOnboardingForm(prev => ({
      ...prev,
      salary: annualCtc,
      basicSalary: basic,
      hra: hra,
      specialAllowance: allowance
    }));
  };

  const handleCompleteOnboarding = async () => {
    try {
      let createdCode = "";
      try {
        const res = await api.post("/employees/onboard", onboardingForm);
        createdCode = res.data?.employeeCode || "";
      } catch {
        // Fallback to local procedural persistence
      }

      const selectedDept = departments.find(d => d.id === onboardingForm.departmentId);
      const created = appendNewEmployee({
        employeeCode: createdCode || undefined,
        firstName: onboardingForm.firstName,
        lastName: onboardingForm.lastName,
        email: onboardingForm.email,
        phone: onboardingForm.phone,
        designation: onboardingForm.designation,
        departmentId: onboardingForm.departmentId || "dept-eng",
        departmentName: selectedDept?.name || "Engineering",
        salary: onboardingForm.salary || 1200000,
        hireDate: onboardingForm.hireDate || new Date().toISOString().split("T")[0],
        status: "ACTIVE",
        metadata: JSON.stringify({
          emergencyContact: onboardingForm.emergencyContact,
          workLocation: onboardingForm.workLocation,
          bloodGroup: "O+"
        })
      });

      setCreatedCredentials({
        code: created.employeeCode,
        email: created.email,
        provisionalPassword: onboardingForm.initialPassword || "Welcome@2026!",
        name: `${created.firstName} ${created.lastName}`
      });

      setEmployees(getStoredEmployees());
      toast.success("Employee onboarding successfully executed!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to onboard employee");
    }
  };

  const handleOpenOffboard = (emp: Employee) => {
    setSelectedEmployeeForOffboard(emp);
    setIsOffboardModalOpen(true);
  };

  const handleCompleteOffboard = async () => {
    if (!selectedEmployeeForOffboard) return;
    try {
      try {
        await api.post(`/employees/${selectedEmployeeForOffboard.id}/offboard`, offboardingForm);
      } catch {
        // offline fallback
      }
      const current = getStoredEmployees();
      const updated = current.map(e => e.id === selectedEmployeeForOffboard.id ? { ...e, status: "OFFBOARDED" as const } : e);
      saveEmployees(updated);
      setEmployees(updated);
      toast.success(`${selectedEmployeeForOffboard.firstName} offboarded and login access revoked.`);
      setIsOffboardModalOpen(false);
      setSelectedEmployeeForOffboard(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to offboard employee");
    }
  };

  const handleOpenHistory = async (emp: Employee) => {
    setSelectedEmployeeForHistory(emp);
    setIsHistoryDrawerOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/employees/${emp.id}/history`);
      setHistoryItems(res.data || []);
    } catch (err: any) {
      toast.error("Failed to fetch employee lifecycle history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/departments", newDept);
      toast.success("New Department created");
      setIsDeptModalOpen(false);
      setNewDept({ name: "", description: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create department");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const departmentNames = ["All Personnel", ...departments.map(d => d.name)];

  const filteredEmployees = employees.filter(emp => {
    const activeCategory = departmentNames[selectedDeptIndex];
    const matchesDept =
      selectedDeptIndex === 0 ||
      (emp.departmentName && emp.departmentName.toLowerCase() === activeCategory.toLowerCase());

    const matchesQuery =
      searchQuery === "" ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Workforce Directory & Lifecycle
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {employees.length} Personnel
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500 dark:text-white/40 mt-0.5">
            5-step onboarding, automated credential provisioning, audit trails, and department roster.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seed Mode Pill / Toggle */}
          <button
            onClick={handleToggleSeed}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              isSeeded
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20 shadow-xs shadow-emerald-500/10"
                : "bg-orange-500/10 text-orange-400 border-orange-500/25 hover:bg-orange-500/20 shadow-xs shadow-orange-500/10"
            }`}
            title={isSeeded ? "Click to reset directory to 5 core demo personas" : "Click to seed 100 enterprise employees"}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSeeded ? "100 Enterprise Seeded (Click to Reset)" : "5 Core Personas (Click to Seed 100)"}</span>
          </button>

          <Link
            href="/employees/org-chart"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/80 bg-slate-200/60 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all flex items-center gap-1.5 border border-slate-300/40 dark:border-white/[0.06]"
          >
            <FolderTree className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Org Chart
          </Link>

          {isAdmin && (
            <>
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/70 bg-slate-200/60 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                New Division
              </button>

              <LiquidCarveButton
                label="Onboard Personnel"
                padding="6px 16px"
                rounded={10}
                colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                onClick={() => {
                  setOnboardStep(1);
                  setCreatedCredentials(null);
                  setIsOnboardModalOpen(true);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Grid: LineSidebar Navigation on Left + Employee Roster on Right */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* Left Column (3 cols): LineSidebar for Department Filtering */}
        <div className="lg:col-span-3 p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">
              Divisions Filter
            </div>

            <LineSidebar
              items={departmentNames}
              defaultActive={selectedDeptIndex}
              accentColor="#ff6b2c"
              textColor={theme === "light" ? "#0f172a" : "rgba(255, 255, 255, 0.7)"}
              markerColor="#ff6b2c"
              fontSize={0.82}
              itemGap={10}
              onItemClick={(idx: number) => {
                setSelectedDeptIndex(idx);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] text-[10px] text-slate-500 dark:text-white/40 shrink-0 flex justify-between">
            <span>Total Staff: {employees.length}</span>
            <span>Active: {employees.filter(e => e.status === "ACTIVE").length}</span>
          </div>
        </div>

        {/* Right Column (9 cols): Search Bar + Personnel Cards */}
        <div className="lg:col-span-9 flex flex-col justify-between gap-2 overflow-hidden">
          {/* Search Box */}
          <div className="relative w-full shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, designation, email, or employee code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] outline-none text-slate-900 dark:text-white focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="p-8 text-center text-slate-400 dark:text-white/40 font-mono text-xs">
              Loading workforce directory...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/60 dark:bg-white/[0.02]">
              <Users className="w-8 h-8 mx-auto text-slate-400 dark:text-white/40 mb-1.5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Personnel Found</h3>
              <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">Try adjusting your keyword filter.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 p-0.5">
              {paginatedEmployees.map((emp, idx) => {
                const initials = `${emp.firstName[0] || ""}${emp.lastName[0] || ""}`.toUpperCase();
                const isExited = emp.status === "OFFBOARDED" || emp.status === "INACTIVE";

                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.2 }}
                    onClick={() => handleOpenDetail(emp)}
                    className={`p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border ${
                      isExited
                        ? "border-rose-500/20 opacity-75"
                        : "border-slate-200/70 dark:border-white/[0.05] hover:border-orange-500/40"
                    } transition-all flex flex-col justify-between group cursor-pointer hover:shadow-lg hover:shadow-orange-500/5`}
                  >
                    <div>
                      {/* Top Status & Code */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-white/[0.04]">
                        <span className="font-mono text-[9.5px] text-slate-500 dark:text-white/40">
                          {emp.employeeCode || `NX-${emp.id?.slice(0, 6).toUpperCase()}`}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[9.5px] font-bold ${
                            isExited
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isExited ? "bg-rose-400 shadow-[0_0_6px_#f43f5e]" : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                            }`}
                          />
                          {emp.status || "ACTIVE"}
                        </span>
                      </div>

                      {/* Profile Core */}
                      <div className="flex items-center gap-2 my-2">
                        <div
                          className={`w-9 h-9 rounded-xl ${
                            isExited
                              ? "bg-slate-500"
                              : "bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm shadow-orange-500/20"
                          } flex items-center justify-center text-white font-extrabold text-xs shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {emp.firstName} {emp.lastName}
                          </h3>
                          <p className="text-[10px] text-orange-500 font-medium truncate">
                            {emp.designation}
                          </p>
                          <span className="inline-block mt-0.5 text-[9px] text-slate-500 dark:text-white/40 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.03]">
                            {emp.departmentName || "General Division"}
                          </span>
                        </div>
                      </div>

                      {/* Contact metadata */}
                      <div className="space-y-0.5 py-1.5 px-2 rounded-lg bg-slate-100/70 dark:bg-white/[0.02] text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/60 truncate text-[10px]">
                          <Mail className="w-3 h-3 text-slate-400 dark:text-white/40 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-white/40 text-[10px]">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-white/40 shrink-0" />
                          <span>Hired: {emp.hireDate || "2024-01-15"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom actions & compensation */}
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[9px] text-slate-500 dark:text-white/40">Annual CTC</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-[10.5px]">
                          {isAdmin || isManager
                            ? emp.salary
                              ? `₹${emp.salary.toLocaleString("en-IN")}`
                              : "₹1,200,000"
                            : "Confidential"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocModalEmployee(emp);
                          }}
                          title="View & Upload KYC Documents"
                          className="p-1 rounded-lg bg-slate-200/60 dark:bg-white/[0.04] hover:bg-indigo-500/20 text-slate-600 dark:text-white/60 hover:text-indigo-400 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenHistory(emp);
                          }}
                          title="View Lifecycle Timeline"
                          className="p-1 rounded-lg bg-slate-200/60 dark:bg-white/[0.04] hover:bg-slate-300 dark:hover:bg-white/[0.08] text-slate-600 dark:text-white/60 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && !isExited && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenOffboard(emp);
                            }}
                            title="Initiate Offboarding Checklist"
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredEmployees.length > 0 && (
            <div className="shrink-0 pt-2 pb-1 border-t border-slate-200/60 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-white/50">
              <span className="text-[11px]">
                Showing {Math.min(filteredEmployees.length, (currentPage - 1) * pageSize + 1)} -{" "}
                {Math.min(filteredEmployees.length, currentPage * pageSize)} of {filteredEmployees.length} personnel
                {isSeeded ? " (Seeded 100 Enterprise Records)" : " (5 Core Demo Personas)"}
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] disabled:opacity-40 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-all ${
                          currentPage === page
                            ? "bg-orange-500 text-white shadow-xs shadow-orange-500/30"
                            : "bg-slate-200/40 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-white/70"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] disabled:opacity-40 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5-Step Onboarding Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">5-Step Employee Onboarding Wizard</h2>
                  <p className="text-[10px] text-white/40">Step {onboardStep} of 5 — Provision digital identity and corporate roster</p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            {!createdCredentials && (
              <div className="grid grid-cols-5 gap-1.5 py-1">
                {[
                  { step: 1, label: "Personal" },
                  { step: 2, label: "Job & Org" },
                  { step: 3, label: "Salary CTC" },
                  { step: 4, label: "Credentials" },
                  { step: 5, label: "Checklist" }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      onboardStep === s.step
                        ? "bg-orange-500/20 border-orange-500 text-orange-400"
                        : onboardStep > s.step
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-white/[0.02] border-white/5 text-white/30"
                    }`}
                  >
                    <div className="text-[9px] font-mono font-bold">0{s.step}</div>
                    <div className="text-[8.5px] truncate">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Step Body */}
            {createdCredentials ? (
              <div className="py-6 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Personnel Successfully Onboarded!</h3>
                <p className="text-xs text-white/60">
                  User credentials generated with forced password reset on first login.
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left font-mono text-xs space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-white/40">Personnel:</span>
                    <span className="text-white font-bold">{createdCredentials.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Employee Code:</span>
                    <span className="text-orange-400">{createdCredentials.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Login Email:</span>
                    <span className="text-white">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <span className="text-white/40">Provisional Password:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                      {createdCredentials.provisionalPassword}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.provisionalPassword}\nCode: ${createdCredentials.code}`
                      )
                    }
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Credentials
                  </button>
                  <button
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 min-h-[260px]">
                {/* STEP 1: Personal Info */}
                {onboardStep === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">First Name *</label>
                        <input
                          type="text"
                          value={onboardingForm.firstName}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, firstName: e.target.value })}
                          placeholder="e.g. Aditi"
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Last Name *</label>
                        <input
                          type="text"
                          value={onboardingForm.lastName}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, lastName: e.target.value })}
                          placeholder="e.g. Sharma"
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-white/50 uppercase">Corporate Email *</label>
                      <input
                        type="email"
                        value={onboardingForm.email}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                        placeholder="aditi.sharma@nexushr.demo"
                        className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Phone Number</label>
                        <input
                          type="text"
                          value={onboardingForm.phone}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Emergency Contact</label>
                        <input
                          type="text"
                          value={onboardingForm.emergencyContact}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, emergencyContact: e.target.value })}
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Job Details */}
                {onboardStep === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Division / Department *</label>
                        <select
                          value={onboardingForm.departmentId}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, departmentId: e.target.value })}
                          className="w-full p-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Designation *</label>
                        <input
                          type="text"
                          value={onboardingForm.designation}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, designation: e.target.value })}
                          placeholder="e.g. Senior Backend Architect"
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Reporting Manager</label>
                        <select
                          value={onboardingForm.managerId}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, managerId: e.target.value })}
                          className="w-full p-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none"
                        >
                          <option value="">None (Top-Level / VP)</option>
                          {employees
                            .filter((e) => e.status === "ACTIVE")
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.firstName} {m.lastName} ({m.designation})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-white/50 uppercase">Work Hub Location</label>
                        <input
                          type="text"
                          value={onboardingForm.workLocation}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, workLocation: e.target.value })}
                          className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-white/50 uppercase">Effective Hire Date</label>
                      <input
                        type="date"
                        value={onboardingForm.hireDate}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, hireDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Compensation & Indian Statutory CTC */}
                {onboardStep === 3 && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-white/50 uppercase">Annual CTC (₹ INR) *</label>
                      <input
                        type="number"
                        step="50000"
                        value={onboardingForm.salary}
                        onChange={(e) => handleSalaryChange(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono font-bold outline-none focus:border-orange-500"
                      />
                      <p className="text-[9.5px] text-white/40 mt-1">
                        Auto-split according to standard Indian Statutory Salary Structure:
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-white/40 block">Basic (50%)</span>
                        <span className="text-white font-bold">₹{onboardingForm.basicSalary.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/40 block">HRA (25%)</span>
                        <span className="text-white font-bold">₹{onboardingForm.hra.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/40 block">Special Allowance</span>
                        <span className="text-white font-bold">₹{onboardingForm.specialAllowance.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Credentials */}
                {onboardStep === 4 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                        <KeyRound className="w-4 h-4" />
                        Identity & Password Policy
                      </div>
                      <p className="text-[10px] text-white/60">
                        A temporary provisional password will be automatically assigned. Upon first sign-in, the system
                        will enforce an immediate password rotation according to corporate security policy.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-white/50 uppercase">
                        Custom Initial Password (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave blank to auto-generate (e.g. Welcome@2026!)"
                        value={onboardingForm.initialPassword}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, initialPassword: e.target.value })}
                        className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={onboardingForm.sendWelcomeEmail}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, sendWelcomeEmail: e.target.checked })}
                        className="rounded accent-orange-500"
                      />
                      <span>Send simulated welcome onboarding email via MailHog outbox</span>
                    </label>
                  </div>
                )}

                {/* STEP 5: Verification & Checklist */}
                {onboardStep === 5 && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-white/70 font-semibold flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Statutory Onboarding Verification Checklist:
                    </div>

                    <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      {[
                        {
                          key: "documentsVerified",
                          label: "Government ID & Educational Credentials Verified"
                        },
                        {
                          key: "taxDeclarationSubmitted",
                          label: "Form 12BB & New Tax Regime Selection Acknowledged"
                        },
                        {
                          key: "bankDetailsSubmitted",
                          label: "Corporate Bank Account & Cancelled Cheque On Record"
                        },
                        {
                          key: "complianceAcknowledged",
                          label: "Information Security & Code of Conduct NDA Signed"
                        }
                      ].map((item: any) => (
                        <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(onboardingForm as any)[item.key]}
                            onChange={(e) =>
                              setOnboardingForm({ ...onboardingForm, [item.key]: e.target.checked })
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span className="text-[11px] text-white/80">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stepper Navigation Buttons */}
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <button
                    type="button"
                    disabled={onboardStep === 1}
                    onClick={() => setOnboardStep((s) => s - 1)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  {onboardStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onboardStep === 1 && (!onboardingForm.firstName || !onboardingForm.email)) {
                          toast.error("Please enter first name and corporate email");
                          return;
                        }
                        setOnboardStep((s) => s + 1);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all flex items-center gap-1"
                    >
                      Next Step
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <LiquidCarveButton
                      label="Execute Onboarding"
                      padding="8px 20px"
                      rounded={10}
                      colors={{ fill: "#FF6B2C", textColor: "#FFFFFF" }}
                      onClick={handleCompleteOnboarding}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offboarding Modal */}
      {isOffboardModalOpen && selectedEmployeeForOffboard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <UserMinus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Personnel Offboarding Protocol</h2>
                  <p className="text-[10px] text-white/40">
                    {selectedEmployeeForOffboard.firstName} {selectedEmployeeForOffboard.lastName} (
                    {selectedEmployeeForOffboard.employeeCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOffboardModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-white/50 uppercase">Exit Reason</label>
                <select
                  value={offboardingForm.reason}
                  onChange={(e) => setOffboardingForm({ ...offboardingForm, reason: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none"
                >
                  <option value="Resignation - Career Advancement">Resignation - Career Advancement</option>
                  <option value="Resignation - Higher Studies">Resignation - Higher Studies</option>
                  <option value="End of Contract">End of Contract</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Mutual Separation">Mutual Separation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/50 uppercase">Last Working Day</label>
                <input
                  type="date"
                  value={offboardingForm.exitDate}
                  onChange={(e) => setOffboardingForm({ ...offboardingForm, exitDate: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <div className="text-[10px] font-bold text-white/50 uppercase">Clearance Checklist:</div>
                {[
                  { key: "hardwareReturned", label: "Laptop & Security Token Surrendered" },
                  { key: "companyAssetsCleared", label: "Financial Clearances & Expense Reports Settled" },
                  { key: "systemAccessRevoked", label: "SSO & Active Session Tokens Terminated" },
                  { key: "exitInterviewCompleted", label: "HR Exit Interview Feedback Logged" }
                ].map((item: any) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(offboardingForm as any)[item.key]}
                      onChange={(e) =>
                        setOffboardingForm({ ...offboardingForm, [item.key]: e.target.checked })
                      }
                      className="rounded accent-rose-500"
                    />
                    <span className="text-[10.5px] text-white/80">{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/50 uppercase">Final Clearance Remarks</label>
                <textarea
                  value={offboardingForm.remarks}
                  onChange={(e) => setOffboardingForm({ ...offboardingForm, remarks: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs h-16 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOffboardModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOffboard}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all"
                >
                  Confirm Offboard & Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Drawer */}
      {isDetailDrawerOpen && selectedEmployeeForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#0b0f19] border-l border-white/10 w-full max-w-lg h-full p-6 flex flex-col justify-between shadow-2xl text-white">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/20">
                    {selectedEmployeeForDetail.firstName[0]}
                    {selectedEmployeeForDetail.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedEmployeeForDetail.firstName} {selectedEmployeeForDetail.lastName}
                    </h3>
                    <p className="text-[10.5px] text-orange-400 font-mono">
                      {selectedEmployeeForDetail.employeeCode || `NX-${selectedEmployeeForDetail.id?.slice(0, 6).toUpperCase()}`} · {selectedEmployeeForDetail.designation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-1">
                {/* Status & Profile Core */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedEmployeeForDetail.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Corporate Email</span>
                    <span className="text-white font-mono text-[11px]">{selectedEmployeeForDetail.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Contact Phone</span>
                    <span className="text-white font-mono text-[11px]">{selectedEmployeeForDetail.phone || "+91 98200 44321"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Hire Date</span>
                    <span className="text-white font-mono text-[11px]">{selectedEmployeeForDetail.hireDate || "2024-01-15"}</span>
                  </div>
                </div>

                {/* Organizational Placement */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Organizational Hierarchy
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Assigned Division</span>
                    <span className="text-orange-400 font-semibold">{selectedEmployeeForDetail.departmentName || "Engineering"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Reporting Manager</span>
                    <span className="text-white">{selectedEmployeeForDetail.managerName || "Vikram Patel"}</span>
                  </div>
                </div>

                {/* Compensation & Statutory Preview */}
                {(isAdmin || isManager) && (
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      Compensation & Statutory (FY 2025-26)
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/50">Annual Cost to Company (CTC)</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {selectedEmployeeForDetail.salary
                          ? `₹${selectedEmployeeForDetail.salary.toLocaleString("en-IN")}`
                          : "₹1,200,000"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/50">Monthly Base (Est.)</span>
                      <span className="text-white font-mono">
                        ₹{Math.round((selectedEmployeeForDetail.salary || 1200000) / 12).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions Shortcut */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      handleOpenHistory(selectedEmployeeForDetail);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-orange-400" />
                    Career History
                  </button>
                  {isAdmin && selectedEmployeeForDetail.status !== "OFFBOARDED" && (
                    <button
                      onClick={() => {
                        setIsDetailDrawerOpen(false);
                        handleOpenOffboard(selectedEmployeeForDetail);
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Offboard
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDetailDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all text-center mt-4"
            >
              Close Profile View
            </button>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryDrawerOpen && selectedEmployeeForHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#0b0f19] border-l border-white/10 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl text-white">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-400" />
                    Career & Audit Timeline
                  </h3>
                  <p className="text-[10.5px] text-white/40">
                    {selectedEmployeeForHistory.firstName} {selectedEmployeeForHistory.lastName} (
                    {selectedEmployeeForHistory.employeeCode})
                  </p>
                </div>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-1">
                {historyLoading ? (
                  <div className="text-center py-8 text-xs text-white/40 font-mono">
                    Loading lifecycle history...
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-white/40">
                    No timeline records logged yet for this employee.
                  </div>
                ) : (
                  historyItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 relative pl-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-400 absolute left-1.5 top-3 shadow-[0_0_6px_#fb923c]" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{item.changeType}</span>
                        <span className="text-[9.5px] text-white/40 font-mono">{item.effectiveDate}</span>
                      </div>
                      <p className="text-[10.5px] text-white/70">{item.remarks}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setIsHistoryDrawerOpen(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all text-center mt-4"
            >
              Close Timeline
            </button>
          </div>
        </div>
      )}

      {/* Modal: New Department */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Charter New Division
              </h2>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-white/50 uppercase">Division Name</label>
                <input
                  type="text"
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. AI & Research"
                  className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-white/50 uppercase">Charter Description</label>
                <textarea
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Mandate & operational domain..."
                  className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs h-20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <LiquidCarveButton
                  label="Create Division"
                  padding="8px 20px"
                  rounded={10}
                  colors={{ fill: "#6366F1", textColor: "#FFFFFF" }}
                  onClick={handleCreateDept}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Documents Manager Modal */}
      <DocumentManagerModal
        isOpen={!!docModalEmployee}
        onClose={() => setDocModalEmployee(null)}
        employeeId={docModalEmployee?.id || ""}
        employeeName={`${docModalEmployee?.firstName || ""} ${docModalEmployee?.lastName || ""}`}
      />
    </div>
  );
}
