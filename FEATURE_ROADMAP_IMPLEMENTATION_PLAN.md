# NexusHR — High-Value Innovation Features: Implementation Plan

This implementation plan details the end-to-end architecture, backend data models, REST APIs, frontend interfaces, and sprint schedules for implementing the high-value enterprise features pitched for **NexusHR**.

---

## 1. Executive Summary & Feature Matrix

| Feature | Primary Stakeholder | Tech Stack & Dependencies | Business & Pitch Value |
| :--- | :--- | :--- | :--- |
| **1. Inbuilt WebRTC Video Call & AI Meeting Notes** | HR & Managers | WebRTC / LiveKit, Spring WebSocket STOMP, Whisper API | Eliminates 3rd-party Zoom/Google Meet licensing; auto-logs 1:1 appraisals to performance records. |
| **2. AI Resume Screening & ATS Talent Pipeline** | Talent Acquisition / HR | Apache Tika, Spring AI (Embeddings), PostgreSQL `pgvector` | Reduces candidate screening time by 75%; enforces bias-free anonymized screening. |
| **3. Geofenced Mobile Punch & Biometric Face Liveness** | On-Site / Remote Staff | `face-api.js` / OpenCV, Geolocation API, Haversine formula | Prevents buddy punching & proxy attendance; verifies physical presence within office geo-fencing. |
| **4. Automated Form 16 & Tax Proof OCR Scanner** | Payroll & Finance | Tesseract / AWS Textract, Spring Batch, PDFBox | Automatically verifies Section 80C/80D/HRA proofs; cuts tax auditing bottlenecks during FY closing. |
| **5. Peer-to-Peer Kudos & Gamification Hub** | All Employees & Culture Teams | Redis Pub/Sub, Spring Events, Framer Motion | Boosts retention and employee morale; provides real-time recognition feed with redeemable points. |

---

## 2. Feature 1: Enterprise WebRTC Video Call & AI Summarizer

### Architecture & Signaling Flow
```
[Client A (Browser)] <--- STOMP WebSocket Signaling (/topic/meeting/{id}) ---> [NexusHR Gateway]
        |                                                                            |
        +===================== P2P WebRTC Audio/Video Stream ========================+
        |                                                                            |
[Client B (Browser)] <---------------------------------------------------------------+
```

### Database Schema (Flyway `V11__video_meetings.sql`)
```sql
CREATE TABLE video_meetings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'ONE_ON_ONE', 'STANDUP', 'INTERVIEW', 'TOWNHALL'
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    host_employee_id VARCHAR(36) REFERENCES employees(id),
    room_token VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'ACTIVE', 'CONCLUDED', 'CANCELLED'
    recording_url VARCHAR(500),
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meeting_attendees (
    meeting_id VARCHAR(36) REFERENCES video_meetings(id) ON DELETE CASCADE,
    employee_id VARCHAR(36) REFERENCES employees(id),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'PARTICIPANT',
    PRIMARY KEY (meeting_id, employee_id)
);
```

### Backend REST APIs & WebSocket
- `POST /api/v1/meetings`: Schedule session & generate secure room token.
- `GET /api/v1/meetings/my`: List scheduled and past meetings for authenticated user.
- `POST /api/v1/meetings/{id}/join`: Verify permissions and return WebRTC ICE candidate configuration (STUN/TURN).
- `POST /api/v1/meetings/{id}/end`: Conclude room and trigger asynchronous AI transcription.
- `/topic/meeting/{id}/signals`: Exchange SDP offers/answers and ICE candidates over existing STOMP broker.

### Frontend Integration
- Already prototyped at [`/meetings`](file:///c:/Users/arast/Downloads/Zidio/frontend/src/app/meetings/page.tsx).
- Add LiveKit / WebRTC `RTCPeerConnection` hook to connect real local media streams (`navigator.mediaDevices.getUserMedia`).

---

## 3. Feature 2: AI-Powered Resume Screening & ATS Talent Pipeline

### Workflow
```
[Candidate PDF Upload] 
       │
       ▼
[Apache Tika Text Extraction]
       │
       ▼
[Spring AI / OpenAI Text Embeddings (text-embedding-3-small)]
       │
       ▼
[pgvector Cosine Similarity Match against Job Description Vector]
       │
       ▼
[Match Score (0-100%) + Key Skills Gap Extraction + Anonymized HR View]
```

### Database Schema (Flyway `V12__ats_resume_screening.sql`)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE job_openings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id),
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    experience_years_min INT DEFAULT 0,
    embedding vector(1536),
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidates (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) REFERENCES job_openings(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    resume_file_url VARCHAR(500) NOT NULL,
    parsed_experience_years NUMERIC(4,1),
    parsed_skills TEXT[],
    embedding vector(1536),
    fit_score NUMERIC(5,2), -- 0.00 to 100.00
    ai_feedback TEXT,
    stage VARCHAR(30) DEFAULT 'APPLIED', -- 'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Implementation Details
1. **Module**: `nexushr-employee` / new module `nexushr-recruitment`.
2. **Text Parsing**: `TikaDocumentReader` extracts plain text from PDF/DOCX.
3. **Similarity Search**:
   ```sql
   SELECT id, full_name, 1 - (embedding <=> :jobEmbedding) AS similarity
   FROM candidates WHERE job_id = :jobId ORDER BY similarity DESC LIMIT 20;
   ```
4. **Bias-Free Mode**: A toggle in the UI masks candidate names, genders, and universities during initial resume ranking.

---

## 4. Feature 3: Geofenced Mobile Punch & Biometric Face Verification

### Technical Workflow
1. **Geofence Calculation**:
   - Organization defines GPS latitude, longitude, and radius (e.g., 100m from office coordinates).
   - Client captures `navigator.geolocation.getCurrentPosition`.
   - Backend calculates distance using the Haversine formula:
     $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
2. **Biometric Face Verification**:
   - Client webcam captures video frame.
   - Lightweight `face-api.js` (Tiny Face Detector + 128D Face Descriptor) extracts facial landmarks and checks for blink liveness.
   - 128D descriptor vector is matched against employee's onboarding face template stored in DB.

### Database Updates
```sql
ALTER TABLE departments ADD COLUMN office_latitude NUMERIC(10, 7);
ALTER TABLE departments ADD COLUMN office_longitude NUMERIC(10, 7);
ALTER TABLE departments ADD COLUMN geofence_radius_meters INT DEFAULT 150;

ALTER TABLE employees ADD COLUMN biometric_face_descriptor FLOAT8[];

ALTER TABLE attendance_records ADD COLUMN punch_latitude NUMERIC(10, 7);
ALTER TABLE attendance_records ADD COLUMN punch_longitude NUMERIC(10, 7);
ALTER TABLE attendance_records ADD COLUMN geofence_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance_records ADD COLUMN face_match_score NUMERIC(5,2);
```

---

## 5. Feature 4: Automated Form 16 & Investment Proof OCR Scanner

### Objective
Automate statutory year-end tax proof submission for Section 80C (PPF, ELSS, Life Insurance), Section 80D (Health Insurance), and Section 10(13A) House Rent Allowance (HRA).

### Technical Pipeline
1. Employee uploads rent receipts / investment certificates (`/payroll/tax-declarations`).
2. Spring Batch worker ingests uploaded files via `TesseractOCRService` / AWS Textract.
3. Regex and NLP extractors identify:
   - Policy / Account Number
   - PAN of Landlord (for HRA > ₹1,00,000/yr)
   - Date of Payment (validates FY 2025-26 window)
   - Amount Paid
4. Extracted values are compared with declared limits. Discrepancies are highlighted in red for HR approval; matching proofs are auto-verified.

---

## 6. Feature 5: Peer-to-Peer Kudos & Gamified Rewards Hub

### Overview
A modern social recognition feed where colleagues award peer kudos points (e.g. 500 points/month allowance) with company core value badges:
- 💡 *Innovation & Problem Solving*
- 🤝 *Teamwork & Collaboration*
- 🚀 *Above and Beyond Customer Delight*
- 🎯 *Flawless Execution*

### Architecture & Live Feed
- Backend `KudosService` publishes to Redis channel `kudos:events`.
- WebSocket pushes live cards to all connected client headers.
- Integrated **Nexus Points Wallet** where accumulated points can be redeemed for company merchandise, extra wellness leave days, or gift vouchers.

---

## 7. Phased Implementation Roadmap (Sprints 1–4)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Sprint 1: WebRTC Video Call & Inbuilt Calendar (Weeks 1 - 2)           │
│   • Complete WebRTC STOMP signaling in nexushr-gateway                  │
│   • Connect real media stream & screen share in /meetings UI           │
│   • Auto-create meeting attendance records on call departure           │
├────────────────────────────────────────────────────────────────────────┤
│ Sprint 2: AI Resume Screener & ATS Candidate Pipeline (Weeks 3 - 4)    │
│   • Ingest PDF resumes via Apache Tika                                 │
│   • Vector embeddings and pgvector similarity search                   │
│   • Kanban pipeline UI (Applied -> Shortlisted -> Interview -> Hired)  │
├────────────────────────────────────────────────────────────────────────┤
│ Sprint 3: Geofenced Attendance & Facial Verification (Weeks 5 - 6)    │
│   • Department geofence configuration in /admin/dashboard              │
│   • Haversine distance validation in AttendanceService                 │
│   • Web-based face landmark detector with anti-spoof liveness check    │
├────────────────────────────────────────────────────────────────────────┤
│ Sprint 4: Tax Proof OCR Scanner & Peer Kudos Hub (Weeks 7 - 8)         │
│   • OCR extraction for 80C & HRA rent receipts                         │
│   • Social Kudos feed and rewards points ledger                        │
│   • Unified analytics dashboard combining culture, attendance & hiring │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Presentation Pitch Highlights

When presenting these features to clients or evaluators:
1. **Cost Consolidation**: NexusHR eliminates the need for 4 separate enterprise subscriptions (Zoom/Meet, Greenhouse/Lever ATS, Keka Attendance, and Bonusly Rewards).
2. **Indian Statutory Compliance**: Pre-engineered for FY 2025-26 Section 115BAC New Tax Regime, auto-calculating TDS, PF, and HRA relief out-of-the-box.
3. **Enterprise Security & Observability**: Immutable audit ledger, role-based access control, and self-hosted on Spring Boot 3 + Next.js with zero 3rd-party vendor lock-in.
