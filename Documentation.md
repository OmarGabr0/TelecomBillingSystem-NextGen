# Telecom Billing System - Engineering Documentation

## Executive Summary

A modern telecom billing and mediation platform implementing the complete billing pipeline: CDR ingestion → mediation → rating → billing → customer portal. Built with a 5-tier microservices-inspired architecture using Next.js frontend, Java/Tomcat backend, and PostgreSQL database. Demonstrates ETL pipelines, telecom billing concepts, and scalable system design.

---

## 1. Project Overview

### Purpose
This system simulates a complete telecom billing infrastructure that processes Call Detail Records (CDRs), applies rating logic with free unit allowances, generates monthly invoices with PDF output, and provides a web dashboard for customer and administrator management.

### Key Components
- **Mediation Simulation**: Generates and processes telecom CDRs for voice, SMS, and data services
- **Billing Pipeline**: End-to-end billing with rating, taxation, and invoice generation
- **Telecom CDR Processing**: Real-time processing of call detail records with batch operations

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │   Login     │    │ Subscriber  │    │ Administrator│           │
│  │   Page      │    │  Dashboard  │    │   Panel     │           │
│  └─────────────┘    └─────────────┘    └─────────────┘           │
└──────────┬────────────────────┬────────────────────┬──────────┘
           │                    │                    │
           v                    v                    v
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                               │
│                    (Next.js Proxy)                                 │
│  /api/auth     /api/customer/*  /api/contract  /api/profiles/*    │
└──────────┬────────────────────┬────────────────────┬──────────┘
           │                    │                    │
           v                    v                    v
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ AuthServlet │ │ ProfileServlet│ │ CustomerServlet│ │ContractServlet││
│  │   -Login    │ │ -Plans/Fees │ │ -Profile    │ │ -Management │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────┐
│                       PROCESSING LAYER                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ CDR Gen     │───→│ Parser      │───→│ Rating      │         │
│  │ (Python)    │    │ (Java)      │    │ Engine      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                    │    │                     │
│                                    │    │                     │
│                                    └────┼─→ Aggregation        │
│                                         │   (Invoice Gen)      │
└───────────────────────────────────────────┴──────────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                 │
│                    ┌────────────────────┐                       │
│                    │   PostgreSQL         │                       │
│                    │   (Neon Cloud)       │                       │
│                    └────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Patterns
- **Layered Architecture**: Clear separation between presentation, API, and processing layers
- **ETL Pipeline**: Extract (CDR files) → Transform (Parser) → Load (Database)
- **Event-Driven Processing**: Polling-based CDR processing with batch updates
- **Proxy Pattern**: Next.js acts as API gateway for backend services

---

## 3. Project Folder Structure

```
TelecomBillingSystem-NextGen/
├── Billing_System.sh              # Main orchestration script
├── Documentation.md             # This file
├── README.md                    # Project overview
├── add_users_table.sql            # DB schema
├── seed_test_user.sql             # Test data seed
│
├── frontend/
│   └── telecom-next/              # Next.js web application
│       ├── app/
│       │   ├── layout.tsx         # Root layout with ToastContainer
│       │   ├── login/             # Login page
│       │   ├── admin/             # Admin dashboard
│       │   └── user/              # Subscriber dashboard
│       ├── components/            # Reusable UI components
│       │   ├── logo/              # Logo components
│       │   ├── layout/            # Layout components
│       │   └── ui/                # UI primitives (Button, Card, etc.)
│       ├── api/                   # API route proxies
│       └── package.json           # Node.js dependencies
│
├── TelecomBillingWebsite/         # Backend WAR application
│   ├── src/main/
│   │   ├── java/com/iti/
│   │   │   ├── servlet/           # REST endpoints (Auth, Customer, Profile, Contract)
│   │   │   ├── dao/               # Database access objects
│   │   │   ├── model/             # Domain models (User, Customer, Invoice)
│   │   │   └── util/              # Utilities (JsonUtil, DataBaseConnect)
│   │   └── webapp/
│   │       └── WEB-INF/
│   │           └── web.xml        # Servlet mappings
│   └── pom.xml                    # Maven build
│
├── parser_module/                 # CDR file parser
│   ├── generate_cdrs.py           # Python CDR generator
│   ├── pom.xml                    # Maven build
│   └── src/main/java/
│       └── TelecomBillingParser.java
│
├── ratingEngine/                  # Real-time rating engine
│   ├── pom.xml
│   └── src/main/java/com/telecomsmart/
│       ├── ratingengine/
│       │   ├── RatingEngine.java  # Main orchestrator
│       │   ├── ZoneResolver.java  # Tariff zone resolution
│       │   └── CdrHandling.java   # CDR data access
│       ├── dao/                   # Data access objects
│       ├── model/                 # Domain models (CdrRecord, RatedCdr)
│       └── services/              # Database services
│
└── AggregationEngine/               # Invoice generation
    ├── pom.xml
    └── src/main/java/com/mycompany/
        └── aggregationengine/
            ├── AggregationEngine.java    # Main entry point
            ├── InvoiceService.java       # Invoice generation logic
            ├── DataLoader.java           # Data access helper
            ├── DatabaseConnection.java   # DB connection manager
            ├── pdfService.java           # PDF generation
            └── model/                    # Data transfer objects
```

---

## 4. Runtime Workflow

### System Startup (via Billing_System.sh)

1. **Build Phase**
   - Maven compiles all Java modules
   - TelecomBillingWebsite WAR is packaged
   - WAR is deployed to Tomcat webapps directory

2. **Service Launch Sequence**
   ```
   [0] Build & Deploy WAR to Tomcat
   [1] TelecomBillingWebsite backend deployed
   [2] Start CDR Generator (Python) → polls for input
   [3] Start Telecom Billing Parser (Java) → reads CDR files
   [4] Start Rating Engine (Java) → processes CDRs
   [5] Start Aggregation Engine (Java) → generates invoices
   [6] Start Frontend (Next.js) → web UI
   ```

3. **Service Communication**
   - All services share the same PostgreSQL database
   - CDR Generator writes files → Parser reads files → DB
   - Rating Engine polls DB → processes → updates profiles
   - Aggregation Engine reads processed data → generates invoices → PDF

---

## 5. Telecom Billing Pipeline

### End-to-End Flow

```
Subscriber Activity (Voice/SMS/Data)
        │
        v
┌─────────────────┐
│ CDR Generator   │ Creates simulated usage records
│ (generate_cdrs) │ Service types: 1=Voice, 2=SMS, 3=Data
└────────┬────────┘
         │ CSV files (CDR{timestamp}.csv)
         v
┌─────────────────┐
│   Parser        │ Reads CSV, extracts fields:
│ (TelecomBilling)│ MSISDN, Dial-B, Service, Duration, Time, External Fees
│                 │ Reconstructs datetime, batch inserts to DB
└────────┬────────┘
         │ INSERT INTO cdr table (unprocessed)
         v
┌─────────────────┐
│ Rating Engine   │ Polls unprocessed CDRs
│                 │ Applies 3-step charging:
│                 │ 1. Free Units (general)
│                 │ 2. Service Units (voice/sms/data specific)
│                 │ 3. Charge to ROR if exceeded
└────────┬────────┘
         │ INSERT INTO rated_cdr, UPDATE customer_profile
         v
┌─────────────────┐
│ Aggregation     │ Reads customer profiles
│ Engine          │ Calculates: subtotal + recurring + onetime + tax
│                 │ Generates PDF invoices via openhtmltopdf
└────────┬────────┘
         │ INSERT INTO invoice (pdf_path generated)
         v
┌─────────────────┐
│ Web Dashboard   │ Frontend fetches via REST APIs:
│ (Next.js)       │ /api/auth - session management
│                 │ /api/customer/profile - usage view
│                 │ /api/customer/invoices - billing history
│                 │ /api/contract - contract details
│                 │ /api/profiles/rateplans - plan selection
└─────────────────┘
```

---

## 6. Module Breakdown

### parser_module
| Aspect | Details |
|--------|---------|
| **Purpose** | Generate simulated telecom CDRs and parse CSV files into database |
| **Main Files** | `generate_cdrs.py`, `TelecomBillingParser.java` |
| **Technologies** | Python, Java 25, PostgreSQL, Maven |
| **Inputs** | Randomly generated CDR data (simulated subscriber usage) |
| **Outputs** | INSERT INTO cdr table, archived CSV files |
| **Runtime** | Continuous polling every 5 seconds |

**Key Logic**: Generates 100 CDRs per batch with realistic MSISDN patterns, service types (Voice/SMS/Data), and external fees. Parser reconstructs timestamps from filename + row data.

### ratingEngine
| Aspect | Details |
|--------|---------|
| **Purpose** | Real-time rating of CDRs against customer profiles |
| **Main Files** | `RatingEngine.java`, `ZoneResolver.java`, `CdrHandling.java` |
| **Technologies** | Java 21, PostgreSQL, Maven, BigDecimal |
| **Inputs** | Unprocessed CDRs from database |
| **Outputs** | Rated CDRs, updated customer profiles (unit deductions) |
| **Runtime** | Continuous polling every 5 seconds |

**Key Logic**: Three-tier rating - deduct free units first, then service-specific units (voice/sms/data), finally charge to ROR (running on rate) if limits exceeded.

### AggregationEngine
| Aspect | Details |
|--------|---------|
| **Purpose** | Monthly invoice generation with PDF output |
| **Main Files** | `AggregationEngine.java`, `InvoiceService.java` |
| **Technologies** | Java 25, PostgreSQL, openhtmltopdf |
| **Inputs** | Customer profiles for billing cycle |
| **Outputs** | Invoice records, PDF invoices |
| **Runtime** | On-demand or scheduled execution |

**Key Logic**: Calculates prorated usage for partial months, applies 10% tax, generates PDF invoices, resets profile units for next cycle.

### TelecomBillingWebsite
| Aspect | Details |
|--------|---------|
| **Purpose** | REST API backend for web dashboard |
| **Main Files** | AuthServlet, CustomerServlet, ProfileServlet, ContractServlet |
| **Technologies** | Java 11, Jakarta EE 10, PostgreSQL, Tomcat |
| **Inputs** | HTTP requests from Next.js frontend |
| **Outputs** | JSON responses for dashboard |
| **Runtime** | Deployed as WAR to Tomcat |

**Key Logic**: Session-based authentication, CRUD operations for customers/contracts, aggregated views for dashboards.

### frontend/telecom-next
| Aspect | Details |
|--------|---------|
| **Purpose** | Modern web dashboard for subscribers and admins |
| **Main Files** | app/layout.tsx, app/login/page.tsx, app/user/page.tsx, app/admin/ |
| **Technologies** | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Inputs** | User interactions, API responses |
| **Outputs** | Dashboard views, form submissions |
| **Runtime** | Development server on port 3000 |

**Key Logic**: API route proxy pattern, session cookie forwarding, toast notifications for feedback, responsive dashboard design.

---

## 7. Parser Module Deep Dive

### CDR Generation (generate_cdrs.py)
- **Generation Rate**: 100 CDRs every 5 seconds
- **MSISDN Pool**: 20 Egyptian phone numbers (002016XXXXXXXX format)
- **Service Types**:
  - Voice (ID 1): Duration in seconds, external prefix fees
  - SMS (ID 2): Message count, external fees
  - Data (ID 3): Bytes (1KB-100MB), URL destinations

### CSV Structure
```
MSISDN,Dial-B,ServiceID,Duration/Volume,Time,ExternalFees
002016XXXXXXXX,00201XXXXXXXXX OR URL,1-3,duration,volume,HH:MM:SS,fees
```

### Parsing Flow
1. Poll `generated_cdrs/` directory for `.csv` files
2. Extract date from filename (e.g., `CDR20260416120000.csv` → `2026-04-16`)
3. Read each row, split by comma
4. Reconstruct full timestamp: `datePart + " " + timePart`
5. Batch INSERT into `cdr` table
6. Move file to `archive_cdrs/` directory

---

## 8. Rating Engine Deep Dive

### Service Type Handling

| Service | Unit Type | Free Units Applied |
|---------|-----------|------------------|
| Voice (1) | Minutes | General → Voice-specific → ROR |
| SMS (2) | Messages | General → SMS-specific → ROR |
| Data (3) | Megabytes | General → Data-specific → ROR |

### Charging Algorithm (Three-Step)

```
For each CDR:
1. TRY FREE UNITS (general pool)
   - If sufficient: deduct usage, no charge
   - If insufficient: deduct remainder, proceed to step 2

2. TRY SERVICE-SPECIFIC UNITS
   - If sufficient: deduct usage, no charge
   - If insufficient: deduct remainder, proceed to step 3

3. CHARGE TO ROR (money)
   - remainingUsage × pricePerUnit → added to ROR
   - ROR tracked in customer_profile table
```

### Zone Resolution
- Resolves tariff zones based on dial destination
- Applies zone-based pricing for external calls
- Caches pricing data in memory for performance

---

## 9. Database Design

### Key Tables

| Table | Purpose |
|-------|---------|
| **users** | Authentication - username, password, role (user/admin) |
| **customer** | Customer master data - email (PK), name, address, created_at |
| **contract** | Service contracts - MSISDN, customer_id, rateplan_id, credit_limit, balance |
| **customer_profile** | Usage tracking - MSISDN (PK), free_units, voice_units, sms_units, data_units, ror_usage |
| **rateplan** | Pricing plans - rateplan_id, name, ror (rate of return), price, free_units |
| **service_package** | Service definitions - service_id, type (1/2/3), description, price, units |
| **cdr** | Raw call detail records - cdr_id, msisdn, service_id, duration, timestamp |
| **rated_cdr** | Processed records - cdr_id, units_used, ror_charged, status |
| **bill** | Billing periods - bill_id, msisdn, billing_start, billing_end, amounts |
| **invoice** | Final invoices - invoice_id, total, status, pdf_path |

### Relationships
- `customer` (1) → (∞) `contract` (via customer_id)
- `contract` (1) → (1) `customer_profile` (via MSISDN)
- `cdr` (∞) → (∞) `rated_cdr` (via cdr_id)
- `contract` (1) → (∞) `cdr` (via MSISDN)

---

## 10. API / Frontend Interaction

### Authentication Flow
```
Browser (credentials)
    ↓ POST /api/auth
Next.js Proxy Layer
    ↓ POST /api/auth
Tomcat AuthServlet
    ↓ Query users table
PostgreSQL
    ↓ Returns user data + JSESSIONID cookie
Next.js (rewrites cookie path)
    ↓ Returns JSON + Set-Cookie
Browser (stores session)
```

### Available Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth` | Login with credentials |
| GET | `/api/auth` | Check session status |
| GET | `/api/customer/profile?email=X` | Get subscriber profile |
| GET | `/api/customer/invoices?email=X` | Get billing history |
| GET | `/api/profiles/rateplans` | List available plans |
| GET | `/api/profiles/services` | List service packages |
| GET | `/api/profiles/fees` | List recurring/onetime fees |

---

## 11. Technologies Used

| Technology | Usage | Version |
|------------|-------|---------|
| **Java** | Backend services, WAR, Rating Engine | 11, 21, 25 |
| **Python** | CDR generation | 3.x |
| **Maven** | Build automation | 3.8+ |
| **PostgreSQL** | Primary database | (Neon Cloud) |
| **Shell Script** | Service orchestration | bash |
| **Next.js** | Frontend framework | 16.2.6 |
| **React** | UI rendering | 19 |
| **TypeScript** | Type safety | - |
| **Tailwind CSS** | Styling | - |
| **Framer Motion** | Animations | - |
| **Lucide React** | Icons | - |

---

## 12. Engineering Concepts Demonstrated

| Concept | Implementation |
|---------|----------------|
| **ETL Pipeline** | CDR files (Extract) → Parser (Transform) → Database (Load) |
| **Mediation System** | CDR parsing and normalization before rating |
| **Modular Architecture** | Separate modules for parsing, rating, aggregation |
| **Telecom Billing** | Rating plans with free units, ROR, taxation |
| **Batch Processing** | Batch DB inserts, batch profile updates |
| **Service Orchestration** | Billing_System.sh coordinates all services |
| **API Gateway** | Next.js proxies to Tomcat backend |
| **Session Management** | HTTP session with JSESSIONID cookie |
| **Caching** | In-memory zone/pricing caches for performance |

---

## 13. Important Files Summary

| File | Purpose | Importance |
|------|---------|------------|
| `Billing_System.sh` | Main orchestration script | High - system entry point |
| `TelecomBillingWebsite/pom.xml` | Backend WAR build | High - deployment config |
| `frontend/telecom-next/package.json` | Frontend dependencies | High |
| `parser_module/generate_cdrs.py` | CDR generator | High - data source |
| `ratingEngine/RatingEngine.java` | Rating orchestrator | Critical - core logic |
| `AggregationEngine/InvoiceService.java` | Invoice generation | High - billing output |
| `TelecomBillingWebsite/src/main/java/com/iti/servlet/*` | REST endpoints | Critical - API layer |
| `TelecomBillingWebsite/src/main/java/com/iti/dao/*` | Database access | High - data layer |
| `frontend/telecom-next/app/layout.tsx` | Root layout | High - UI foundation |
| `frontend/telecom-next/app/user/page.tsx` | Subscriber dashboard | High - user view |
| `frontend/telecom-next/app/admin/page.tsx` | Admin dashboard | High - admin view |

---

## 14. Sequence Flows

### Parser Sequence
```
[Timer] → List CSV files in generated_cdrs/
    → For each file:
        → Extract date from filename
        → Read rows (MSISDN, Dial-B, Service, Duration, Time, Fees)
        → Reconstruct LocalDateTime
        → Batch INSERT into cdr table
        → Move file to archive_cdrs/
    → Sleep 5 seconds
    → Loop
```

### Rating Sequence
```
[Timer] → Fetch 50 unprocessed CDRs from DB
    → Load customer profiles to cache
    → For each CDR:
        → Get customer from cache
        → Get service package for plan+service
        → Apply zone pricing
        → Determine charge (free units → service units → ROR)
        → Create RatedCdr record
        → Mark customer for update
    → Batch UPDATE customer profiles
    → Batch INSERT rated_cdr records
    → Sleep until next poll
```

### Startup Sequence
```
Billing_System.sh → mvn clean package (TelecomBillingWebsite)
    → Copy WAR to Tomcat webapps/
    → python3 generate_cdrs.py &
    → mvn exec:java (Parser) &
    → mvn exec:java (Rating Engine) &
    → mvn exec:java (Aggregation) &
    → npm run dev (Frontend) &
    → trap for graceful shutdown
```

---

## 15. Future Improvements

| Area | Improvement | Benefit |
|------|-------------|---------|
| **Streaming** | Kafka for CDR streaming | Real-time processing, backpressure handling |
| **Containerization** | Docker for each service | Consistent deployment, isolation |
| **Orchestration** | Kubernetes | Auto-scaling, health checks, rolling updates |
| **Messaging** | Redis/RabbitMQ | Decoupled service communication |
| **Monitoring** | Prometheus + Grafana | Metrics, alerting, observability |
| **Testing** | JUnit + Jest | Automated testing, CI/CD |
| **API Gateway** | Spring Cloud Gateway | Rate limiting, auth, logging |
| **Caching** | Redis for hot data | Faster profile/usage lookups |
| **Security** | JWT instead of sessions | Stateless auth, better scalability |

---

## Resume/Project Description Summary

**Telecom Billing System** - A microservices-style telecom billing platform demonstrating full-stack development with real-time rating engines, CDR processing, and modern web dashboards. Built with Java/Tomcat backend, Next.js frontend, and PostgreSQL database. Implements ETL pipelines, telecom tariff logic, and PDF invoice generation.

**Key Skills Demonstrated**: Java, Python, REST APIs, PostgreSQL, Next.js, System Architecture, Telecom Billing Concepts, ETL Pipelines, Full-Stack Development, Maven, Shell Scripting

---

## LinkedIn-Ready Summary

🚀 **Just Built: Telecom Billing System** 📡

A complete end-to-end telecom billing platform featuring:

✅ **5-Tier Architecture**: CDR Generator → Parser → Rating Engine → Aggregation → Web Dashboard
✅ **Real-time Rating**: Three-step charging logic (free units → service units → monetary charges)
✅ **PDF Invoicing**: Automatic invoice generation with taxation
✅ **Modern UI**: Next.js 16 dashboard with Tailwind CSS and Framer Motion animations

**Tech Stack**: Java 11-25 • Python • PostgreSQL • Maven • Tomcat • Next.js • React

**Engineering Concepts**: ETL Pipelines • Microservices Architecture • Telecom Billing • Session Management • Batch Processing

#Telecom #Billing #Java #NextJS #FullStack #SystemDesign #ETL