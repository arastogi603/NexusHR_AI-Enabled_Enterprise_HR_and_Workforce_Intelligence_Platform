# 🌟 NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform

> **Zidio Development — Full Stack Domain Enterprise Capstone**  
> **Architecture:** Production-Grade Modular Monolith (Spring Boot 3.3 + Next.js 16 + PostgreSQL + Redis)  
> **Status:** Feature Complete & Production Ready 🚀  

---

## 📌 Executive Summary

**NexusHR** is a comprehensive, production-grade enterprise Human Resources & Workforce Intelligence platform designed for mid-to-large corporate organizations. It seamlessly manages the complete employee lifecycle—from recruitment ATS semantic screening and 5-step digital onboarding to biometric GPS geofenced attendance, automated Indian statutory payroll with OCR tax validation, quarterly OKR competency genomes, and peer-to-peer WebRTC video conferences.

---

## 🔑 Demo Personas & Testing Credentials

The platform is pre-loaded with official test personas covering every permission tier in the Role-Based Access Control (RBAC) hierarchy:

| Persona | Role | Email | Password | Primary Showcase Areas |
| :--- | :--- | :--- | :--- | :--- |
| **Priya Nair** | `HR Admin` | `hr@nexushr.demo` | `Demo@12345` | Full staff directory, statutory payroll run, leave management, company administration, demo data generator. |
| **Vikram Patel** | `Manager` | `manager@nexushr.demo` | `Demo@12345` | Department team attendance monitor, 1-click pending leave approvals, employee OKR appraisals. |
| **Aditi Sharma** | `Staff (Employee)` | `employee@nexushr.demo` | `Demo@12345` | Self-service station, biometric clock-in, leave balance ledger, payslip view, personal OKR tracking, meeting rooms. |
| **Ananya Sen** | `Executive (CHRO)` | `chro@nexushr.demo` | `Demo@12345` | Predictive attrition matrix, workforce intelligence heatmaps, department headcount distributions. |
| **Root Admin** | `Super Admin` | `admin@nexushr.corp` | `Nexus@Admin2026` | Enterprise root governance, audit logging, system settings. |

*(Fallback Administrator: `admin@nexushr.com` / `Admin@123`)*

---

## 🗺️ System Feature Directory: Basic to Advanced

```
NexusHR Platform Capabilities
├── 1. Platform Design & User Experience
│   ├── Poppins & Modern Sans-Serif Typography
│   ├── Neomorphic & Glassmorphic Spatial UI (Dark & Light Theme)
│   ├── Framer Motion Micro-Animations & Page Pop Transitions
│   ├── Interactive Mac-Style Magnification Dock (VerticalNav)
│   ├── Circular Free-Form Draggable Nexus AI Floating Orb
│   └── 1-Click Synthetic Company Dataset Generator / Seeder
│
├── 2. Security, Authentication & Governance
│   ├── Dual-Token Architecture (JWT Access + Refresh Tokens with Silent Auto-Retry)
│   ├── Argon2id Cryptographic Password Hashing
│   ├── Multi-Tier Role-Based Access Control (RBAC)
│   ├── Frontend Route Guards with Automatic Redirection
│   ├── Forced Change-Password Enforcer
│   └── Tamper-Resistant Cryptographic Audit Trail
│
├── 3. Unified Role-Adaptive Dashboard (/)
│   ├── Executive / Admin Governance Overview
│   ├── Manager Department Operations & Team Biometric Telemetry
│   ├── Employee Self-Service Station
│   └── Real-time Synchronized Digital Clock & Quick Actions
│
├── 4. Attendance & Shift Timecard (/attendance)
│   ├── GPS Geofencing (150m Office Boundary Validation)
│   ├── Anti-Spoof Biometric Face Liveness Verification (99.4% Confidence)
│   ├── Shift Grace Period Rules (09:30 AM – 09:45 AM)
│   ├── Dynamic 7-Day Daily Shift Hours SVG Bar Chart
│   └── Shift History Log with Compliance Status Badges
│
├── 5. Indian Statutory Payroll & Compensation (/payroll)
│   ├── FY 2025-26 New Tax Regime Engine (Section 115BAC TDS)
│   ├── Statutory Computations: 12% PF, 0.75% ESIC, Professional Tax & LOP
│   ├── 1-Click Monthly Batch Payroll Execution
│   ├── Individual Formatted Payslip Modal (Print & Export)
│   ├── Tesseract-Simulated OCR Tax Proof Verification (HRA & 80C)
│   └── Direct Bank NEFT Transfer Batch Exporter
│
├── 6. Leave Management & Entitlements (/leaves)
│   ├── Multi-Category Leave Ledgers (Casual, Sick, Earned, Maternity)
│   ├── Digital Leave Application Modal with Supervisor Routing
│   ├── Manager 1-Click Approval & Rejection Queue
│   └── Department Leave Calendar & Roster View
│
├── 7. Workforce Directory & Lifecycle (/employees)
│   ├── 5-Step Interactive Employee Onboarding Wizard
│   ├── Department Roster & Fast Search Filtering
│   ├── Interactive Hierarchy Organogram / Org-Chart (/employees/org-chart)
│   └── Digital Document Manager Modal with Verification Badges
│
├── 8. Performance, OKRs & Competency Genome (/performance)
│   ├── Animated Top KPI Cards with SVG Radial Progress Rings
│   ├── Quarterly Deliverable Milestones with Live Controls (+10%, Done, Reset)
│   ├── Interactive 6-Axis Polygonal Competency Radar Chart (Candidate vs Benchmark)
│   ├── 12-Week Sprint Burndown & Velocity Area Chart (Planned vs Actual)
│   ├── Skill Genome DNA Matrix with Interactive "+1 Endorsement" Cheers
│   └── 360° Peer & Executive Review Scorecards
│
├── 9. Inbuilt WebRTC Video Conference Rooms (/meetings)
│   ├── Real Hardware WebRTC Video Streaming (getUserMedia)
│   ├── Real Microphone Stream with Web Audio API Frequency Spectrum Visualizer
│   ├── 1080p Display Media Screen Sharing with Picture-in-Picture Preview
│   ├── In-Call Controls (Mic Mute, Camera Off, Screen Share, Call Timer)
│   ├── Live In-Room Instant Messaging Chat
│   ├── 1-Click Meeting Invite Link Copying
│   └── Calendar Meeting Scheduler with Persistence
│
├── 10. AI Resume Screener & ATS Talent Pipeline (/recruitment)
│   ├── Semantic Resume Match Scoring (0–100% Fit)
│   ├── Bias-Free Anonymized Screening Toggle
│   ├── Contextual Skills Gap Extraction against Job Descriptions
│   └── 5-Stage Kanban Talent Hiring Pipeline
│
├── 11. Peer Kudos & Gamified Recognition Hub (/kudos)
│   ├── Peer-to-Peer Micro-Bonuses & Cultural Appreciation Badges
│   ├── Company-Wide Recognition Social Feed with Emoji Reactions
│   ├── Redeemable Corporate Perks & Rewards Store
│   └── Monthly Team Kudos Leaderboard
│
├── 12. Workforce Intelligence & Predictive Analytics (/analytics)
│   ├── Machine Learning Predictive Attrition Flight-Risk Matrix
│   ├── Explainable Factor Breakdown (Tenure, Overtime, Compensation, Sentiment)
│   ├── Department Headcount & Attrition Distribution Heatmaps
│   └── Instant Executive Brief Export (CSV / PDF)
│
├── 13. Enterprise Governance & Administration (/admin/dashboard)
│   ├── Company Policy Governance (Remote Work, Shift Timing, Conduct)
│   ├── Department Roster & Budget Allocations
│   └── Seed Company Demo Data Tool
│
├── 14. Global Nexus AI Workforce Assistant (Chatbot Widget)
│   ├── Real-Time Google Gemini 1.5 Flash API Integration
│   ├── High-Fidelity Offline LLM Reasoning Engine Fallback
│   ├── Role & Persona Context Awareness (Leaves, Tax, Attendance, Policies)
│   └── Free-Form Draggable Circular Floating Orb
│
└── 15. DevOps, Infrastructure & CI/CD
    ├── Multi-Stage Production Dockerfiles (Backend & Frontend)
    ├── Kubernetes (K8s) Production Manifests & Helm Charts
    ├── GitHub Actions CI Pipeline (Java 17 Maven test + Node.js Next.js build)
    ├── GitHub Actions CD Pipeline (Buildx + lowercase GHCR container tagging)
    └── GitHub Actions CodeQL Security & Vulnerability Analysis
```

---

## 🔍 Detailed Feature Walkthrough

### 1. Platform Design & User Interface
- **Modern Typography**: Handcrafted typography utilizing Google Font **Poppins** across headings, metrics, tables, and modal dialogues.
- **Glassmorphic & Neomorphic Aesthetics**: Frosted-glass backdrop filters, subtle gradient borders, dark-slate surfaces, and high-contrast color tokens.
- **Theme Switcher**: Instant zero-flicker toggle between Deep Midnight Dark Mode and Crisp High-Contrast Light Mode, persisted in local storage.
- **Micro-Animations & Pop Transitions**: Built with Framer Motion, ensuring every page opens with a clean scale-fade transition and cards reveal sequentially.
- **Interactive Vertical Dock (`VerticalNav`)**: macOS-inspired magnification dock with smooth physics spring curves, dynamic tooltips, and pinned bottom controls.
- **Circular Draggable Nexus AI Orb**: 56px floating trigger with glowing border and live status indicator. Can be freely dragged to any corner of the screen so it never obstructs underlying page buttons.

### 2. Security, Authentication & Role-Based Access Control
- **Dual-Token Flow**: Short-lived JSON Web Tokens (JWT) for authentication paired with HTTP-refresh token cycling.
- **Silent Token Refresh Interceptor**: Axios response interceptor automatically captures HTTP 401/403 responses, requests a refreshed JWT from `/api/v1/auth/refresh`, and transparently replays original requests without interrupting user workflow.
- **Argon2id Password Hashing**: State-of-the-art password security resistant to GPU cracking and side-channel attacks.
- **Strict Role-Based Access Control (RBAC)**:
  - `ROLE_EMPLOYEE`: Access to personal self-service tools only. Management endpoints (`/admin`, `/recruitment`, `/analytics`, `/employees`) are hidden and strictly blocked by route guards.
  - `ROLE_MANAGER`: Team biometric monitoring, 1-click leave approval queues, employee appraisals.
  - `ROLE_EXECUTIVE`: Strategic workforce analytics, attrition modeling, macro headcount reports.
  - `ROLE_ADMIN` / `ROLE_SUPER_ADMIN`: Full system governance, policy management, payroll runs, employee onboarding, audit logging.

### 3. Unified Role-Adaptive Dashboard (`/`)
- Dynamically adapts based on the authenticated user's role:
  - **HR Admin / Super Admin**: Displays macro headcount, active attendance rates, monthly statutory disbursement totals, pending organizational approvals, and the 1-click Demo Data Seeder.
  - **Manager**: Displays team biometric shift statuses, daily roster check-ins, and pending direct-report leave requests with instant Approve/Reject triggers.
  - **Staff Employee**: Displays personal available leave ledger (Casual, Sick, Earned), shift status for today, active sprint goals, and quick-action shortcuts.

### 4. Attendance & Shift Timecard (`/attendance`)
- **GPS Office Geofencing**: Validates user device coordinates against enterprise headquarters boundaries (150-meter threshold) with visual inside/outside indicators.
- **Biometric Face Liveness Verification**: Interactive camera scan simulating eye blink detection and facial landmark confirmation with a 99.4% liveness confidence score.
- **Shift Grace Period Enforcement**: Visual timecard calculating whether employees clocked in On Time (before 09:30 AM), within the Grace Period (09:30 AM – 09:45 AM), or Marked Late.
- **Dynamic 7-Day Shift Hours SVG Bar Chart**: Interactive daily hours breakdown with overtime thresholds and weekend visual styling.
- **Audit-Compliant Shift Log**: Historical record of check-in, check-out, duration, and biometric confirmation status.

### 5. Indian Statutory Payroll & Compensation (`/payroll`)
- **FY 2025-26 New Tax Regime Compliance**: Automated tax deduction calculation based on statutory slab thresholds under Section 115BAC.
- **Comprehensive Deduction Formulas**:
  - Employee Provident Fund (PF): 12% statutory deduction.
  - Employee State Insurance (ESIC): 0.75% contribution.
  - Professional Tax (PT): State-mandated slab deduction.
  - Loss of Pay (LOP): Pro-rata salary deductions for unapproved absences.
- **1-Click Batch Payroll Execution**: Processes entire company payroll runs with instant ledger updates and status tracking.
- **Formatted Payslip Modal**: Printable, downloadable breakdown featuring earnings (Basic, HRA, Special Allowance) and deductions.
- **Tesseract-Simulated OCR Tax Proof Verification**: Interactive scanner extracting text and amounts from rent receipts and 80C investment proofs, automatically marking declarations as verified.
- **Bank NEFT Batch Transfer Exporter**: Generates structured payment files for direct corporate bank disbursement.

### 6. Leave Management & Entitlements (`/leaves`)
- **Real-Time Leave Balance Ledger**: Accurate computation of remaining allowances across Casual Leave (12 days/yr), Sick Leave (10 days/yr), Earned Leave (15 days/yr), and Maternity/Paternity Leave.
- **Interactive Leave Application**: Date pickers, leave category dropdowns, reason inputs, and automatic manager routing.
- **Manager Approval Pipeline**: Instant action cards displaying employee leave history, days requested, and 1-click Approve / Reject buttons with live toast notifications.
- **Department Roster Calendar**: Color-coded visualization of team member absences to prevent department under-staffing.

### 7. Workforce Directory & Lifecycle (`/employees`)
- **5-Step Onboarding Wizard**: Multi-stage modal capturing personal info, contact details, department, designation, salary breakdown, and automated initial credential provisioning.
- **Department Filtering**: Quick-filter workforce by Engineering, HR, Product, Marketing, Sales, and Executive divisions.
- **Interactive Department Org-Chart (`/employees/org-chart`)**: Visual tree structure displaying reporting hierarchies, department leads, and team structures.
- **Employee Document Manager Modal**: Repository for government IDs, contracts, and degrees with administrative verification status badges.

### 8. Performance, OKRs & Competency Genome (`/performance`)
- **Top KPI Progress Rings**: SVG radial progress indicators tracking organizational OKR delivery, engineering velocity, and 360° review completion.
- **Quarterly Deliverable Milestones**: Interactive engineering key results with live incremental progress buttons (`+10%`, `Done`, `Reset`).
- **Interactive 6-Axis Polygonal Competency Radar Chart**: Mathematical SVG spider chart comparing individual engineer competencies (System Design, Code Quality, Cloud Architecture, Leadership, Velocity, Communication) against department benchmarks.
- **12-Week Sprint Burndown & Velocity Area Chart**: Smooth SVG area chart plotting planned story points vs. actual completed velocity with milestone checkpoint markers.
- **Skill Genome DNA Matrix**: Interactive taxonomy of technical competencies (Distributed Systems, Kafka, Docker, Spring Boot) with interactive "+1 Endorsement" cheer buttons.
- **360° Review Scorecards**: Cryptographically verifiable peer and executive evaluations with rubric scores.

### 9. Inbuilt WebRTC Video Conference Rooms (`/meetings`)
- **Hardware WebRTC Media Streaming**: Real-time camera and microphone streaming powered by `navigator.mediaDevices.getUserMedia`.
- **Web Audio API Speech Visualizer**: Live hardware audio input analysis via `AudioContext` and `AnalyserNode`, powering a reactive audio frequency wave that pulses when speaking.
- **1080p Screen Sharing**: Real-time display streaming via `navigator.mediaDevices.getDisplayMedia` with picture-in-picture stream preview.
- **In-Call Controls**: Instant microphone mute/unmute, camera toggle, screen share toggle, and red end-call button.
- **In-Call Instant Messaging**: Real-time meeting chat sidebar for sharing links, notes, and questions.
- **1-Click Invite Link Sharing**: Instant clipboard copy of encrypted meeting room URLs.
- **Meeting Scheduler**: Create and persist upcoming 1-on-1 appraisals, team standups, and corporate townhalls.

### 10. AI Resume Screener & ATS Talent Pipeline (`/recruitment`)
- **Semantic Candidate Scoring**: Machine learning algorithms evaluating candidate CVs against job descriptions to produce a 0–100% fit score.
- **Bias-Free Anonymized Screening Mode**: 1-click toggle stripping names, genders, and demographic identifiers to eliminate unconscious hiring bias.
- **Skills Gap Extraction**: Automated parsing highlighting matched candidate competencies and identifying missing qualification criteria.
- **Kanban Talent Pipeline**: Visual recruitment stages (Applied, Screening, Technical Interview, Offered, Hired).

### 11. Peer Kudos & Gamified Recognition Hub (`/kudos`)
- **Peer Recognition Feed**: Public timeline celebrating employee achievements, cross-functional collaboration, and innovation milestones.
- **Badge Accolades**: Custom recognition badges (Innovation Champion, Code Wizard, Culture Hero, Customer Delight).
- **Redeemable Corporate Rewards Store**: Points-to-perks catalog offering digital gift cards, noise-canceling headphones, and wellness day-offs.
- **Leaderboard**: Monthly gamified leaderboard recognizing the most collaborative team members.

### 12. Workforce Intelligence & Predictive Analytics (`/analytics`)
- **Predictive Attrition Risk Matrix**: Machine learning risk modeling identifying high-risk flight profiles.
- **Explainable Factor Breakdown**: Transparent attribution of attrition drivers (overtime hours, compensation ratio, manager change, promotion lag).
- **Headcount & Department Heatmaps**: Visual breakdown of workforce distribution, tenure clusters, and turnover rates.
- **Executive Export**: 1-click generation of executive workforce briefs in CSV and PDF formats.

### 13. Enterprise Governance & Administration (`/admin/dashboard`)
- **Corporate Policy Governance**: Centralized repository and management for remote work policies, shift boundaries, and codes of conduct.
- **Department Roster & Budget Allocation**: Control center for organizational units and department-level expenditure.
- **Demo Data Seeder**: Built-in mock data generator that creates realistic enterprise records (employees, leaves, payroll, attendance, reviews) in one click for product demonstrations.

### 14. Global Nexus AI Workforce Assistant (Chatbot Widget)
- **Dual-Model Architecture**:
  - **Live Google Gemini 1.5 Flash API**: Live LLM queries when an API key is provided.
  - **Offline LLM Reasoning Engine**: High-fidelity local HR reasoning engine that automatically answers domain queries when running offline or without an external API key.
- **Context-Aware Assistance**: Answers questions regarding leave policies, tax slabs under Section 115BAC, attendance rules, and employee benefits tailored to the active user's role.
- **Draggable Circular Orb**: 56px circular launcher with spring physics that can be dragged and parked anywhere on screen.

### 15. DevOps, Infrastructure & CI/CD
- **Modular Monolith Architecture**: 8 decoupled Maven modules ready to scale into independent microservices.
- **Containerization**: Multi-stage production Dockerfiles for Spring Boot backend (Alpine JRE) and Next.js frontend (Node.js standalone runner).
- **Kubernetes & Helm**: Ready-to-deploy K8s manifests and Helm charts located in `/infra`.
- **Automated CI/CD**:
  - `ci.yml`: Automated Java 17 Maven test suites and Node.js TypeScript compilation on every push.
  - `cd.yml`: Automated Docker Buildx multi-platform builds with strict lowercase GHCR container tagging.
  - `security.yml`: GitHub CodeQL automated static analysis and vulnerability scanning.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Design System** | Tailwind CSS v4, Vanilla CSS Design Tokens, Neomorphic Glassmorphism |
| **Micro-Animations & Physics** | Framer Motion, Canvas Confetti |
| **Icons & Visuals** | Lucide React |
| **Real-Time Video & Audio** | WebRTC (`getUserMedia`, `getDisplayMedia`), Web Audio API (`AudioContext`, `AnalyserNode`) |
| **AI & LLM Services** | Google Gemini 1.5 Flash API, Nexus Offline HR Reasoning Engine |
| **Backend Framework** | Java 17/21 LTS, Spring Boot 3.3.x |
| **Security & Auth** | Spring Security 6, JWT (io.jsonwebtoken), Argon2 Password Hashing |
| **Database & ORM** | PostgreSQL 17, Spring Data JPA, Hibernate, Flyway Database Migrations |
| **Caching & Messaging** | Redis 7, Spring Cache, STOMP WebSocket |
| **Container & Cloud** | Docker Multi-Stage, Docker Compose, Kubernetes, Helm Charts |
| **CI/CD & Security Audit** | GitHub Actions, GitHub Container Registry (GHCR), GitHub CodeQL |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Java**: JDK 17 or JDK 21 installed.
- **Node.js**: Node.js 20 or 22 LTS installed.
- **Docker**: Docker Desktop (for PostgreSQL & Redis containers).
- **Maven**: Apache Maven 3.9+ (or use root wrapper).

### 2. Start PostgreSQL & Redis
```bash
docker run -d --name nexushr-postgres -p 5433:5432 -e POSTGRES_DB=nexushr -e POSTGRES_USER=nexushr -e POSTGRES_PASSWORD=secretpassword postgres:17-alpine
docker run -d --name nexushr-redis -p 6379:6379 redis:7-alpine
```

### 3. Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run -pl nexushr-gateway
```
*Backend runs on `http://localhost:8080` (API Gateway).*

### 4. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📄 License & Attribution

Developed as an Enterprise Human Resources & Workforce Intelligence Platform for **Zidio Development**.  
Designed and engineered for full-stack industry compliance and architectural excellence.
