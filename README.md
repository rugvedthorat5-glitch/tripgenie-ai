# 🧭 TripGenie AI — Intelligent Personalized Travel Companion

> **College Mega-Project**  
> **Student & Project Lead:** Shraddha Pethkar  
> **Developer & Pair:** Nitin Gaikwad  
> **Stack:** React Native (Expo SDK 52+) • TypeScript • Node.js Express • MongoDB Atlas • Google Gemini AI • Hostinger Cloud

---

## 🚀 Live Production Cloud Deployment

The backend and database are **fully deployed live** on Hostinger cloud infrastructure with automatic scaling and zero local configuration needed:

- **Live Cloud API Base:** `https://blanchedalmond-wildcat-125853.hostingersite.com/api`
- **Health Check Endpoint:** `https://blanchedalmond-wildcat-125853.hostingersite.com/api/health`
- **Database:** MongoDB Atlas (Production Cluster with 50+ curated destinations seeded)
- **AI Engine:** Google Gemini 2.5 Flash

---

## 🔑 Login Credentials (For Testing & Evaluation)

You can log in immediately using either account:

### 1. Traveller Account (General User)
- **Email:** `demo@tripgenie.com`
- **Password:** `Demo@12345`
- **Features:** AI Trip Architect, Smart Budget Planner, 6-Day Weather, 50+ Destination Catalog, Saved Trips, PDF Itinerary Export, Ask Atlas Chatbot.

### 2. Admin Account (Shraddha Pethkar)
- **Email:** `admin@tripgenie.com`
- **Password:** `Admin@12345`
- **Features:** Full access to **Admin Console** (Segmented Dashboard, Live Cloud Telemetry, Add New Destination, Edit/Hide/Delete Catalog entries, System Metrics).

---

## 📂 Repository Structure

The project is structured as a clean full-stack monorepo:

```
TripGenie/
├── frontend/                   # React Native & Expo Mobile/Web App
│   ├── app/                    # Expo Router screens (Tabs, Auth, Details)
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (tabs)/             # Home, Explore, AI Plan, Trips, Profile
│   │   ├── admin.tsx           # Admin Management Console (iOS Segmented Control)
│   │   ├── chat.tsx            # Atlas AI Assistant
│   │   ├── budget.tsx          # Smart Budget Planner
│   │   ├── weather.tsx         # Real-time Weather
│   │   └── map.tsx             # Interactive Indian Map
│   ├── assets/                 # App icons, splash screens, hero banners
│   ├── src/                    # Shared components, contexts, theme, services
│   │   ├── components/         # Reusable UI widgets, cards, headers
│   │   ├── context/            # Auth, Destinations, Trips, Extras contexts
│   │   ├── services/           # Axios API client, AI planner, Weather
│   │   └── theme.ts            # Design tokens & color system
│   ├── android/                # Native Android build configuration
│   ├── app.json                # Expo project configuration
│   ├── package.json            # Frontend dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── backend/                    # Node.js + Express REST API Server
│   ├── src/                    # Backend architecture
│   │   ├── controllers/        # Auth, Destinations, Trips, Chat, Admin
│   │   ├── models/             # Mongoose schemas (User, Trip, Destination)
│   │   ├── routes/             # Express API endpoints
│   │   ├── middleware/         # JWT authentication & admin role guard
│   │   ├── services/           # Google Gemini AI client
│   │   └── scripts/            # Database seed script (50 Indian destinations)
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Backend environment template
│
├── docs/                       # Guides and API documentation
│   ├── APIS.md                 # Complete API checklist & endpoints
│   └── MOBILE_GUIDE.md         # Android phone testing and installation guide
│
├── .gitignore                  # Clean repository ignore list
├── package.json                # Root package.json with workspace runner scripts
├── start.sh                    # One-click startup script for macOS / Linux
├── run_windows.bat             # One-click startup script for Windows
└── README.md                   # This documentation
```

---

## ⚡ Quick Start Guide (For Friends & Reviewers)

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [Git](https://git-scm.com)
- *(Optional for mobile testing)* [Expo Go app](https://expo.dev/go) or Android USB connection

---

### Option A: Run Using Root Scripts (Easiest)

From the project root:

```bash
# 1. Install dependencies for both frontend and backend in one go:
npm run install:all

# 2. Run the frontend mobile / web app:
npm run frontend

# 3. (Optional) Run local backend if you want to test local MongoDB:
npm run backend
```

---

### Option B: Run Frontend Individually

The frontend connects directly to the **live Hostinger cloud backend** by default, so you do **not** even need to run a local backend or database!

```bash
cd frontend
npm install
npx expo start
```

- Press `w` to open the web version in your browser.
- Press `a` to run on a connected Android phone or emulator.
- Scan the displayed QR code with your phone using **Expo Go**.

---

### Option C: Run Backend Individually (For Local Development)

```bash
cd backend
npm install
cp .env.example .env
npm run seed       # Seeds destinations and admin user
npm run dev        # Starts backend on http://localhost:5050
```

---

## 📱 Features Delivered

1. **Authentication:** JWT sessions, secure password hashing, auto-login persistence, role-based admin check.
2. **iOS-Style Animated Navigation:** Smooth spring-physics tab transitions, active teal micro-dots, unclipped icons.
3. **Admin Console:** Segmented controls (Dashboard Metrics, Catalog Search & Management, Add/Edit Destinations).
4. **Atlas AI Assistant:** Powered by Google Gemini 2.5 Flash for conversational travel advice and packing suggestions.
5. **Smart Budget Planner:** Destination-based cost estimates broken down by accommodation, food, transport, and activities.
6. **AI Trip Planner:** Dynamic itinerary generation with day-by-day plans, maps, and PDF export.
7. **Curated Indian Destinations:** 50 hand-crafted destinations across beaches, mountains, heritage, nature, spiritual, and adventure.

---

## 👥 Contributors & Credits
- **Shraddha Pethkar** — Project Architecture, Research & Administration
- **Nitin Gaikwad** — Engineering & Full-Stack Development
