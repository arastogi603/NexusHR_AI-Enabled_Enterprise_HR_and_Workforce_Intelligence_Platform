# NexusHR — Video Walkthrough & Testing Credentials Guide

Welcome to **NexusHR (AI-Enabled Enterprise HR & Workforce Intelligence Platform)**.
This guide contains all test credentials, persona capabilities, a minute-by-minute 4-5 minute video demonstration script, and suggested high-value enterprise features.

---

## 1. Official Test Personas & Login Credentials

All demo accounts are pre-configured with secure credentials for evaluation:

| Persona Name | Email Address | Password | Role | Core Responsibilities & What to Show |
| :--- | :--- | :--- | :--- | :--- |
| **Priya Nair** | `hr@nexushr.demo` | `Demo@12345` | **HR Admin** | Full staff lifecycle, employee directory, leave policies, statutory payroll run, company administration, and demo data generator. |
| **Vikram Patel** | `manager@nexushr.demo` | `Demo@12345` | **Manager** | Department operations, team biometric attendance monitor, 1-click pending leave approvals, employee OKRs. |
| **Aditi Sharma** | `employee@nexushr.demo` | `Demo@12345` | **Staff (Employee)** | Self-service station, biometric punch in/out, leave balance ledger & application, salary compensation, OKR goal tracking, meeting calendar. |
| **Ananya Sen** | `chro@nexushr.demo` | `Demo@12345` | **Executive CHRO** | Strategic workforce intelligence, department attrition trends, headcount analytics, executive governance. |
| **Super Admin** | `admin@nexushr.corp` | `Nexus@Admin2026` | **Super Admin** | Platform-wide root governance, enterprise settings, audit logging. |

> **Note**: A fallback admin account is also available at `admin@nexushr.com` / `Admin@123`.

---

## 2. 4–5 Minute Video Demonstration Script & Workflow

Use this exact chronological script to record a crisp, professional product walkthrough:

### ⏱️ Segment 1: Platform Introduction & Authentication (0:00 – 0:45)
1. **Show the Login Screen (`/login`)**:
   - Highlight the clean, modern glassmorphic interface and **Poppins** typography.
   - Mention TLS 256-bit encryption, role-based authorization (RBAC), and session security.
2. **Action**: Log in using **HR Administrator** credentials:
   - Email: `hr@nexushr.demo`
   - Password: `Demo@12345`
   - Click **"Sign In to Platform"** to trigger the welcome toast and smooth page pop transition.

---

### ⏱️ Segment 2: HR Operations & Firm Management (0:45 – 2:00)
1. **Explore the Unified Dashboard (`/`)**:
   - Showcase real-time organizational KPIs: **Total Headcount**, **Active Staff Today**, **Monthly Payroll Run**, and **Pending Approvals**.
   - Point out the **"Seed Company Demo Data"** button on the Operations card—explain how HR leaders can populate realistic enterprise mock records in 1 click.
2. **Employee Directory (`/employees`)**:
   - Navigate to Directory via the Groovy Dock navigation.
   - Show department-wise filtering (Engineering, HR, DevOps, Executive).
   - Click "Onboard Employee" to demonstrate adding new team members with salary, designation, and manager assignment.
3. **Monthly Statutory Payroll Run (`/payroll`)**:
   - Review salary structures with automated **Section 115BAC New Tax Regime TDS**, 12% Provident Fund (PF), and Professional Tax deductions.
   - Click **"Run Monthly Payroll"** to demonstrate instant batch disbursement.
4. **Company Administration (`/admin/dashboard`)**:
   - Show the Enterprise Administration & Governance Center with active corporate entities, statutory compliance rules, and live activity feed.

---

### ⏱️ Segment 3: Department Manager Approvals (2:00 – 3:00)
1. **Sign Out and Log In as Manager**:
   - Email: `manager@nexushr.demo`
   - Password: `Demo@12345`
2. **Manager Team Hub (`/`)**:
   - Show the dynamic manager view tailored for **Vikram Patel**.
   - Observe direct report attendance (Aditi Sharma) and the **Pending Team Approvals Queue**.
3. **Approve Employee Leaves (`/leaves`)**:
   - Open the Leave Management portal.
   - Show the pending Casual/Sick leave submitted by Aditi Sharma.
   - Click the green **Approve** button—watch the approval toast fire and status update dynamically.

---

### ⏱️ Segment 4: Employee Self-Service Experience (3:00 – 4:00)
1. **Sign Out and Log In as Staff Employee**:
   - Email: `employee@nexushr.demo`
   - Password: `Demo@12345`
2. **Employee Self-Service Station (`/`)**:
   - Show **Aditi Sharma’s** personalized workstation.
3. **Biometric Shift Clock-in (`/attendance` or Dashboard)**:
   - Show the live clock and 15-minute shift grace period rule (09:30 AM – 09:45 AM).
   - Click **"Clock In for Today"** to register a biometric punch.
4. **Leave Application Modal**:
   - View Annual Leave balances: Casual (12 days), Sick (10 days), Earned (15 days).
   - Click **"Apply for Leave"**, select dates, provide a note, and submit for manager review.
5. **OKR, Competency Radar & Skill Genome Hub (`/performance`)**:
   - **Strategic OKRs & Velocity Curve**: Click **+10%** or **Done** on any objective to demonstrate live reactive progress updates and explain the **Quarterly Sprint Burndown Area Chart**.
   - **Competency Radar & Skill Genome Tab**: Toggle into the **Genome Tab** to showcase the **interactive 6-Axis polygonal Competency Radar** comparing candidate DNA against Engineering Benchmarks, plus the **Skill Genome DNA Matrix** with endorsement cheers!
   - **360° Review Scorecards Tab**: Showcase cryptographically signed executive evaluations and benchmark rubric metrics.

---

### ⏱️ Segment 5: Extra Innovation Features Showcase (4:00 – 5:00)
1. **Inbuilt Meeting Calendar & Online Video Rooms (`/meetings`)**:
   - Click **Meetings** in the dock.
   - Highlight the scheduled 1-on-1 Performance Appraisals, Team Standups, and Townhalls.
   - Click **"Join Video Call"** on an active session to open the live virtual video room with camera preview, microphone mute toggle, screen sharing, and in-call chat!
2. **Global AI Workforce Assistant (Nexus AI)**:
   - Click the floating spark icon in the bottom right corner.
   - Ask an HR question (e.g., *"How many casual leaves do I have left?"* or *"Explain Section 115BAC deductions"*).
3. **Light/Dark Neomorphic Spatial Themes**:
   - Click the sun/moon toggle to show the responsive aesthetic versatility.

---

## 3. High-Value Extra Features to Pitch in Your Presentation

To impress evaluators or investors, highlight these proposed and built-in roadmap features:

1. **Inbuilt WebRTC Video Call & Performance Interview Room** *(Implemented in `/meetings`)*:
   - Dedicated zero-install virtual rooms for remote employee 1:1 appraisals, HR candidate screening, and disciplinary hearings with automated meeting minutes generation.
2. **AI Resume Screening & ATS Talent Pipeline**:
   - Automated parser matching job descriptions against candidate PDFs with contextual scoring and bias-free candidate rankings.
3. **Geofenced Mobile Punch with Facial Recognition**:
   - GPS-bounded attendance recording for hybrid and on-site workers with anti-spoof biometric liveness verification.
4. **Automated Form 16 & Investment Proof OCR Scanner**:
   - Employees snap photos of rent receipts, life insurance, and 80C declarations; computer vision automatically validates and applies tax deductions.
5. **Peer-to-Peer Kudos & Gamified Rewards Hub**:
   - Micro-bonuses, peer recognition badges, and company milestone shoutouts integrated into the team dashboard.
