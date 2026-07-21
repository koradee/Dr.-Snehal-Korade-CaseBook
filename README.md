# CaseBook: Personal EMR System

> ⚠️ **Disclaimer:** This project is intended as a personal Electronic Medical Record (EMR) system for a solo practitioner. It handles real patient health data. It is **not** designed for multi-user hospital deployment, and any public hosting should ensure strict database security (RLS policies) and secure environment variables.

CaseBook is a lightweight, fast, and clean EMR system built specifically to manage patient records, consultation notes, and clinical images without the bloat of enterprise hospital systems.

## 🌟 Key Features
- **Patient Directory:** Manage demographics, contact details, and custom tags. Archive patients safely without deleting their historical data.
- **Consultation Timeline:** Record vitals, chief complaints, diagnoses, and prescriptions. Consultations are strictly immutable once saved.
- **Clinical Images & Documents:** Upload lab reports and clinical photos securely.
- **Offline Drafts:** Work-in-progress notes are auto-saved to your browser to prevent data loss.
- **Voice-to-Text:** Dictate clinical notes using built-in speech recognition.
- **PDF Export:** Export prescriptions beautifully to PDF.

## 🛠 Tech Stack
- **Frontend/Backend:** React, Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Custom Dark/Light themes)
- **Database:** PostgreSQL (via Supabase)
- **File Storage:** Supabase Storage (Private Buckets)

## 📁 Folder Structure Overview
- `src/app/`: Contains all the Next.js pages, layouts, and API routes.
- `src/components/`: Reusable UI components (forms, modals, buttons).
- `src/lib/`: Core utilities for database connections, session management, and utilities.
- `migrations/`: SQL files defining the database schema.
- `scripts/`: Helper scripts for migrating and seeding the database.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- A **Supabase** account (for managed PostgreSQL database and private file storage).

### 2. Clone and Install
```bash
git clone https://github.com/yourusername/dr-snehal-korade-casebook.git
cd dr-snehal-korade-casebook
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in your Supabase credentials. **Never commit `.env.local` to version control.**

### 4. Supabase Setup
In your Supabase project dashboard:
1. Copy your Database connection string (use the connection pooler URL if possible) into `DATABASE_URL`.
2. Copy your Project URL into `SUPABASE_URL`.
3. Copy your `service_role` secret key into `SUPABASE_SERVICE_ROLE_KEY`.
4. Navigate to **Storage** and create two **private** buckets:
   - `clinical-images`
   - `documents`

### 5. Initialize the Database
Run the schema migrations to build your tables, and seed the initial admin account:
```bash
npm run migrate
npm run db:seed
```

### 6. Run the App
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). You can log in using the `admin` account (default password is in `.env.example`).
