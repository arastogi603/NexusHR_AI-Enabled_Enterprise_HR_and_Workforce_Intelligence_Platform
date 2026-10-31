/**
 * Google Gemini API Service for NexusHR
 * Connects directly to Google Generative AI (Gemini 1.5 Flash / 2.0 Flash)
 * with automatic fallback to the internal Offline LLM Engine.
 */

export interface GeminiResponse {
  reply: string;
  source: "GEMINI_LIVE" | "OFFLINE_LLM";
  modelUsed: string;
  suggestedQuestions?: string[];
}

export interface UserContext {
  name?: string;
  email?: string;
  role?: string;
}

const DEFAULT_ENTERPRISE_SYSTEM_INSTRUCTION = `
You are Nexus AI, the enterprise workforce and operations intelligence assistant for "NexusHR Global Ltd".
Your role is to assist employees, managers, and HR executives with organizational queries.

Corporate Context & Governance Rules:
1. Organization: NexusHR Global Ltd (Bangalore Headquarters, 4 business units: Engineering, Human Resources, DevOps & Infrastructure, Executive Leadership).
2. Leave Policy: 12 Casual Leaves, 10 Sick Leaves, 15 Earned / Privilege Leaves per year.
3. Attendance Policy: Shift hours 09:30 AM to 06:30 PM. 15-minute grace window until 09:45 AM, after which punches are marked "LATE".
4. Payroll & Tax: Enforces Indian FY 2025-26 Section 115BAC New Tax Regime. Automated 12% PF employee + 12% employer contribution, monthly salary disbursements on 1st.
5. Role-Based Access Control (RBAC):
   - Standard Employees (Staff) can only inspect their own compensation, leave balance, and shift records.
   - Managers can review team attendance, approve direct reports' leave requests, and assess OKRs.
   - HR & Executives have broad access to org-wide headcount, department attrition, and compliance audits.
6. Tone: Highly professional, crisp, empathetic, and enterprise-grade. Format with markdown bullet points and clear sections where helpful.
`;

export async function queryGemini(
  prompt: string,
  apiKey: string,
  userContext?: UserContext,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<GeminiResponse> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("No Gemini API key provided");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;

  // Build conversational contents
  const contents = [
    ...chatHistory.slice(-6), // include last 3 turns
    {
      role: "user",
      parts: [
        {
          text: `[Active User: ${userContext?.name || "Employee"} | Email: ${userContext?.email || "user@nexushr.demo"} | Role: ${userContext?.role || "EMPLOYEE"}]\n\nQuery: ${prompt}`,
        },
      ],
    },
  ];

  const payload = {
    contents,
    systemInstruction: {
      parts: [
        {
          text: DEFAULT_ENTERPRISE_SYSTEM_INSTRUCTION,
        },
      ],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API returned status ${response.status}`
    );
  }

  const data = await response.json();
  const candidateText =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I processed your query, but no response was returned by the model.";

  return {
    reply: candidateText,
    source: "GEMINI_LIVE",
    modelUsed: "gemini-1.5-flash",
    suggestedQuestions: [
      "Show my leave ledger balance",
      "Explain Section 115BAC tax deductions",
      "Who is on leave in my department?",
      "How do I schedule a 1-on-1 performance review?",
    ],
  };
}
