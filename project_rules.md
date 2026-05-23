# TelecoSmart - AI Project Instructions & Rules

## 🛠️ Project Profile & Full Stack Architecture
- **Project Name:** TelecoSmart (Telecom Billing System)
- **Frontend Framework:** Next.js (App Router / standard layout structures with Tailwind CSS)
- **Backend Architecture:** Java Servlets handles core database logic, PostgreSQL schemas, and REST API handlers.
- **Integration Setup:** The Next.js frontend communicates with the Java backend running on Tomcat via API endpoints.

---

## ⚠️ WORKING BOUNDARIES & SCOPE
- **FULL-STACK ACCESS GRANTED:** The AI agent has permission to modify both the Next.js frontend **and** the Java Servlets backend.
- **BACKEND TASKS:** The agent can actively create, refactor, rewrite, and configure Java backend files, servlet route mappings, and database queries.
- **SAFETY RULE:** Ensure any new backend endpoints or database changes remain fully compatible with the existing PostgreSQL schema and do not break the Next.js frontend state.

---

## 📁 Workspace Context
- **Working Directory:** `E:\Telecom_ITI\29-Billing-Mediation-Project\BillingProject\TelecomBillingSystem-NextGen`
- **Active Path for Frontend:** `TelecomBillingWebsite`

---

## 🧱 Current Status & Completed Assets
1. **Frontend Branding:** `LogoHeroEnhanced` (Login page) and `LogoHeaderNodes` (Global Navigation Bar) have been successfully built and integrated.
2. **Backend API Status:** The frontend is currently throwing 404 errors when making GET requests to the following unmapped endpoints:
   - `/api/profiles/rateplans`
   - `/api/profiles/services`
   - `/api/profiles/fees`

---

## 🚀 Next Steps & Resume Point
When continuing work in this worktree, the AI agent should:
1. **Fix Backend 404 Errors:** Inspect the Java Servlets source files and map the missing GET endpoints (`/profiles/rateplans`, `/profiles/services`, and `/profiles/fees`) to return the correct database payload.
2. **Verify JSON Formats:** Ensure the Java servlets return valid `application/json` responses that match the data formatting expected by the Next.js frontend components.
3. **Tomcat Mapping:** If necessary, check and update the `web.xml` or application routing configurations to handle incoming traffic properly.