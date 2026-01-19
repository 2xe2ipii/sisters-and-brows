# Sisters & Brows - Intelligent Booking System 🌸✨

> A full-stack appointment scheduling application built with **Next.js 14** and **Google Sheets** as a headless CMS/Database. Features real-time capacity management, double-booking protection, and a "Smart-Sync" architecture.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Google%20Sheets%20API-blue)

## 🚀 The "Smart-Sync" Engine

This isn't just a form; it's an automated receptionist. The application connects directly to a Google Sheet to act as a living database.

* **Zero-Conflict Scheduling:** The system enforces a hard limit of **4 bookings per time slot**. It counts active rows in real-time before accepting new clients.
* **Idempotent Submissions:** Prevents accidental double-bookings. If a client submits twice for the same slot, the system intelligently updates their existing record instead of creating duplicates.
* **Smart Rescheduling:** Clients can move their appointments effortlessly. The backend searches for their identity (Phone Number) and moves their slot without cluttering the database with cancelled rows.
* **Multi-Branch Logic:** Manages inventory for 6 different branch locations simultaneously.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database:** Google Sheets (via `google-spreadsheet` & `google-auth-library`)
* **Validation:** [Zod](https://zod.dev/) (Strict server-side validation)
* **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
├── app/
│   ├── actions.ts        # Server Actions (Business Logic, Capacity Checks)
│   ├── page.tsx          # Landing Page
│   └── layout.tsx        # Root Layout
├── components/
│   └── BookingForm.tsx   # Client Component (UI, Real-time Feedback)
├── lib/
│   └── googleSheets.ts   # Singleton Google Auth Connection
└── public/               # Static Assets
```

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/sister-and-brows.git](https://github.com/yourusername/sister-and-brows.git)
cd sister-and-brows
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory. You will need a Google Cloud Service Account.

```env
# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID="your_google_sheet_id_here"
```

### 4. Google Sheet Setup
Your Google Sheet **MUST** have the following headers in Row 1 for the matching logic to work:
`BRANCH`, `FACEBOOK NAME`, `FULL NAME`, `Contact Number`, `DATE`, `TIME`, `CLIENT #`, `SERVICES`, `SESSION`, `STATUS`, `ACK?`, `M O P`, `REMARKS`

> **Note:** Share your Google Sheet with the `GOOGLE_SERVICE_ACCOUNT_EMAIL` (give it "Editor" access) so the API can write to it.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app live.

## 🧩 Key Features Breakdown

### Capacity Logic (`actions.ts`)
The `getSlotAvailability` function scans the raw sheet data to calculate remaining slots for any given Branch + Date + Time combination.

### Data Normalization
To ensure data integrity, the system employs strict normalizers:
* **Phone:** `0917-123-4567` becomes `09171234567`
* **Date:** `1/20/2026` becomes `2026-01-20`
* **Time:** `10:00 AM - 11:30 AM` becomes `10:00 am`

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by 2xe2ipi for Sisters & Brows*