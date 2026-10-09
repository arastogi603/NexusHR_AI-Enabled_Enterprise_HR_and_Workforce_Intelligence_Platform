# 🏗️ NexusHR — System Design & Architecture Document

> **Version:** 2.0  
> **Last Updated:** October 2026  
> **Architecture Style:** Modular Monolith → Microservices-ready  
> **Deployment Model:** Containerized on Kubernetes

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

```
                    ┌──────────────────────────────────────┐
                    │           CDN (CloudFront)           │
                    └────────────────┬─────────────────────┘
                                     │
                    ┌────────────────▼─────────────────────┐
                    │        Load Balancer (ALB)            │
                    │      (TLS Termination, HTTPS)         │
                    └──────┬─────────────────┬─────────────┘
                           │                 │
              ┌────────────▼──────┐  ┌───────▼──────────────┐
              │   Frontend (SPA)  │  │   API Gateway         │
              │   React 19 + TS   │  │   Spring Cloud GW     │
              │   Vite + shadcn   │  │   Rate Limit + Auth   │
              │   (S3 / Nginx)    │  │   Request Routing     │
              └───────────────────┘  └───────┬──────────────┘
                                             │
                    ┌────────────────────────▼──────────────────────────┐
                    │              APPLICATION SERVICES                  │
                    │  ┌──────────┐ ┌──────────┐ ┌────────────────┐    │
                    │  │   Auth   │ │ Employee │ │   Payroll      │    │
                    │  │ Service  │ │ Service  │ │   Service      │    │
                    │  └────┬─────┘ └────┬─────┘ └───────┬────────┘    │
                    │  ┌────┴─────┐ ┌────┴─────┐ ┌───────┴────────┐    │
                    │  │Performan.│ │Analytics │ │ Notification   │    │
                    │  │ Service  │ │ Service  │ │   Service      │    │
                    │  └──────────┘ └──────────┘ └────────────────┘    │
                    └──────┬───────────┬────────────────┬───────────────┘
                           │           │                │
              ┌────────────▼──┐  ┌─────▼──────┐  ┌─────▼──────┐
              │ PostgreSQL 17 │  │  Redis 7+  │  │  Amazon S3 │
              │ Primary DB    │  │  Cache/Pub │  │  Documents │
              └───────────────┘  └────────────┘  └────────────┘
                           │
              ┌────────────▼──────────────────────────────┐
              │         OBSERVABILITY LAYER                │
              │  Prometheus · Grafana · Sentry · Logging   │
              └───────────────────────────────────────────┘
```

### 1.2 Architecture Principles

| Principle | Application |
|---|---|
| **Separation of Concerns** | Each Maven module owns its domain (auth, employee, payroll, etc.) |
| **Domain-Driven Design** | Bounded contexts per module, rich domain models |
| **API-First** | OpenAPI spec, contract-driven frontend-backend development |
| **Fail-Fast** | Input validation at API boundary, circuit breakers |
| **Security by Design** | JWT auth, RBAC, input sanitization, audit logging |
| **Observability** | Structured logging, metrics, health checks in every service |
| **12-Factor App** | Environment-based config, stateless processes, disposability |

---

## 2. Module Architecture (Backend)

### 2.1 Maven Multi-Module Dependency Graph

```
nexushr-parent (POM)
│
├── nexushr-common           ← Shared DTOs, exceptions, utils, base entities
│     ▲    ▲    ▲    ▲    ▲
│     │    │    │    │    │
├── nexushr-auth ────────────── JWT, login, signup, role management
│     ▲
│     │
├── nexushr-employee ────────── Employee CRUD, attendance, leave
│     ▲         ▲
│     │         │
├── nexushr-payroll ─────────── Salary calc, tax, payslips
│     │
├── nexushr-performance ─────── Goals, reviews, feedback, ratings
│     │
├── nexushr-analytics ──────── AI insights, reports, dashboards
│     │
├── nexushr-notification ───── Email, WebSocket, in-app alerts
│
└── nexushr-gateway ─────────── API routing, rate limiting, aggregation
      (depends on all above via REST)
```

### 2.2 Module Responsibilities

| Module | Domain | Key Entities | Exposed APIs |
|---|---|---|---|
| `nexushr-common` | Shared infrastructure | BaseEntity, AuditEntity, DTOs | — (library) |
| `nexushr-auth` | Identity & access | User, Role, Permission, RefreshToken | `/api/auth/**` |
| `nexushr-employee` | Employee lifecycle | Employee, Department, Attendance, Leave | `/api/employees/**`, `/api/attendance/**`, `/api/leaves/**` |
| `nexushr-payroll` | Compensation | PayrollRun, Payslip, TaxConfig, Allowance | `/api/payroll/**` |
| `nexushr-performance` | Performance mgmt | Goal, Review, Feedback, Rating | `/api/performance/**` |
| `nexushr-analytics` | Intelligence | AttritionScore, EngagementMetric, SkillGap | `/api/analytics/**`, `/api/ai/**` |
| `nexushr-notification` | Communication | Notification, EmailTemplate | `/api/notifications/**` |
| `nexushr-gateway` | API entry point | — | Routes to all services |

---

## 3. Database Design

### 3.1 Entity-Relationship Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▶│     Role     │     │  Department  │
│──────────────│     │──────────────│     │──────────────│
│ id (UUID)    │     │ id           │     │ id (UUID)    │
│ email        │     │ name         │     │ name         │
│ password_hash│     │ permissions[]│     │ head_id (FK) │
│ role_id (FK) │     └──────────────┘     │ parent_id    │
│ emp_id (FK)  │                          └──────┬───────┘
└──────┬───────┘                                 │
       │                                         │
       ▼                                         │
┌──────────────┐◄────────────────────────────────┘
│   Employee   │
│──────────────│     ┌──────────────┐     ┌──────────────┐
│ id (UUID)    │────▶│  Attendance  │     │    Leave      │
│ emp_code     │     │──────────────│     │──────────────│
│ first_name   │     │ id (UUID)    │     │ id (UUID)    │
│ last_name    │     │ emp_id (FK)  │     │ emp_id (FK)  │
│ email        │     │ date         │     │ type         │
│ phone        │     │ clock_in     │     │ start_date   │
│ hire_date    │     │ clock_out    │     │ end_date     │
│ dept_id (FK) │     │ status       │     │ status       │
│ manager_id   │     │ work_hours   │     │ approved_by  │
│ designation  │     └──────────────┘     └──────────────┘
│ salary       │
│ status       │     ┌──────────────┐     ┌──────────────┐
│ metadata{}   │────▶│ PayrollRun   │     │    Goal      │
└──────────────┘     │──────────────│     │──────────────│
                     │ id (UUID)    │     │ id (UUID)    │
                     │ emp_id (FK)  │     │ emp_id (FK)  │
                     │ month/year   │     │ title        │
                     │ basic_salary │     │ description  │
                     │ allowances   │     │ target_date  │
                     │ deductions   │     │ progress     │
                     │ tax          │     │ status       │
                     │ net_salary   │     └──────────────┘
                     │ status       │
                     └──────────────┘     ┌──────────────┐
                                          │   Review     │
┌──────────────┐     ┌──────────────┐     │──────────────│
│  AuditLog    │     │ Notification │     │ id (UUID)    │
│──────────────│     │──────────────│     │ emp_id (FK)  │
│ id (UUID)    │     │ id (UUID)    │     │ reviewer_id  │
│ entity_type  │     │ user_id (FK) │     │ period       │
│ entity_id    │     │ title        │     │ rating       │
│ action       │     │ message      │     │ feedback     │
│ old_value{}  │     │ type         │     │ status       │
│ new_value{}  │     │ read         │     └──────────────┘
│ performed_by │     │ channel      │
│ timestamp    │     └──────────────┘
└──────────────┘
```

### 3.2 Key Design Decisions

| Decision | Rationale |
|---|---|
| **UUID primary keys** | No sequential ID guessing, safe for distributed systems |
| **Soft deletes** (`deleted_at`) | Audit trail preservation, data recovery capability |
| **Audit columns** on every entity | `created_at`, `updated_at`, `created_by`, `updated_by` via JPA Auditing |
| **JSONB metadata columns** | Flexible extension without schema migration for custom fields |
| **Enum-as-string** in DB | Readable data, easier debugging |
| **Flyway migrations** | Version-controlled, repeatable schema changes |

### 3.3 Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_employee_department ON employees(department_id);
CREATE INDEX idx_employee_manager ON employees(manager_id);
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_attendance_emp_date ON attendance(employee_id, date);
CREATE INDEX idx_leave_emp_status ON leaves(employee_id, status);
CREATE INDEX idx_payroll_emp_period ON payroll_runs(employee_id, month, year);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notification_user_read ON notifications(user_id, is_read);

-- JSONB GIN index for metadata queries
CREATE INDEX idx_employee_metadata ON employees USING GIN(metadata);
```

---

## 4. API Design

### 4.1 API Architecture

```
                      ┌─────────────────────────┐
                      │    API Gateway           │
                      │  /api/v1/**              │
                      │                         │
                      │  ┌─────────────────┐    │
                      │  │  JWT Filter     │    │
                      │  │  Rate Limiter   │    │
                      │  │  CORS Config    │    │
                      │  │  Request Logger │    │
                      │  └─────────────────┘    │
                      └────────┬────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     /api/v1/auth/**    /api/v1/employees/**   /api/v1/payroll/**
     /api/v1/roles/**   /api/v1/attendance/**   /api/v1/analytics/**
                        /api/v1/leaves/**       /api/v1/ai/**
                        /api/v1/departments/**  /api/v1/notifications/**
```

### 4.2 Core API Endpoints

#### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Authenticate & get tokens | No |
| POST | `/refresh` | Refresh access token | Refresh Token |
| POST | `/logout` | Invalidate tokens | Yes |
| GET | `/me` | Get current user profile | Yes |

#### Employees (`/api/v1/employees`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/` | List employees (paginated, filtered) | ADMIN, MANAGER |
| POST | `/` | Create employee (onboarding) | ADMIN |
| GET | `/{id}` | Get employee details | ADMIN, MANAGER, SELF |
| PUT | `/{id}` | Update employee | ADMIN, SELF (limited) |
| DELETE | `/{id}` | Soft-delete (offboard) | ADMIN |
| POST | `/{id}/documents` | Upload document | ADMIN, SELF |
| GET | `/search?q=` | Full-text search | ADMIN, MANAGER |

#### Attendance (`/api/v1/attendance`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/clock-in` | Clock in | EMPLOYEE |
| POST | `/clock-out` | Clock out | EMPLOYEE |
| GET | `/today` | Today's attendance | EMPLOYEE |
| GET | `/history?from=&to=` | Attendance history | EMPLOYEE, MANAGER |
| GET | `/team` | Team attendance dashboard | MANAGER |
| GET | `/report` | Attendance report (export) | ADMIN |

#### Leave (`/api/v1/leaves`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Apply for leave | EMPLOYEE |
| GET | `/balance` | Get leave balance | EMPLOYEE |
| GET | `/requests` | List pending requests | MANAGER |
| PUT | `/{id}/approve` | Approve leave | MANAGER |
| PUT | `/{id}/reject` | Reject leave | MANAGER |
| GET | `/calendar` | Team leave calendar | MANAGER |

#### Payroll (`/api/v1/payroll`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/run` | Execute monthly payroll | ADMIN |
| GET | `/runs` | List payroll runs | ADMIN |
| GET | `/payslips/{empId}` | Get employee payslips | ADMIN, SELF |
| GET | `/payslips/{id}/pdf` | Download payslip PDF | ADMIN, SELF |
| GET | `/summary` | Payroll summary report | ADMIN |

#### Performance (`/api/v1/performance`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/goals` | Create goal (OKR) | EMPLOYEE, MANAGER |
| PUT | `/goals/{id}` | Update goal progress | EMPLOYEE |
| POST | `/reviews` | Create performance review | MANAGER |
| POST | `/feedback` | Submit 360° feedback | ALL |
| GET | `/scorecard/{empId}` | Get performance scorecard | MANAGER, SELF |

#### AI & Analytics (`/api/v1/analytics`, `/api/v1/ai`)
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/dashboard/admin` | Admin KPI dashboard | ADMIN |
| GET | `/dashboard/manager` | Manager team metrics | MANAGER |
| GET | `/attrition/predictions` | AI attrition risk scores | ADMIN, MANAGER |
| GET | `/skills/gaps` | Skill gap analysis | MANAGER |
| GET | `/engagement/scores` | Engagement scoring | ADMIN |
| POST | `/ai/chat` | AI assistant query | ALL |
| GET | `/reports/export` | Export report (PDF/Excel) | ADMIN |

### 4.3 API Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-10-10T12:00:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}

// Paginated Response
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "timestamp": "2026-10-10T12:00:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "Employee with ID xxx not found",
    "details": [ ... ]
  },
  "timestamp": "2026-10-10T12:00:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

## 5. Authentication & Authorization Flow

### 5.1 JWT Authentication Flow

```
┌──────────┐                    ┌──────────────┐                  ┌──────────┐
│  Client  │                    │  API Gateway │                  │ Auth Svc │
│ (React)  │                    │  (JWT Filter)│                  │          │
└────┬─────┘                    └──────┬───────┘                  └────┬─────┘
     │                                 │                               │
     │  1. POST /api/v1/auth/login     │                               │
     │  {email, password}              │                               │
     │────────────────────────────────▶│──────────────────────────────▶│
     │                                 │                               │
     │                                 │    2. Validate credentials     │
     │                                 │    3. Generate JWT tokens      │
     │                                 │◀──────────────────────────────│
     │  4. {accessToken, refreshToken} │                               │
     │◀────────────────────────────────│                               │
     │                                 │                               │
     │  5. GET /api/v1/employees       │                               │
     │  Authorization: Bearer <token>  │                               │
     │────────────────────────────────▶│                               │
     │                                 │  6. Validate JWT              │
     │                                 │  7. Extract roles             │
     │                                 │  8. Check @PreAuthorize       │
     │                                 │  9. Route to service          │
     │  10. Response                   │                               │
     │◀────────────────────────────────│                               │
```

### 5.2 Role-Based Access Control (RBAC)

```
SUPER_ADMIN
  └── ADMIN (HR Administrator)
        ├── Full employee CRUD
        ├── Payroll management
        ├── System configuration
        ├── All reports & analytics
        └── User management
  └── MANAGER (Department Manager)
        ├── Team employee view
        ├── Leave approval
        ├── Performance reviews
        ├── Team analytics
        └── Team attendance
  └── EMPLOYEE (Self-Service)
        ├── Own profile view/edit
        ├── Clock in/out
        ├── Leave application
        ├── View payslips
        ├── Goal management
        └── Own performance view
```

---

## 6. Frontend Architecture

### 6.1 Component Architecture

```
src/
├── app/                          # App-level configuration
│   ├── App.tsx                   # Root component
│   ├── router.tsx                # Route definitions
│   └── providers.tsx             # Global providers (Query, Auth, Theme)
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── PageContainer.tsx
│   │   └── DashboardLayout.tsx
│   ├── charts/                   # Chart components
│   │   ├── AttendanceChart.tsx
│   │   ├── PayrollChart.tsx
│   │   └── AttritionRiskChart.tsx
│   └── shared/                   # Shared components
│       ├── DataTable.tsx
│       ├── StatusBadge.tsx
│       ├── Avatar.tsx
│       └── LoadingSkeleton.tsx
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── api/
│   │       └── authApi.ts
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   └── EmployeeDashboard.tsx
│   │   └── components/
│   │       ├── KpiCard.tsx
│   │       ├── QuickActions.tsx
│   │       └── RecentActivity.tsx
│   │
│   ├── employees/
│   │   ├── pages/
│   │   │   ├── EmployeeListPage.tsx
│   │   │   ├── EmployeeDetailPage.tsx
│   │   │   └── OnboardingWizard.tsx
│   │   ├── components/
│   │   │   ├── EmployeeCard.tsx
│   │   │   └── EmployeeForm.tsx
│   │   └── api/
│   │       └── employeeApi.ts
│   │
│   ├── attendance/
│   ├── leaves/
│   ├── payroll/
│   ├── performance/
│   ├── analytics/
│   └── notifications/
│
├── hooks/                        # Global custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── lib/                          # Utilities & configuration
│   ├── api.ts                    # Axios instance with interceptors
│   ├── auth.ts                   # Token management
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── notificationStore.ts
│
├── types/                        # TypeScript type definitions
│   ├── employee.ts
│   ├── payroll.ts
│   ├── api.ts
│   └── index.ts
│
└── styles/
    └── globals.css               # Tailwind + custom styles
```

### 6.2 Routing Structure

```
/                           → Redirect to /dashboard
/login                      → Login page (public)
/forgot-password            → Password reset (public)

/dashboard                  → Role-based dashboard (auto-detect)
  /dashboard/admin          → Admin dashboard
  /dashboard/manager        → Manager dashboard
  /dashboard/employee       → Employee dashboard

/employees                  → Employee list (ADMIN)
  /employees/new            → Onboarding wizard (ADMIN)
  /employees/:id            → Employee detail (ADMIN, MANAGER)

/attendance                 → Attendance view
  /attendance/team          → Team attendance (MANAGER)
  /attendance/reports       → Attendance reports (ADMIN)

/leaves                     → Leave management
  /leaves/apply             → Apply for leave (EMPLOYEE)
  /leaves/requests          → Pending approvals (MANAGER)
  /leaves/calendar          → Team calendar (MANAGER)

/payroll                    → Payroll management (ADMIN)
  /payroll/run              → Run payroll (ADMIN)
  /payroll/payslips         → My payslips (EMPLOYEE)

/performance                → Performance hub
  /performance/goals        → My goals (EMPLOYEE)
  /performance/reviews      → Reviews (MANAGER)
  /performance/feedback     → 360° feedback

/analytics                  → Analytics & AI insights (ADMIN, MANAGER)
  /analytics/attrition      → Attrition predictions
  /analytics/skills         → Skill gap analysis
  /analytics/reports        → Reports & exports

/settings                   → Profile & preferences
/notifications              → Notification center
```

### 6.3 State Management Strategy

| State Type | Tool | Examples |
|---|---|---|
| **Server State** | TanStack Query | Employee lists, payroll data, attendance records |
| **Auth State** | Zustand + localStorage | Current user, tokens, permissions |
| **UI State** | Zustand | Theme (dark/light), sidebar open/close |
| **Form State** | React Hook Form | Employee forms, leave applications |
| **URL State** | React Router | Filters, pagination, active tab |

---

## 7. Real-Time Architecture (WebSocket)

```
┌──────────────┐        WebSocket (STOMP)        ┌──────────────┐
│   Browser    │◄───────────────────────────────▶│  Spring WS   │
│   Client     │    /ws                          │  Server      │
│              │                                 │              │
│  @stomp/     │    Subscribe:                   │  SimpMessag. │
│  stompjs     │    /user/queue/notifications    │  Template    │
│              │    /topic/attendance             │              │
└──────────────┘                                 └──────┬───────┘
                                                        │
                                                 ┌──────▼───────┐
                                                 │  Redis Pub/  │
                                                 │  Sub Channel │
                                                 └──────────────┘
```

**WebSocket Events:**
- Leave request approved/rejected → Employee notification
- New employee onboarded → Manager notification
- Payroll processed → Employee payslip ready
- Attendance anomaly detected → Manager alert
- AI insight generated → Admin notification

---

## 8. AI Integration Architecture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Analytics   │────▶│   Spring AI   │────▶│  OpenAI / HF     │
│  Service     │     │   Client      │     │  Model API       │
│              │     │               │     │                  │
│  Scheduled   │     │  Prompt       │     │  GPT-4 /         │
│  Jobs +      │     │  Templates    │     │  Custom Models   │
│  On-Demand   │     │  + Context    │     │                  │
└──────┬───────┘     └───────────────┘     └──────────────────┘
       │
       ▼
┌──────────────┐
│  AI Results  │
│  Cache       │
│  (Redis)     │
│  TTL: 24h    │
└──────────────┘
```

### AI Feature Implementation Details

| Feature | Input Data | AI Processing | Output |
|---|---|---|---|
| **Attrition Prediction** | Attendance patterns, performance scores, tenure, salary band, leave frequency | Prompt-based analysis via Spring AI → Risk classification | Risk score (0-100), risk level (Low/Med/High), contributing factors |
| **Skill Gap Analysis** | Employee skills, project requirements, training history | Comparison analysis, recommendation generation | Gap report, recommended trainings, priority ranking |
| **Engagement Scoring** | Attendance regularity, goal completion, feedback sentiment, peer interaction | Multi-factor weighted scoring + AI interpretation | Engagement score, trend direction, improvement suggestions |
| **Smart Recommendations** | Aggregated employee analytics | AI-generated action items | Retention strategies, promotion candidates, training plans |

---

## 9. Deployment Architecture

### 9.1 Kubernetes Deployment

```
┌─────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster (EKS)                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Namespace: nexushr-prod                        │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  Backend     │  │  Frontend    │             │    │
│  │  │  Deployment  │  │  Deployment  │             │    │
│  │  │  replicas: 3 │  │  replicas: 2 │             │    │
│  │  │  HPA: 3-10  │  │  (Nginx)     │             │    │
│  │  └──────┬───────┘  └──────┬───────┘             │    │
│  │         │                 │                     │    │
│  │  ┌──────▼─────────────────▼───────┐             │    │
│  │  │        Service (ClusterIP)     │             │    │
│  │  └──────────────┬─────────────────┘             │    │
│  │                 │                               │    │
│  │  ┌──────────────▼─────────────────┐             │    │
│  │  │     Ingress (ALB Controller)   │             │    │
│  │  │     TLS, path-based routing    │             │    │
│  │  └────────────────────────────────┘             │    │
│  │                                                 │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐   │    │
│  │  │ ConfigMap │  │  Secret   │  │    PVC    │   │    │
│  │  └───────────┘  └───────────┘  └───────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  PostgreSQL      │  │  Redis           │             │
│  │  (StatefulSet    │  │  (StatefulSet    │             │
│  │   or RDS)        │  │   or ElastiCache)│             │
│  └──────────────────┘  └──────────────────┘             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Monitoring Namespace                            │   │
│  │  Prometheus · Grafana · AlertManager             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 9.2 CI/CD Pipeline Flow

```
┌────────┐    ┌──────┐    ┌───────┐    ┌───────┐    ┌────────┐    ┌────────┐
│  Push  │───▶│ Lint │───▶│ Test  │───▶│ Build │───▶│  Push  │───▶│Deploy  │
│  Code  │    │Check │    │       │    │Docker │    │ Image  │    │  K8s   │
└────────┘    └──────┘    └───────┘    └───────┘    └────────┘    └────────┘
                │             │            │             │            │
          Checkstyle     JUnit 5     Multi-stage      GHCR /     kubectl /
          ESLint        Jest         Dockerfile       ECR         Helm
          Prettier    Testcontainers                             upgrade
```

---

## 10. Security Architecture

### 10.1 Defense in Depth

```
Layer 1: Network        → TLS 1.3, VPC isolation, Security Groups
Layer 2: Edge           → Rate limiting, WAF rules, DDoS protection
Layer 3: Authentication → JWT with short expiry, refresh rotation
Layer 4: Authorization  → @PreAuthorize RBAC, method-level security
Layer 5: Input          → Bean Validation, Zod schemas, sanitization
Layer 6: Data           → Parameterized queries, AES-256 encryption
Layer 7: Audit          → Complete audit log, tamper detection
Layer 8: Monitoring     → Anomaly detection, failed auth alerts
```

### 10.2 OWASP Top 10 Mitigation Matrix

| # | Vulnerability | Mitigation |
|---|---|---|
| A01 | Broken Access Control | RBAC with @PreAuthorize, ownership checks |
| A02 | Cryptographic Failures | AES-256, Argon2id, TLS 1.3, no secrets in code |
| A03 | Injection | JPA parameterized queries, input validation |
| A04 | Insecure Design | Threat modeling, principle of least privilege |
| A05 | Security Misconfiguration | Hardened defaults, CSP headers, no debug in prod |
| A06 | Vulnerable Components | Dependabot, OWASP Dependency Check |
| A07 | Auth & Session Failures | Short-lived JWT, refresh rotation, blacklisting |
| A08 | Data Integrity Failures | Signed JWTs, integrity checks, CI/CD security |
| A09 | Logging & Monitoring | Structured logging, Prometheus alerts, Sentry |
| A10 | SSRF | URL whitelist, no user-controlled URLs in backend |

---

## 11. Performance Design

### 11.1 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|---|---|---|---|
| JWT blacklist | Redis | Until token expiry | On logout |
| Employee list (paginated) | Redis | 60s | On employee CRUD |
| Dashboard metrics | Redis | 30s | Time-based |
| Department hierarchy | Redis | 5 min | On department change |
| Payroll summary | Redis | 10 min | On payroll run |
| AI predictions | Redis | 24h | On scheduled refresh |

### 11.2 Database Optimization

- **Connection pooling:** HikariCP with optimal pool size
- **Query optimization:** Indexed lookups, pagination, projection queries
- **Lazy loading:** Avoid N+1 with `@EntityGraph`
- **Read replicas:** For reporting queries (production)

### 11.3 Frontend Optimization

- **Code splitting:** Lazy-loaded routes
- **Image optimization:** WebP format, lazy loading
- **Bundle optimization:** Tree shaking, Vite chunking
- **API optimization:** TanStack Query stale-while-revalidate, pagination
- **Target:** Lighthouse score > 90 (Performance, Accessibility, Best Practices)

---

## 12. Monitoring & Alerting Design

### 12.1 Key Metrics (SLIs)

| Metric | Source | Alert Threshold |
|---|---|---|
| API Response Time (p95) | Prometheus / Micrometer | > 500ms |
| Error Rate (5xx) | Prometheus | > 1% |
| CPU Usage | Kubernetes metrics | > 80% |
| Memory Usage | Kubernetes metrics | > 85% |
| DB Connection Pool | HikariCP metrics | > 90% utilization |
| Failed Login Attempts | Custom metric | > 10 in 5 min |
| Payroll Run Duration | Custom metric | > 5 min |

### 12.2 Grafana Dashboards

1. **System Health** — JVM metrics, GC, threads, memory
2. **API Performance** — Request rate, latency, error rate
3. **Business KPIs** — Active employees, pending leaves, payroll status
4. **Security** — Failed logins, blocked IPs, audit events

---

> **This design document serves as the engineering blueprint** for NexusHR. It will be updated as implementation progresses and architectural decisions evolve.
