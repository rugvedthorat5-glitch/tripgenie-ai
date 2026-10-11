# TripGenie AI — Frontend (Expo SDK 57)

AI-Based Personalized Travel Recommendation & Smart Trip Planner.
React Native + Expo Router + TypeScript + Context API + Axios.

## Features

| Area | What it does |
|---|---|
| Auth | Login, Register, Forgot password, token stored in AsyncStorage |
| Home | Greeting, quick actions, notification bell, personalised recommendations, favourites, latest plan |
| Explore | Search + interest filter |
| Destination | Details, highlights, best season, cost/day, favourite (heart), reviews and ratings, links to weather and map |
| AI Trip Planner | Destination, days, travellers, budget, style, interests, generates a full itinerary |
| Itinerary | Day-by-day plan, budget breakdown, tips, packing checklist, save, share, delete |
| My Trips | All plans, saved plans, favourite places |
| AI Chatbot | Chat UI with suggestion chips |
| Budget planner | Per-day estimate and suggested split |
| Weather | Live 6-day forecast per destination (free Open-Meteo, no API key) |
| Maps | India locator with pins, plus Google Maps links for place, directions and nearby restaurants, hotels, ATMs, hospitals |
| Notifications | In-app notification centre with unread badge |
| Profile | Profile photo, stats, preferences, backend connection test, logout |
| Admin panel | Catalog stats, add or remove destinations, backend test. Visible when the login email starts with `admin` (for example admin@test.com) or the backend returns `role: "admin"` |

**Demo mode:** if the backend is not reachable, login/register, the AI planner and the chatbot
fall back to local logic so every screen can be tested. When the backend is running, the same
screens call it automatically.

## Run (Windows, one time)

```
cd /d E:\travel-ai-frontend
npm install
copy .env.example .env
```

## Run in the browser (easiest)

```
npx expo start --web
```

Open http://localhost:8081

## Run on your phone

Expo Go on your phone supports SDK 54 only, so it cannot open an SDK 57 project.
Build an installable APK with EAS instead:

```
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Download the APK from the link EAS prints and install it on the phone.

## Connecting the backend

Set `EXPO_PUBLIC_API_URL` in `.env` and restart Expo. Use Profile > "Test backend connection"
to check it. The app calls these routes (change `src/services/api.ts` and
`src/services/planner.ts` if your backend differs):

| Method | Route | Used for |
|---|---|---|
| GET | /health | optional, connection test |
| POST | /auth/register, /auth/login | return `{ token, user }` |
| POST | /auth/forgot-password | password reset email |
| PUT | /users/preferences | save preferences |
| POST | /ai/plan | returns `{ trip }` with `itinerary`, `breakdown`, `tips` |
| POST | /ai/chat | returns `{ reply }` |
| POST / DELETE | /trips, /trips/:id | save and delete trips |

Favourites, reviews, notifications, packing lists, custom destinations and the profile photo are
stored on the device (AsyncStorage). Moving them to the backend is the natural next step.

## Project structure

```
app/            Expo Router screens ((auth), (tabs), destination, itinerary, chat, budget,
                preferences, weather, map, notifications, admin)
src/components  Reusable UI (Button, Input, Chip, Card, DestinationCard)
src/context     Auth, Trips, Destinations, Extras (favourites, reviews, notifications, checklist)
src/services    api.ts (Axios), planner.ts (AI calls + local fallback), weather.ts, health.ts
src/data        Destination catalog
src/utils       roles.ts
```

## Notes

- Map screen is a lightweight locator with deep links to Google Maps. A full in-app map
  (react-native-maps) needs a Google Maps API key and a development build.
- Push notifications (FCM) are not included; notifications are in-app only.
- Destination images are emoji and gradients. Real photos can come from the backend later.
