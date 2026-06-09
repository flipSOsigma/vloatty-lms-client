# 🎓 Vloatty — Premium Learning Management System (LMS) Client

Vloatty is a state-of-the-art, high-fidelity client-only Learning Management System (LMS) designed for modern students and educators. Built using **Next.js**, **React 19**, **TypeScript**, and the modern **Tailwind CSS v4** engine, Vloatty delivers a smooth, premium desktop experience with custom micro-animations, theme-tailored layouts, and responsive state tracking.

---

## 🚀 Key Features

*   📅 **Dynamic Daily Scheduler Timeline**
    *   Schedules educational events on an hourly grid from **07:00 AM to 09:00 PM**.
    *   Automatically maps event slots by computing duration percent offsets to avoid collision.
    *   Synchronized with the client system clock to highlight the current active hour in real-time.
*   🍔 **Collapsible, State-Retaining Sidebar**
    *   Toggleable layout between fully expanded sidebar (`w-64`) and minimized icon-only sidebar (`w-[88px]`).
    *   Stored expansion state (`1` for open, `0` for minimized) inside `localStorage` for cross-session UI state persistence.
    *   Fluid, library-free transition animations using Tailwind CSS variables.
*   🖱️ **Dual-Trigger Context Menu Tooltips**
    *   Custom floating context actions menu linked to each Subject Card.
    *   Triggerable by either **left-clicking the three-dots icon** or **right-clicking anywhere** on the subject card.
    *   Calculates viewport absolute coordinates dynamically, resolving overlay container offset bugs.
    *   Includes click-away hooks to auto-dismiss menus on clicking elsewhere.
*   ✨ **Modern Refactored Subject Cards**
    *   Visually aligned with premium reference models, featuring color-themed abbreviation badges.
    *   Subtitle room locations positioned compactly underneath the subject title.
    *   Horizontal scrollable single-line badges representing upcoming schedules.
    *   Interactive modules indicators and overlapping lecturer initials avatar stacks.
*   👤 **Interactive User Profile Page**
    *   A dedicated dashboard view at `/dashboard/profile` to preview and edit user info.
    *   Displays current user status badge using the custom `premiumStatus` enum.
    *   Features a simulated live **JWT Token Decoder** widget showing parsed headers and payload claims in real-time.

---

## 🛠️ Development Progress

Recent improvements made during the latest iteration:

1.  **Refactored User Models**:
    *   Removed the legacy `role` field.
    *   Introduced `premiumStatus` enum supporting `"free"`, `"premium"`, and `"professional"`.
2.  **Subject Card Design Overhaul**:
    *   Created overlapping avatar stacks for subject lecturers.
    *   Adjusted layout structure, fonts, and spacing to match exact layout standards.
    *   Relocated schedules to an `overflow-x-auto` horizontal ribbon.
3.  **Context Menu Bounds Fix**:
    *   Fixed absolute coordinates calculation to mount the menu outside transform/scale parent boundaries, resolving off-center rendering issues.
4.  **Multi-Lecturer Migration**:
    *   Upgraded lecturers list from string arrays to structured objects containing `userId` and `name`.
5.  **Audit Capabilities**:
    *   Added metadata tracking properties (`createdBy` and `deletedBy`) directly to subjects.

---

## 📁 Data Structures & Schemas

### 1. User Database (`public/data/user.json`)
The user file holds user metadata (with `premiumStatus` enum) and the simulated authorization JWT Bearer token:

```json
{
  "user": {
    "id": "u_turing_yeager_2026",
    "name": "Turing Yeager",
    "email": "turing.y@vloatty.edu",
    "premiumStatus": "professional",
    "institution": "Turing Academy of Science",
    "avatar": ""
  },
  "jwt": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  }
}
```

### 2. Subject Model Schema (`public/data/subjects.json`)
Subjects represent classes/courses and contain multi-lecturer structures, schedules, and auditing metadata:

```json
[
  {
    "id": "s1",
    "name": "Mathematics",
    "lecturers": [
      { "userId": "u_olivia_123", "name": "Dr. Olivia" }
    ],
    "room": "West camp, Room 312",
    "color": "yellow",
    "description": "Explore limits, differentiation, integration, and applications of calculus in scientific modeling.",
    "schedules": [
      { "day": "Monday", "startTime": "07:00", "endTime": "08:40" }
    ],
    "createdBy": "u_turing_yeager_2026",
    "deletedBy": null,
    "createdAt": "2026-06-08T09:00:00.000Z",
    "updatedAt": "2026-06-08T09:30:00.000Z",
    "deletedAt": null,
    "modules": [
      {
        "id": "m1_1",
        "title": "Module 1: Limits & Continuity",
        "desc": "Foundational calculus concepts describing function behaviors near specific values.",
        "date": "2026-05-11T08:00:00.000Z",
        "createdAt": "2026-06-08T09:05:00.000Z",
        "updatedAt": "2026-06-08T09:05:00.000Z",
        "deletedAt": null,
        "lessons": [
          {
            "id": "l1_1_1",
            "title": "Lesson 1: Intuitive Definition of Limits",
            "desc": "Investigating limit behaviors graphically and numerically as values approach a point.",
            "openDate": "2026-06-01T08:00:00.000Z",
            "closeDate": "2026-06-15T23:59:59.000Z",
            "closeType": "restrict",
            "createdAt": "2026-06-08T09:06:00.000Z",
            "updatedAt": "2026-06-08T09:06:00.000Z",
            "deletedAt": null
          }
        ]
      }
    ]
  }
]
```

---

## 📖 Nice Documentation & Setup

### Prerequisites
*   **Node.js**: v18.0.0 or higher
*   **Package Manager**: npm v9.0.0 or higher

### Installation
Clone the repository and install dependencies in the root directory:
```bash
npm install
```

### Running Development Mode
Start the Next.js development server with real-time reload tracking:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** inside your browser to inspect the application.

### Building for Production
To bundle and optimize Vloatty for production deployment:
```bash
npm run build
```
Verify files structure using the start command:
```bash
npm run start
```

### Directory Architecture Overview
*   `app/` - The Next.js App Router root directories (Dashboard pages, Profile, Schedule, and Subject details dynamic routes).
*   `components/` - Global layout components including sidebar navigations (`Sidebar.tsx`), header modules (`Header.tsx`), scheduler views (`ScheduleView.tsx`), and atomic UI widgets (`SubjectCard.tsx`).
*   `types/` - Shared TypeScript definitions and data interfaces.
*   `context/` - React Context providers managing subjects listings, active date selection, and filtering parameters.
*   `public/data/` - Static mock databases representing subjects lists and session details.
