# HealthFlow - Enterprise Clinic Management System
## System Architecture & Implementation Blueprint

HealthFlow is an enterprise-grade, single-clinic clinic management system designed with a clean, high-performance architecture. This document outlines the comprehensive system architecture, database design, API specification, frontend/backend layouts, and a staged production execution plan.

---

## 1. Overall System Architecture

HealthFlow uses a **Decoupled Client-Server Tiered Architecture** designed to maximize security, separation of concerns, and ease of deployment.

```
+--------------------------------------------------------------------------------+
|                                 CLIENT TIER                                    |
|   +------------------------------------------------------------------------+   |
|   |                      React Single Page Application                     |   |
|   |  - React Router (State-Driven Auth Guards)                             |   |
|   |  - Axios + TanStack Query (State & Cache Management)                   |   |
|   |  - Tailwind CSS + "Sleek Interface" design system                      |   |
|   +------------------------------------------------------------------------+   |
+---------------------------------------+----------------------------------------+
                                        |
                                        | (HTTPS / REST + JSON / Signed URLs)
                                        v
+--------------------------------------------------------------------------------+
|                               APPLICATION TIER                                 |
|   +------------------------------------------------------------------------+   |
|   |                       Spring Boot 3.x REST API                         |   |
|   |  - Spring Security + Stateless JWT Authentication                      |   |
|   |  - Controller-Service-Repository Layered Domain Pattern                |   |
|   |  - Spring Validation & Global Exception Handling                       |   |
|   +------------------------------------------------------------------------+   |
+-------------------+----------------------------------------+-------------------+
                    |                                        |
                    | (JDBC / JPA)                           | (GCS SDK / JSON)
                    v                                        v
+----------------------------------------+  +------------------------------------+
|             DATABASE TIER              |  |            STORAGE TIER            |
|   +--------------------------------+   |  |   +----------------------------+   |
|   |      PostgreSQL Database       |   |  |   |    Google Cloud Storage    |   |
|   |  - Relational Schema           |   |  |   |  - Secure Document Vault   |   |
|   |  - Connection Pooling          |   |  |   |  - Time-Bound Signed URLs  |   |
|   |  - Flyway Versioning           |   |  |   |  - Patient PDFs & Images   |   |
|   +--------------------------------+   |  |   +----------------------------+   |
+----------------------------------------+  +------------------------------------+
```

### Core Architecture Principles:
- **Stateless Authentication:** Spring Security handles user identity via stateless JSON Web Tokens (JWT) signed using an asymmetric key pair or secure HS256 key.
- **Secure Storage Gateway:** Files (prescriptions, clinical reports, scans, billing PDFs) are never served directly by the application server. Instead, the backend generates dynamic, short-lived **Google Cloud Storage (GCS) Signed URLs**, allowing secure, direct, and zero-overhead browser-to-bucket communication.
- **Strict Role-Based Access Control (RBAC):** Users are assigned a granular role: `ADMIN`, `DOCTOR`, or `STAFF`. All controllers are protected using Spring Security method-level annotations (`@PreAuthorize`).
- **Database Migrations:** Schema changes are version-controlled and run automatically on startup via **Flyway Migrations**, preventing drift across development, staging, and production.

---

## 2. Backend Package Structure

The backend is structured under a feature-oriented, domain-layered pattern. This isolates distinct domains while maintaining a strict vertical dependency direction: `Controller -> Service -> Repository -> Database`.

```
com.healthflow.api
│
├── HealthFlowApplication.java
│
├── config/                     # System-wide Bean Declarations
│   ├── SecurityConfig.java     # Web security, JWT filter registrations, CORS rules
│   ├── StorageConfig.java      # Google Cloud Storage Client configuration
│   └── DatabaseConfig.java     # Connection pool tuning & Auditing configuration
│
├── security/                   # Authentication & Authorization Mechanics
│   ├── JwtTokenProvider.java   # JWT Generation, validation, and claim parsing
│   ├── JwtAuthenticationFilter.java # Filter extracting bearer tokens from headers
│   ├── UserPrincipal.java      # Custom UserDetails implementation
│   └── CustomUserDetailsService.java # Authenticates user against PostgreSQL
│
├── exception/                  # Global Error Handling
│   ├── GlobalExceptionHandler.java # @ControllerAdvice handling all system errors
│   ├── ResourceNotFoundException.java
│   ├── InsufficientPermissionsException.java
│   └── InvalidWorkflowException.java
│
├── common/                     # Cross-cutting concerns
│   ├── dto/                    # Base / generic DTOs (e.g., PagedResponse, APIResponse)
│   └── audit/                  # Spring Data JPA Auditing helpers (CreatedBy, UpdatedBy)
│
└── domain/                     # Domain modules (Feature-driven isolation)
    ├── auth/                   # Authentication Domain
    │   ├── controller/AuthController.java
    │   ├── dto/LoginRequest.java
    │   ├── dto/AuthResponse.java
    │   └── service/AuthService.java
    │
    ├── user/                   # User and Role Management Domain
    │   ├── entity/User.java
    │   ├── entity/Role.java    # Enum representing ADMIN, DOCTOR, STAFF
    │   ├── repository/UserRepository.java
    │   ├── dto/UserDTO.java
    │   ├── dto/CreateUserRequest.java
    │   └── service/UserService.java
    │
    ├── patient/                # Patient Information Domain
    │   ├── entity/Patient.java
    │   ├── repository/PatientRepository.java
    │   ├── dto/PatientDTO.java
    │   ├── dto/PatientSummaryDTO.java
    │   └── service/PatientService.java
    │
    ├── appointment/            # Scheduling Domain
    │   ├── entity/Appointment.java
    │   ├── entity/AppointmentStatus.java # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    │   ├── repository/AppointmentRepository.java
    │   ├── dto/AppointmentDTO.java
    │   ├── dto/CreateAppointmentRequest.java
    │   └── service/AppointmentService.java
    │
    ├── clinical/               # Prescriptions & Electronic Medical Records (EMR)
    │   ├── entity/Prescription.java
    │   ├── entity/MedicalRecord.java
    │   ├── repository/PrescriptionRepository.java
    │   ├── repository/MedicalRecordRepository.java
    │   ├── dto/PrescriptionDTO.java
    │   ├── dto/MedicalRecordDTO.java
    │   └── service/ClinicalService.java
    │
    ├── finance/                # Billing & Invoices Domain
    │   ├── entity/Invoice.java
    │   ├── entity/PaymentStatus.java # UNPAID, PARTIALLY_PAID, PAID, VOID
    │   ├── repository/InvoiceRepository.java
    │   ├── dto/InvoiceDTO.java
    │   ├── dto/CreateInvoiceRequest.java
    │   └── service/BillingService.java
    │
    └── report/                 # System Analytics Domain
        ├── dto/DashboardMetricsDTO.java
        ├── dto/RevenueReportDTO.java
        └── service/ReportService.java
```

---

## 3. Frontend Folder Structure

The React frontend utilizes a domain-sliced module layout inside `/src`. This prevents `App.tsx` from growing into a monolithic file and ensures that page templates, UI components, states, and hooks are tightly isolated.

```
/src
│
├── main.tsx                    # React Entrypoint
├── App.tsx                     # Global App Router & Providers Configuration
├── index.css                   # Global CSS importing Tailwind & Custom Themes
├── types.ts                    # Global shared interfaces (User, Patient, etc.)
│
├── assets/                     # Static elements (logos, default avatars)
│
├── theme/                      # CSS styling variables
│   └── sleek-theme.css         # "Sleek Interface" specific overrides & color palettes
│
├── lib/                        # Third-party configurations
│   ├── api-client.ts           # Axios instance with JWT interceptors & global configuration
│   └── query-client.ts         # TanStack Query standard caching configs
│
├── components/                 # Reusable Layout & Atomic UI Components
│   ├── ui/                     # Pure design components (buttons, badges, inputs, dialogs)
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── Card.tsx
│   │
│   ├── layout/                 # Global page frame components
│   │   ├── Sidebar.tsx         # Left column navigation mapping user roles
│   │   ├── Header.tsx          # Top bar with page titles, searching, and profile
│   │   └── AppLayout.tsx       # Main grid coordinating Sidebar, Header, and content viewport
│   │
│   └── feedback/               # Error, Loading, & Empty State states
│       ├── Loader.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── hooks/                      # Shared React hooks
│   ├── useAuth.ts              # Authentication state hook (Context client-wrapper)
│   └── useDebounce.ts          # Search typing performance optimizer
│
├── context/                    # React Contexts
│   └── AuthContext.tsx         # Holds authenticated User status & JWT storage tokens
│
└── features/                   # Core application pages and slice logics
    ├── auth/                   # Authentication logic
    │   ├── pages/LoginPage.tsx
    │   ├── pages/ForgotPasswordPage.tsx
    │   └── api/authApi.ts
    │
    ├── dashboard/              # Home statistics, quick views, actions
    │   ├── pages/DashboardPage.tsx
    │   ├── components/MetricsGrid.tsx
    │   ├── components/UpcomingConsultations.tsx
    │   └── api/dashboardApi.ts
    │
    ├── patients/               # Patient Directory & Patient Charting
    │   ├── pages/PatientListPage.tsx
    │   ├── pages/PatientDetailPage.tsx
    │   ├── components/PatientForm.tsx
    │   ├── components/PatientHistory.tsx
    │   └── api/patientApi.ts
    │
    ├── appointments/           # Interactive scheduler and check-in
    │   ├── pages/AppointmentPage.tsx
    │   ├── components/AppointmentModal.tsx
    │   ├── components/AppointmentCalendar.tsx
    │   └── api/appointmentApi.ts
    │
    ├── clinical/               # EMR charts & prescription creators
    │   ├── pages/PrescriptionPage.tsx
    │   ├── components/PrescriptionForm.tsx
    │   └── api/clinicalApi.ts
    │
    ├── billing/                # Payments, invoices, and GCS receipt viewers
    │   ├── pages/BillingPage.tsx
    │   ├── components/InvoiceDetailModal.tsx
    │   └── api/billingApi.ts
    │
    └── settings/               # System configurations and user profiles
        ├── pages/SettingsPage.tsx
        └── api/settingsApi.ts
```

---

## 4. Database Module List

A robust database starts with strong relational constraints, keys, indexes, and auditing.

```
                  +---------------+
                  |     roles     |
                  +---------------+
                          | (1:N)
                          v
+---------------+ 1     N +---------------+ 1     N +---------------+
|   patients    |<--------|  appointments |-------->|     users     |
+---------------+         +---------------+         +---------------+
        | 1                       |                         | 1
        |                         | (1:1)                   |
        | N                       v                         | N
+---------------+ 1     N +---------------+         +---------------+
|medical_records|<--------| prescriptions |-------->|   invoices    |
+---------------+         +---------------+         +---------------+
                                  | 1
                                  |
                                  v N
                          +---------------+
                          |  invoice_items|
                          +---------------+
```

### Module A: Users, Roles & Security
1. **`roles`**: Defines privileges.
   - Columns: `id` (PK), `name` (VARCHAR - ADMIN, DOCTOR, STAFF).
2. **`users`**: Clinic employees.
   - Columns: `id` (PK), `email` (VARCHAR, UNIQUE, Index), `password` (VARCHAR, encrypted with BCrypt), `first_name` (VARCHAR), `last_name` (VARCHAR), `role_id` (FK), `is_active` (BOOLEAN), `created_at`, `updated_at`.
3. **`password_reset_tokens`**: Time-sensitive reset security.
   - Columns: `id` (PK), `token` (VARCHAR), `user_id` (FK), `expiry_date` (TIMESTAMP).

### Module B: Patient & EMR
4. **`patients`**: Core records.
   - Columns: `id` (PK), `patient_number` (VARCHAR, UNIQUE, index), `first_name`, `last_name`, `date_of_birth` (DATE), `gender`, `phone`, `email` (Index), `address`, `emergency_contact_name`, `emergency_contact_phone`, `created_at`, `updated_at`.
5. **`medical_records`**: Diagnostic narrative history.
   - Columns: `id` (PK), `patient_id` (FK), `doctor_id` (FK to users), `visit_date` (TIMESTAMP), `symptoms` (TEXT), `diagnosis` (TEXT), `treatment_plan` (TEXT), `notes` (TEXT), `created_at`.

### Module C: Schedulers & Prescriptions
6. **`appointments`**: Scheduling transactions.
   - Columns: `id` (PK), `patient_id` (FK), `doctor_id` (FK to users), `appointment_date` (TIMESTAMP, Index), `status` (VARCHAR - SCHEDULED, COMPLETED, CANCELLED, NO_SHOW), `reason` (VARCHAR), `created_at`, `updated_at`.
7. **`prescriptions`**: Medication tracking.
   - Columns: `id` (PK), `patient_id` (FK), `doctor_id` (FK to users), `appointment_id` (FK, Nullable), `issue_date` (DATE), `notes` (TEXT), `document_path` (VARCHAR, references private bucket location), `created_at`.
8. **`prescription_items`**: Quantified drug lists.
   - Columns: `id` (PK), `prescription_id` (FK), `drug_name`, `dosage`, `frequency`, `duration`.

### Module D: Finances & Reports
9. **`invoices`**: Billing transactions.
   - Columns: `id` (PK), `invoice_number` (VARCHAR, UNIQUE, Index), `patient_id` (FK), `created_by` (FK to users), `issue_date` (DATE), `due_date` (DATE), `total_amount` (DECIMAL(10,2)), `tax_amount` (DECIMAL(10,2)), `payment_status` (VARCHAR - UNPAID, PARTIALLY_PAID, PAID, VOID), `pdf_document_path` (VARCHAR), `created_at`.
10. **`invoice_items`**: Ledger lines.
    - Columns: `id` (PK), `invoice_id` (FK), `description` (VARCHAR), `unit_price` (DECIMAL(10,2)), `quantity` (INT).

---

## 5. API Module List

All endpoints use HTTP/REST standards, uniform JSON envelopes, and structured payloads.

### Authentication Engine (`/api/v1/auth`)
- `POST /login`: Receives `email`/`password`. Returns JWT and user payload.
- `POST /forgot-password`: Receives `email`. Fires transactional email with token.
- `POST /reset-password`: Receives `token` and `new_password`. Updates credentials.

### Users & Directory (`/api/v1/users`)
- `GET /`: Lists all personnel. Query parameters: `role`, `status`, `page`, `size`. [Admin/Staff]
- `POST /`: Creates a clinic staff or doctor account. [Admin]
- `PUT /{id}`: Modifies account statuses or information. [Admin]
- `GET /doctors`: Specialized route returning active physicians for calendars. [All Roles]

### Patient Registry (`/api/v1/patients`)
- `GET /`: Paginated patient search. Parameters: `search` (name/number/phone), `page`, `size`. [All Roles]
- `POST /`: Inserts new patient record with automatic code generation (e.g., `PID-94021`). [Admin/Staff]
- `GET /{id}`: Returns full details, history, medical files, and previous billing records. [All Roles]
- `PUT /{id}`: Updates contact files, demographics, and emergency files. [All Roles]

### Clinical & Records Management (`/api/v1/patients/{id}/clinical`)
- `GET /records`: Returns medical history for clinical logs. [Doctors/Admin]
- `POST /records`: Appends diagnosis and physical review files. [Doctors]
- `POST /prescriptions`: Logs medication lists and triggers PDF rendering in GCS. [Doctors]
- `GET /prescriptions/{prescriptionId}/download`: Generates a dynamic GCS Signed URL (valid for 15 minutes) to download a secure PDF. [All Roles]

### Appointments Scheduling (`/api/v1/appointments`)
- `GET /`: Pulls scheduler list. Query parameters: `doctor_id`, `start_date`, `end_date`, `status`. [All Roles]
- `POST /`: Books an appointment slot, verifying doctor availability. [Admin/Staff/Doctors]
- `PUT /{id}/status`: Fast-track status updates (e.g., check-in, set no-show). [All Roles]
- `PUT /{id}`: Reschedules appointment timestamp. [All Roles]

### Billing & Cashier Portal (`/api/v1/billing`)
- `GET /invoices`: Pulls all ledgers. Parameters: `status`, `patient_id`, `page`, `size`. [Admin/Staff]
- `POST /invoices`: Compiles list of service codes, calculates taxes, and generates digital invoice records. [Admin/Staff]
- `POST /invoices/{id}/payments`: Adds a cash/card transaction split, adjusting invoice status. [Admin/Staff]
- `GET /invoices/{id}/pdf`: Returns a dynamic GCS Signed URL for the payment receipt PDF. [All Roles]

### Analytics Dashboard (`/api/v1/reports`)
- `GET /dashboard`: Gathers combined KPIs for cards (e.g., counts, daily volumes, warning margins). [All Roles]
- `GET /revenue`: Visual charts data (e.g., revenue over time). [Admin]

---

## 6. Development Execution Plan

The project development is organized into 5 progressive phases to ensure continuous integration, testing, and flawless delivery.

```
       Phase 1                    Phase 2                    Phase 3                    Phase 4                    Phase 5
+--------------------+     +--------------------+     +--------------------+     +--------------------+     +--------------------+
|  Infrastructure &  |     |   Core Patient &   |     |    Scheduler &     |     |    Prescriptions,  |     |  Reports, Auditing |
|  Security Core     |====>|   EMR Domain       |====>|    Consultations   |====>|    Billing & GCS   |====>|  & Polish          |
|  - Spring/React    |     |   - Patients list  |     |    - Interactive   |     |    - EMR creation  |     |  - Revenue charts  |
|  - Security & JWT  |     |   - Details chart  |     |      scheduler     |     |    - Invoice portal|     |  - Sleek Theme UI  |
|  - Mock Database   |     |   - CRUD forms     |     |    - Status flows  |     |    - GCS Signed URL|     |  - Final compilation|
+--------------------+     +--------------------+     +--------------------+     +--------------------+     +--------------------+
```

### Phase 1: Infrastructure, Core Security & Routing
* **Backend:** Setup Spring Boot initializers, Security configurations with BCrypt, JWT filters, custom exceptions, error envelopes, and sample users.
* **Frontend:** Configure Vite, Tailwind CSS with the Sleek Interface color variables, routing guards based on authentications, API client layers (Axios), and global contexts.
* **Outcome:** Clean login flows, automatic session restoration, and a functional dashboard frame containing responsive sidebars and user state banners.

### Phase 2: Patient Directory & EMR Charts
* **Backend:** Entities and repositories for `patients` and `medical_records`. Create APIs to query, search, write, and update records.
* **Frontend:** Build the Patient Directory Page containing search inputs, status badges, and grid views. Construct the full Patient detail page hosting history grids, contact cards, and clinical timelines.
* **Outcome:** Clean patient registration, complete contact updates, and responsive list-to-detail views.

### Phase 3: Interactive Scheduler & Consultations
* **Backend:** Model the `appointments` system. Implement scheduling validation APIs and status modification controllers.
* **Frontend:** Create an interactive Scheduler page incorporating search bars, calendar/list view toggles, status modification modals, and patient lookup overlays.
* **Outcome:** Staff and doctors can easily schedule appointments, mark patient check-ins, or record cancellations dynamically.

### Phase 4: Prescriptions, Digital Invoicing, and GCS Vault
* **Backend:** Add tables for `prescriptions`, `invoices`, and ledger lines. Set up Google Cloud Storage configuration to issue time-bound GCS Signed URLs for patient PDFs.
* **Frontend:** Form screens for doctors to prescribe medications. Invoice ledger screens for staff to input prices, view total math, record cash payments, and trigger receipts.
* **Outcome:** Clinicians can create prescriptions; cashier staffs can close payments and download PDFs through signed secure cloud links.

### Phase 5: Dashboard Analytics, Audits, and Production Polish
* **Backend:** Write specialized query methods aggregating clinic revenue reports, patient growth trends, and appointment statuses.
* **Frontend:** Assemble the main dashboard hosting rich KPI metrics, visual charts (Recharts), and alert notifications for doctor workloads. Use `motion` for refined view-transition animations.
* **Outcome:** Clean user experience, complete compilation with no TS/Lint complaints, and high-performance responses.

---

## 7. Rules for Code Generation

To ensure enterprise code quality, these strict instructions must be adhered to in all subsequent development turns:

1. **Strict Type Safety:** Avoid using `any`. Always declare precise types or interfaces inside `/src/types.ts` for all shared business data, API contracts, and user roles.
2. **Layered Decoupled Architecture:** 
   - Backend controllers must never access databases directly; they must communicate through service layers, which then access repository layers.
   - All backend inputs must be checked using `@Valid` annotations.
3. **No Mock Client Logic:** Write real API integration methods utilizing the centralized Axios client with standard URL routes. Do not create fake setTimeout calls inside page components.
4. **Sleek Interface Styling Rules:**
   - Adhere strictly to the requested aesthetic: a light-themed, high-contrast, premium palette (clean slate grays, sharp whites, rich royal blues, and emerald greens).
   - Maintain generous whitespace and high-contrast typography pairing (Inter for UI text, Outfit/Space Grotesk for display headers, JetBrains Mono for codes and tracking numbers).
   - Use subtle shadows (`shadow-sm`, `shadow-md`), thin borders (`border-slate-200`), and light background colors (`bg-slate-50`).
5. **Robust Error & Loading State Management:**
   - Always wrap API operations in structured try-catch envelopes or React Query `onError`/`onSuccess` states.
   - Every table or data list must render customized loading spinners and descriptive empty state modules.
6. **No Placeholder Comments:** Write full, compile-ready logic. Do not insert short-cut comments like `// TODO: implement later` inside core operations.
