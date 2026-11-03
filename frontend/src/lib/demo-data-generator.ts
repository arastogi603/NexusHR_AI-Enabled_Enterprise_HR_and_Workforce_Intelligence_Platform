/**
 * NexusHR Enterprise Procedural Data Generator
 * Provides deterministic and realistic corporate demo data:
 * - Default State: Exactly 5 active foundational personas (Ananya, Vikram, Aditi, Priya, Rahul)
 * - Seeded State: Exactly 100 enterprise employees across 8 corporate divisions with full
 *   attendance, payroll, leaves, performance OKRs, recruitment candidates, and kudos telemetry.
 * - Supports manual onboarding, leave applications, job posting, and status updates.
 */

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  salary: number;
  hireDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "PROBATION" | "OFFBOARDED";
  managerId?: string;
  managerName?: string;
  metadata?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "PRESENT" | "LATE" | "HALF_DAY" | "ON_LEAVE";
  workHours: number;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  ctc: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  transportAllowance: number;
  grossPay: number;
  pfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tds: number;
  lopDeduction: number;
  totalDeductions: number;
  netPay: number;
  paidDays: number;
  lopDays: number;
  month: number;
  year: number;
  published: boolean;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: "DRAFT" | "COMPLETED" | "PUBLISHED" | "FAILED";
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  executedBy: string;
  executedAt: string;
  publishedAt: string;
  payslips?: Payslip[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  leaveType: "CASUAL" | "SICK" | "EARNED" | "MATERNITY";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completionPercentage: number;
}

export interface Review {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  score: number;
  feedback: string;
  status: "COMPLETED" | "PENDING";
}

export interface KudosPost {
  id: string;
  senderName: string;
  senderRole: string;
  receiverName: string;
  receiverRole: string;
  badge: "Innovation" | "Collaboration" | "Execution" | "Customer Delight";
  points: number;
  message: string;
  likes: number;
  timeAgo: string;
}

export interface AttritionPrediction {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  contributingFactors: {
    factorName: string;
    weight: number;
    score: number;
    impactPercentage: number;
    insight: string;
  }[];
  recommendedActions: string[];
  narrative: string;
  source: string;
  generatedAt: string;
}

export interface SkillGap {
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

export interface EngagementScore {
  departmentName: string;
  overallScore: number;
  attendanceQuality: number;
  goalProgress: number;
  feedbackScore: number;
  leaveHealth: number;
  trend: "POSITIVE" | "STABLE" | "DECLINING";
  employeeCount: number;
}

// 8 Standard Enterprise Departments
export const ENTERPRISE_DEPARTMENTS: Department[] = [
  { id: "dept-exec", name: "Executive Leadership", description: "Strategic Governance, Risk & Global Operations" },
  { id: "dept-eng", name: "Engineering", description: "Distributed Cloud Architecture, Core Services & Applications" },
  { id: "dept-devops", name: "DevOps & Infrastructure", description: "Platform Reliability, Kubernetes & Telemetry" },
  { id: "dept-hr", name: "Human Resources", description: "Talent Acquisition, People Operations & Compliance" },
  { id: "dept-prod", name: "Product Management", description: "Product Strategy, Roadmap Prioritization & UX Metrics" },
  { id: "dept-design", name: "UI/UX Design", description: "Design Systems, User Research & Visual Interaction" },
  { id: "dept-fin", name: "Finance & Accounts", description: "Statutory Payroll, Tax Compliance (115BAC) & Audit" },
  { id: "dept-sales", name: "Sales & Marketing", description: "Enterprise Growth, Client Success & Developer Relations" },
];

// Initial 5 Foundational Demo Personas
export const DEFAULT_5_EMPLOYEES: Employee[] = [
  {
    id: "emp-nx-0001",
    employeeCode: "NX-0001",
    firstName: "Ananya",
    lastName: "Sen",
    email: "ananya.sen@nexushr.corp",
    phone: "+91 98201 10001",
    designation: "Chief Human Resources Officer",
    departmentId: "dept-exec",
    departmentName: "Executive Leadership",
    salary: 4800000,
    hireDate: "2021-03-15",
    status: "ACTIVE",
    metadata: JSON.stringify({ emergencyContact: "9820110000", workLocation: "Mumbai HQ", bloodGroup: "O+" })
  },
  {
    id: "emp-nx-0002",
    employeeCode: "NX-0002",
    firstName: "Vikram",
    lastName: "Patel",
    email: "vikram.patel@nexushr.corp",
    phone: "+91 98202 20002",
    designation: "Engineering Manager",
    departmentId: "dept-eng",
    departmentName: "Engineering",
    salary: 3200000,
    hireDate: "2022-01-10",
    status: "ACTIVE",
    managerId: "emp-nx-0001",
    managerName: "Ananya Sen",
    metadata: JSON.stringify({ emergencyContact: "9820220000", workLocation: "Bangalore Tech Hub", bloodGroup: "A+" })
  },
  {
    id: "emp-nx-0003",
    employeeCode: "NX-0003",
    firstName: "Aditi",
    lastName: "Sharma",
    email: "aditi.sharma@nexushr.corp",
    phone: "+91 98203 30003",
    designation: "Senior Software Developer",
    departmentId: "dept-eng",
    departmentName: "Engineering",
    salary: 1800000,
    hireDate: "2023-06-01",
    status: "ACTIVE",
    managerId: "emp-nx-0002",
    managerName: "Vikram Patel",
    metadata: JSON.stringify({ emergencyContact: "9820330000", workLocation: "Bangalore Tech Hub", bloodGroup: "B+" })
  },
  {
    id: "emp-nx-0004",
    employeeCode: "NX-0004",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@nexushr.corp",
    phone: "+91 98204 40004",
    designation: "Lead HR Business Partner",
    departmentId: "dept-hr",
    departmentName: "Human Resources",
    salary: 2200000,
    hireDate: "2022-08-15",
    status: "ACTIVE",
    managerId: "emp-nx-0001",
    managerName: "Ananya Sen",
    metadata: JSON.stringify({ emergencyContact: "9820440000", workLocation: "Mumbai HQ", bloodGroup: "AB+" })
  },
  {
    id: "emp-nx-0005",
    employeeCode: "NX-0005",
    firstName: "Rahul",
    lastName: "Verma",
    email: "rahul.verma@nexushr.corp",
    phone: "+91 98205 50005",
    designation: "Principal DevOps Architect",
    departmentId: "dept-devops",
    departmentName: "DevOps & Infrastructure",
    salary: 2600000,
    hireDate: "2022-04-20",
    status: "ACTIVE",
    managerId: "emp-nx-0001",
    managerName: "Ananya Sen",
    metadata: JSON.stringify({ emergencyContact: "9820550000", workLocation: "Pune Cloud Center", bloodGroup: "O-" })
  }
];

// Rich pools for realistic employee procedural expansion
const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Aadhya", "Diya", "Fatima", "Ishaan",
  "Shaurya", "Atharva", "Kabir", "Ritvik", "Tanvi", "Ishita", "Meera", "Riya", "Sanya", "Neha",
  "Pooja", "Rohan", "Karan", "Simran", "Harshit", "Sneha", "Divya", "Kunal", "Gaurav", "Meenakshi",
  "Swati", "Nikhil", "Tarun", "Pallavi", "Varun", "Yash", "Mansi", "Deepak", "Shilpa", "Alok",
  "Bhavesh", "Trisha", "Siddharth", "Aman", "Rhea", "Manish", "Kavita", "Suresh", "Radhika", "Sameer",
  "Rupali", "Anand", "Akash", "Ritu", "Pranav", "Zoya", "Kavya", "Mohit", "Chirag", "Pooja"
];

const LAST_NAMES = [
  "Kapoor", "Banerjee", "Mehta", "Reddy", "Joshi", "Gupta", "Malhotra", "Kulkarni", "Deshmukh", "Saxena",
  "Bhattacharya", "Chatterjee", "Nambiar", "Pillai", "Gill", "Chopra", "Ahuja", "Hegde", "Menon", "Chauhan",
  "Bhat", "Tiwari", "Pandey", "Mishra", "Goswami", "Shukla", "Desai", "Singhania", "Aggarwal", "Chowdhury",
  "Mukherjee", "Venkatesh", "Srinivasan", "Iyer", "Ranganathan", "Narayanan", "D'Souza", "Fernandes", "Lobo", "Prasad",
  "Dubey", "Bose", "Ghosh", "Sengupta", "Dutta"
];

const DEPT_ROLES: Record<string, { roles: string[]; minCtc: number; maxCtc: number }> = {
  "dept-eng": {
    roles: [
      "Senior Backend Engineer", "Frontend Specialist", "Full Stack Developer", "Cloud Data Engineer",
      "Distributed Systems Architect", "Mobile Platform Lead", "QA Automation Engineer", "Platform Security Engineer",
      "API Integration Lead", "Staff Software Engineer"
    ],
    minCtc: 1200000,
    maxCtc: 3400000,
  },
  "dept-devops": {
    roles: [
      "Site Reliability Engineer", "Cloud Infrastructure Architect", "Kubernetes Platform Specialist",
      "Observability Engineer", "DevSecOps Specialist", "Database Administrator"
    ],
    minCtc: 1400000,
    maxCtc: 3200000,
  },
  "dept-prod": {
    roles: [
      "Principal Product Manager", "Technical Product Manager", "Associate Product Manager",
      "Growth Product Specialist", "AI Products Lead"
    ],
    minCtc: 1500000,
    maxCtc: 3600000,
  },
  "dept-design": {
    roles: [
      "Lead Product Designer", "Senior UX Researcher", "Interaction Design Lead",
      "Design Systems Engineer", "Visual Interface Specialist"
    ],
    minCtc: 1100000,
    maxCtc: 2800000,
  },
  "dept-hr": {
    roles: [
      "Talent Acquisition Partner", "People Operations Specialist", "Compensation & Benefits Lead",
      "HR Technology Analyst", "Employee Engagement Specialist"
    ],
    minCtc: 850000,
    maxCtc: 2400000,
  },
  "dept-fin": {
    roles: [
      "Financial Planning Manager", "Statutory Tax Accountant", "Payroll Operations Lead",
      "Corporate Treasury Analyst", "Internal Audit Specialist"
    ],
    minCtc: 950000,
    maxCtc: 2600000,
  },
  "dept-sales": {
    roles: [
      "Enterprise Account Executive", "Solutions Architect", "Growth Marketing Lead",
      "Client Success Specialist", "Developer Relations Advocate"
    ],
    minCtc: 1050000,
    maxCtc: 3000000,
  },
  "dept-exec": {
    roles: [
      "Vice President of Engineering", "Head of Product Strategy", "Director of Cloud Operations",
      "Chief Financial Officer"
    ],
    minCtc: 3800000,
    maxCtc: 4600000,
  }
};

/**
 * Generate 100 enterprise employees procedurally.
 * Combines 5 foundational personas with 95 diverse procedural employees.
 */
export function generate100Employees(): Employee[] {
  const result: Employee[] = [...DEFAULT_5_EMPLOYEES];

  const deptKeys = [
    "dept-eng", "dept-eng", "dept-eng", "dept-eng", // Engineering 35-40%
    "dept-devops", "dept-devops",
    "dept-prod", "dept-design",
    "dept-hr", "dept-fin", "dept-sales"
  ];

  for (let i = 6; i <= 100; i++) {
    const code = `NX-${String(i).padStart(4, "0")}`;
    const fName = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 11 + 5) % LAST_NAMES.length];
    const deptKey = deptKeys[i % deptKeys.length];
    const dept = ENTERPRISE_DEPARTMENTS.find(d => d.id === deptKey) || ENTERPRISE_DEPARTMENTS[1];

    const config = DEPT_ROLES[deptKey] || DEPT_ROLES["dept-eng"];
    const role = config.roles[i % config.roles.length];

    // Salary with realistic distribution
    const salaryRange = config.maxCtc - config.minCtc;
    const salary = Math.round((config.minCtc + (i * 47311) % salaryRange) / 50000) * 50000;

    // Status: 92% ACTIVE, 5% ON_LEAVE, 3% PROBATION
    let status: "ACTIVE" | "ON_LEAVE" | "PROBATION" = "ACTIVE";
    if (i % 20 === 0) status = "ON_LEAVE";
    else if (i % 31 === 0) status = "PROBATION";

    // Hire date between 2021 and 2026
    const year = 2021 + (i % 6);
    const month = String(1 + (i % 12)).padStart(2, "0");
    const day = String(1 + ((i * 3) % 28)).padStart(2, "0");
    const hireDate = `${year}-${month}-${day}`;

    const cleanFirst = fName.toLowerCase().replace(/[^a-z]/g, "");
    const cleanLast = lName.toLowerCase().replace(/[^a-z]/g, "");
    const email = `${cleanFirst}.${cleanLast}${i > 45 ? i : ""}@nexushr.corp`;
    const phone = `+91 ${98000 + (i * 111)} ${String(10000 + (i * 237)).slice(0, 5)}`;

    result.push({
      id: `emp-nx-${String(i).padStart(4, "0")}`,
      employeeCode: code,
      firstName: fName,
      lastName: lName,
      email,
      phone,
      designation: role,
      departmentId: dept.id,
      departmentName: dept.name,
      salary,
      hireDate,
      status,
      managerId: i % 2 === 0 ? "emp-nx-0002" : "emp-nx-0001",
      managerName: i % 2 === 0 ? "Vikram Patel" : "Ananya Sen",
      metadata: JSON.stringify({
        emergencyContact: `98${10000000 + i}`,
        workLocation: i % 3 === 0 ? "Bangalore Tech Hub" : i % 3 === 1 ? "Mumbai HQ" : "Pune Cloud Center",
        bloodGroup: ["A+", "B+", "O+", "AB+", "O-"][i % 5]
      })
    });
  }

  return result;
}

/**
 * Procedurally generate today's attendance for employees.
 */
export function generateTodayAttendance(employees: Employee[]): AttendanceRecord[] {
  const today = new Date().toISOString().split("T")[0];

  return employees.map((emp, idx) => {
    let status: "PRESENT" | "LATE" | "HALF_DAY" | "ON_LEAVE" = "PRESENT";
    let clockIn: string | null = "09:05 AM";
    let clockOut: string | null = "05:45 PM";
    let workHours = 8.6;

    if (emp.status === "ON_LEAVE" || idx % 22 === 0) {
      status = "ON_LEAVE";
      clockIn = null;
      clockOut = null;
      workHours = 0;
    } else if (idx % 14 === 0) {
      status = "LATE";
      const min = 46 + (idx % 14);
      clockIn = `09:${min < 10 ? "0" + min : min} AM`;
      clockOut = "06:10 PM";
      workHours = 8.1;
    } else if (idx % 29 === 0) {
      status = "HALF_DAY";
      clockIn = "09:12 AM";
      clockOut = "01:30 PM";
      workHours = 4.3;
    } else {
      const min = 8 + (idx % 35);
      clockIn = `08:${min < 10 ? "0" + min : min} AM`;
      clockOut = "05:40 PM";
      workHours = +(8.2 + (idx % 10) * 0.1).toFixed(2);
    }

    return {
      id: `att-${emp.id}-${today}`,
      employeeId: emp.id,
      employeeCode: emp.employeeCode || "NX-0000",
      employeeName: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.departmentName || "Engineering",
      date: today,
      clockIn,
      clockOut,
      status,
      workHours
    };
  });
}

/**
 * Calculate Indian Statutory Monthly Payslip under Section 115BAC
 */
export function calculatePayslipForEmployee(
  emp: Employee,
  month: number,
  year: number,
  runId: string
): Payslip {
  const ctc = emp.salary || 1200000;
  const basicSalary = Math.round((ctc * 0.50) / 12);
  const hra = Math.round((ctc * 0.25) / 12);
  const specialAllowance = Math.round((ctc * 0.20) / 12);
  const transportAllowance = Math.round((ctc * 0.05) / 12);
  const grossPay = basicSalary + hra + specialAllowance + transportAllowance;

  // PF: 12% of basic, capped at 1800 or standard 12%
  const pfDeduction = Math.round(Math.min(basicSalary, 15000) * 0.12);
  // ESI: applicable if gross <= 21,000 (0.75%)
  const esiDeduction = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0;
  // Professional Tax: standard Rs 200 in Maharashtra / Karnataka
  const ptDeduction = 200;

  // TDS under Section 115BAC (approximate monthly progressive bracket)
  let annualTax = 0;
  if (ctc > 1500000) {
    annualTax = (ctc - 1500000) * 0.30 + 150000;
  } else if (ctc > 1200000) {
    annualTax = (ctc - 1200000) * 0.20 + 90000;
  } else if (ctc > 1000000) {
    annualTax = (ctc - 1000000) * 0.15 + 60000;
  } else if (ctc > 700000) {
    annualTax = (ctc - 700000) * 0.10 + 30000;
  }
  const tds = Math.round(annualTax / 12);
  const lopDeduction = 0;
  const totalDeductions = pfDeduction + esiDeduction + ptDeduction + tds + lopDeduction;
  const netPay = grossPay - totalDeductions;

  return {
    id: `ps-${runId}-${emp.employeeCode}`,
    payrollRunId: runId,
    employeeId: emp.id,
    employeeCode: emp.employeeCode || "NX-0000",
    employeeName: `${emp.firstName} ${emp.lastName}`,
    departmentName: emp.departmentName || "General",
    designation: emp.designation,
    ctc,
    basicSalary,
    hra,
    specialAllowance,
    transportAllowance,
    grossPay,
    pfDeduction,
    esiDeduction,
    ptDeduction,
    tds,
    lopDeduction,
    totalDeductions,
    netPay,
    paidDays: 30,
    lopDays: 0,
    month,
    year,
    published: true
  };
}

/**
 * Generate full statutory payroll run with payslips
 */
export function generatePayrollRun(
  employees: Employee[],
  month: number,
  year: number
): PayrollRun {
  const runId = `run-${year}-${String(month).padStart(2, "0")}`;
  const payslips = employees.map(emp => calculatePayslipForEmployee(emp, month, year, runId));

  const totalGross = payslips.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = payslips.reduce((sum, p) => sum + p.netPay, 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);

  return {
    id: runId,
    month,
    year,
    status: "PUBLISHED",
    totalEmployees: employees.length,
    totalGross,
    totalNet,
    totalDeductions,
    executedBy: "Priya Nair (Lead HR Partner)",
    executedAt: `${year}-${String(month).padStart(2, "0")}-28 17:30:00`,
    publishedAt: `${year}-${String(month).padStart(2, "0")}-29 10:00:00`,
    payslips
  };
}

/**
 * Procedural Leave Requests for Manager / HR queue
 */
export function generateLeaveRequests(employees: Employee[]): LeaveRequest[] {
  const reasons = [
    "Family wedding ceremony and rituals",
    "Medical checkup & outpatient recuperation",
    "Annual mountain expedition & trekking",
    "Sister's university convocation ceremony",
    "Relocation to new apartment & registration",
    "Paternity care & newborn assistance",
    "Attending DevOps Summit & technical workshops",
    "Personal wellness & rest"
  ];

  const types: ("CASUAL" | "SICK" | "EARNED")[] = ["CASUAL", "SICK", "EARNED"];

  const sample = employees.slice(0, 16);
  return sample.map((emp, idx) => {
    const isPending = idx < 10;
    const days = 1 + (idx % 4);
    const startOffset = isPending ? 3 + idx : -10 - idx;
    const startDate = new Date(Date.now() + startOffset * 86400000).toISOString().split("T")[0];
    const endDate = new Date(Date.now() + (startOffset + days - 1) * 86400000).toISOString().split("T")[0];

    return {
      id: `leave-req-${emp.id}-${idx}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.departmentName,
      leaveType: types[idx % types.length],
      startDate,
      endDate,
      days,
      reason: reasons[idx % reasons.length],
      status: isPending ? "PENDING" : "APPROVED",
      appliedAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString().split("T")[0]
    };
  });
}

/**
 * Procedural Performance Reviews & OKRs
 */
export function generatePerformanceReviews(employees: Employee[]): Review[] {
  const reviews: Review[] = [
    {
      id: "rev-1",
      employeeId: "emp-nx-0003",
      employeeName: "Aditi Sharma",
      reviewerId: "emp-nx-0002",
      reviewerName: "Vikram Patel",
      reviewPeriod: "Q3 2026",
      score: 4.8,
      feedback: "Exemplary delivery on Argon2 auth overhaul and microservice event latency reduction. Outstanding team player.",
      status: "COMPLETED"
    },
    {
      id: "rev-2",
      employeeId: "emp-nx-0005",
      employeeName: "Rahul Verma",
      reviewerId: "emp-nx-0001",
      reviewerName: "Ananya Sen",
      reviewPeriod: "Q3 2026",
      score: 4.9,
      feedback: "Architected multi-region Kubernetes ingress and zero-downtime blue/green deployment automations.",
      status: "COMPLETED"
    },
    {
      id: "rev-3",
      employeeId: "emp-nx-0004",
      employeeName: "Priya Nair",
      reviewerId: "emp-nx-0001",
      reviewerName: "Ananya Sen",
      reviewPeriod: "Q3 2026",
      score: 4.7,
      feedback: "Automated Section 115BAC tax verification and brought candidate onboarding cycle time down from 14 to 4 days.",
      status: "COMPLETED"
    }
  ];

  // Add more reviews for seeded employees
  employees.slice(5, 12).forEach((emp, i) => {
    reviews.push({
      id: `rev-gen-${emp.id}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      reviewerId: "emp-nx-0002",
      reviewerName: "Vikram Patel",
      reviewPeriod: "Q3 2026",
      score: +(4.1 + (i % 8) * 0.1).toFixed(1),
      feedback: `Demonstrated exceptional technical execution, adherence to enterprise design patterns, and cross-division collaboration.`,
      status: "COMPLETED"
    });
  });

  return reviews;
}

/**
 * Procedural Kudos Feed Posts
 */
export function generateKudosPosts(employees: Employee[]): KudosPost[] {
  return [
    {
      id: "kudos-1",
      senderName: "Vikram Patel",
      senderRole: "Engineering Manager",
      receiverName: "Aditi Sharma",
      receiverRole: "Senior Software Developer",
      badge: "Innovation",
      points: 100,
      message: "Incredible work reducing the monolith gateway API latency by 45%! The whole platform feels blazing fast.",
      likes: 14,
      timeAgo: "2 hours ago"
    },
    {
      id: "kudos-2",
      senderName: "Priya Nair",
      senderRole: "Lead HR Business Partner",
      receiverName: "Rahul Verma",
      receiverRole: "DevOps Architect",
      badge: "Execution",
      points: 75,
      message: "Seamless execution setting up the automated statutory tax verification engine and container orchestration.",
      likes: 19,
      timeAgo: "5 hours ago"
    },
    {
      id: "kudos-3",
      senderName: "Ananya Sen",
      senderRole: "CHRO",
      receiverName: "Priya Nair",
      receiverRole: "Lead HR Business Partner",
      badge: "Customer Delight",
      points: 150,
      message: "Fantastic leadership rolling out the new Section 115BAC automated tax proof parsing for all staff members!",
      likes: 22,
      timeAgo: "Yesterday"
    },
    {
      id: "kudos-4",
      senderName: "Aditi Sharma",
      senderRole: "Senior Developer",
      receiverName: employees[6] ? `${employees[6].firstName} ${employees[6].lastName}` : "Rohan Malhotra",
      receiverRole: "Backend Engineer",
      badge: "Collaboration",
      points: 50,
      message: "Huge thank you for pairing on the PostgreSQL query plan optimization and indexing!",
      likes: 8,
      timeAgo: "2 days ago"
    },
    {
      id: "kudos-5",
      senderName: employees[7] ? `${employees[7].firstName} ${employees[7].lastName}` : "Neha Gupta",
      senderRole: "Product Designer",
      receiverName: "Aditi Sharma",
      receiverRole: "Senior Software Developer",
      badge: "Innovation",
      points: 75,
      message: "The new interactive org chart and glassy UI animations feel silky smooth. Great job!",
      likes: 11,
      timeAgo: "3 days ago"
    }
  ];
}

/**
 * Procedural Attrition Predictions
 */
export function generateAttritionPredictions(employees: Employee[]): AttritionPrediction[] {
  return employees.slice(0, 18).map((emp, i) => {
    const riskScore = (i * 17 + 23) % 95;
    const riskLevel: "LOW" | "MEDIUM" | "HIGH" =
      riskScore >= 65 ? "HIGH" : riskScore >= 35 ? "MEDIUM" : "LOW";

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode || `NX-00${i}`,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.departmentName || "Engineering",
      designation: emp.designation,
      riskScore,
      riskLevel,
      contributingFactors: [
        {
          factorName: "Market Compensation Parity",
          weight: 0.35,
          score: riskScore > 50 ? 78 : 32,
          impactPercentage: 40,
          insight: "Current band is within top quartile of peer tech enterprises."
        },
        {
          factorName: "Tenure & Promotion Velocity",
          weight: 0.25,
          score: riskScore > 60 ? 68 : 24,
          impactPercentage: 30,
          insight: "Last title adjustment occurred 14 months ago."
        },
        {
          factorName: "Sprint Workload & Overtime",
          weight: 0.20,
          score: riskScore > 40 ? 55 : 20,
          impactPercentage: 20,
          insight: "Shift hours consistent with healthy 40-hour weekly baseline."
        }
      ],
      recommendedActions: [
        "Schedule bi-weekly 1:1 career mapping check-in with department manager",
        "Offer enrollment in Advanced Cloud Architecture Leadership track",
        "Review compensation adjustment ahead of Q1 annual appraisal cycle"
      ],
      narrative: `${emp.firstName} exhibits strong core organizational alignment. Predictive telemetry recommends continued growth mentorship.`,
      source: "Deterministic Rules Engine v2.4",
      generatedAt: new Date().toISOString()
    };
  });
}

/**
 * Procedural Skill Gaps
 */
export function generateSkillGaps(): SkillGap[] {
  return [
    {
      departmentName: "Engineering",
      designation: "Senior Software Engineer",
      skill: "Distributed Reactive Streams & Kafka",
      requiredLevel: 4,
      currentProficiency: 3,
      gap: 1,
      criticality: 4,
      priorityScore: 78,
      suggestedTraining: "Event-Driven Architecture & Reactive Microservices Certification"
    },
    {
      departmentName: "DevOps & Infrastructure",
      designation: "Cloud Infrastructure Architect",
      skill: "eBPF Linux Kernel Observability",
      requiredLevel: 5,
      currentProficiency: 3,
      gap: 2,
      criticality: 5,
      priorityScore: 92,
      suggestedTraining: "Advanced eBPF Systems Telemetry Masterclass"
    },
    {
      departmentName: "UI/UX Design",
      designation: "Lead Product Designer",
      skill: "Design Tokens & Multi-Brand Systems",
      requiredLevel: 4,
      currentProficiency: 3,
      gap: 1,
      criticality: 3,
      priorityScore: 65,
      suggestedTraining: "Figma Variables & Automated Token Pipeline Workshop"
    },
    {
      departmentName: "Human Resources",
      designation: "Lead HR Business Partner",
      skill: "Predictive Workforce Analytics & Python",
      requiredLevel: 4,
      currentProficiency: 2,
      gap: 2,
      criticality: 4,
      priorityScore: 84,
      suggestedTraining: "People Analytics & Retention Modelling Bootcamp"
    },
    {
      departmentName: "Finance & Accounts",
      designation: "Statutory Tax Accountant",
      skill: "Section 115BAC Automation & e-TDS 24Q",
      requiredLevel: 5,
      currentProficiency: 4,
      gap: 1,
      criticality: 5,
      priorityScore: 88,
      suggestedTraining: "FY 2026-27 Corporate Direct Tax & Statutory Compliance Certification"
    }
  ];
}

/**
 * Procedural Engagement Scores
 */
export function generateEngagementScores(): EngagementScore[] {
  return [
    { departmentName: "Executive Leadership", overallScore: 94, attendanceQuality: 98, goalProgress: 96, feedbackScore: 92, leaveHealth: 90, trend: "POSITIVE", employeeCount: 4 },
    { departmentName: "Engineering", overallScore: 89, attendanceQuality: 93, goalProgress: 91, feedbackScore: 88, leaveHealth: 85, trend: "POSITIVE", employeeCount: 38 },
    { departmentName: "DevOps & Infrastructure", overallScore: 87, attendanceQuality: 92, goalProgress: 88, feedbackScore: 85, leaveHealth: 84, trend: "STABLE", employeeCount: 14 },
    { departmentName: "Human Resources", overallScore: 92, attendanceQuality: 96, goalProgress: 93, feedbackScore: 91, leaveHealth: 89, trend: "POSITIVE", employeeCount: 10 },
    { departmentName: "Product Management", overallScore: 90, attendanceQuality: 94, goalProgress: 92, feedbackScore: 89, leaveHealth: 86, trend: "POSITIVE", employeeCount: 10 },
    { departmentName: "UI/UX Design", overallScore: 88, attendanceQuality: 91, goalProgress: 89, feedbackScore: 87, leaveHealth: 85, trend: "STABLE", employeeCount: 8 },
    { departmentName: "Finance & Accounts", overallScore: 91, attendanceQuality: 97, goalProgress: 90, feedbackScore: 89, leaveHealth: 88, trend: "POSITIVE", employeeCount: 8 },
    { departmentName: "Sales & Marketing", overallScore: 86, attendanceQuality: 90, goalProgress: 87, feedbackScore: 84, leaveHealth: 83, trend: "STABLE", employeeCount: 8 }
  ];
}

/* =========================================================================
   PERSISTENCE & STATE HELPERS (Client-side localStorage with Hybrid Sync)
   ========================================================================= */

const STORAGE_KEY_MODE = "nexushr_seeded_mode";
const STORAGE_KEY_EMPLOYEES = "nexushr_employees";
const STORAGE_KEY_ATTENDANCE = "nexushr_attendance_today";
const STORAGE_KEY_LEAVES = "nexushr_leaves";
const STORAGE_KEY_PAYROLL = "nexushr_payroll_runs";

/**
 * Check if the dashboard is currently in Seeded Mode (100 employees)
 * Defaults to false (5 foundational personas)
 */
export function isSeededMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_MODE) === "100";
}

/**
 * Retrieve current active employees list.
 * If not in localStorage, loads the 5 default personas.
 */
export function getStoredEmployees(): Employee[] {
  if (typeof window === "undefined") return DEFAULT_5_EMPLOYEES;
  const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fall through
    }
  }

  // Not saved or empty: if seeded mode is flag, generate 100, else return 5
  if (isSeededMode()) {
    const gen = generate100Employees();
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(gen));
    return gen;
  }

  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(DEFAULT_5_EMPLOYEES));
  return DEFAULT_5_EMPLOYEES;
}

/**
 * Save updated employees list (e.g. after manual onboarding or offboarding)
 */
export function saveEmployees(employees: Employee[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
}

/**
 * Seed Enterprise Company Data:
 * Expands company to ~100 employees and populates all sections.
 */
export function seedEnterpriseCompanyData(): {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrollRuns: PayrollRun[];
  leaves: LeaveRequest[];
} {
  const employees = generate100Employees();
  const attendance = generateTodayAttendance(employees);
  const octRun = generatePayrollRun(employees, 10, 2026);
  const sepRun = generatePayrollRun(employees, 9, 2026);
  const leaves = generateLeaveRequests(employees);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_MODE, "100");
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(STORAGE_KEY_PAYROLL, JSON.stringify([octRun, sepRun]));
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
  }

  return { employees, attendance, payrollRuns: [octRun, sepRun], leaves };
}

/**
 * Reset to the initial 5 standard demo personas.
 */
export function resetToFivePersonas(): {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrollRuns: PayrollRun[];
  leaves: LeaveRequest[];
} {
  const employees = [...DEFAULT_5_EMPLOYEES];
  const attendance = generateTodayAttendance(employees);
  const octRun = generatePayrollRun(employees, 10, 2026);
  const leaves = generateLeaveRequests(employees).slice(0, 3);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_MODE, "5");
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(STORAGE_KEY_PAYROLL, JSON.stringify([octRun]));
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
  }

  return { employees, attendance, payrollRuns: [octRun], leaves };
}

/**
 * Add a newly onboarded employee manually
 */
export function appendNewEmployee(newEmp: Omit<Employee, "id" | "employeeCode"> & { employeeCode?: string }): Employee {
  const current = getStoredEmployees();
  const nextNum = current.length + 1;
  const code = newEmp.employeeCode || `NX-${String(nextNum).padStart(4, "0")}`;

  const created: Employee = {
    ...newEmp,
    id: `emp-nx-${String(nextNum).padStart(4, "0")}-${Date.now()}`,
    employeeCode: code,
    hireDate: newEmp.hireDate || new Date().toISOString().split("T")[0],
    status: (newEmp.status as any) || "ACTIVE"
  };

  const updated = [created, ...current];
  saveEmployees(updated);
  return created;
}

/**
 * Calculate live summary metrics for Dashboard and KPIs
 */
export function getLiveDashboardMetrics(employeesList?: Employee[]) {
  const list = employeesList || getStoredEmployees();
  const totalEmployees = list.length;
  const activeEmployees = list.filter(e => e.status === "ACTIVE").length;
  const onLeaveEmployees = list.filter(e => e.status === "ON_LEAVE").length;

  const currentMonthPayrollExpense = list.reduce((sum, e) => sum + Math.round((e.salary || 1200000) / 12), 0);
  const averageAttendanceRate = 94.2;

  return {
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    currentMonthPayrollExpense,
    averageAttendanceRate,
    openRequisitions: 8,
    pendingLeavesCount: isSeededMode() ? 10 : 2
  };
}

