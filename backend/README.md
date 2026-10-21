# TripGenie AI — Backend

Node.js + Express + MongoDB Atlas + Gemini AI REST API for the TripGenie Android (Expo) app.

## Admin

- **Name:** Shraddha Pethkar  
- Default email/password come from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Setup

```bash
cd backend
cp .env.example .env
# Edit MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run seed   # optional — also runs automatically on first start
npm run dev
```

API base: `http://localhost:5050/api`  
Health: `GET /api/health`

## Main routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/health` | — | Connection test |
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login → `{ token, user }` |
| POST | `/auth/forgot-password` | — | Reset email / demo token |
| POST | `/auth/reset-password` | — | Apply new password |
| GET | `/auth/me` | JWT | Current user |
| PUT | `/users/preferences` | JWT | Save preferences |
| PUT | `/users/profile` | JWT | Update name / avatar |
| GET | `/destinations` | — | Catalogue |
| POST/PUT/PATCH/DELETE | `/destinations…` | Admin | Manage catalogue |
| POST | `/ai/plan` | JWT | Gemini itinerary (+ fallback) |
| POST | `/ai/chat` | JWT | Atlas chatbot |
| CRUD | `/trips` | JWT | User itineraries |
| GET/POST/DELETE | `/favorites/:id` | JWT | Wishlist |
| GET/POST | `/notifications` | JWT | In-app alerts |
| GET/POST | `/reviews/:destinationId` | mixed | Ratings |
| GET | `/admin/stats` | Admin | Dashboard stats |

## Environment

Keep `GEMINI_API_KEY`, `JWT_SECRET` and Mongo credentials only in `.env` — never in the mobile app.
