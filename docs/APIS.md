# TripGenie AI — Required APIs for 100% functionality

## External services (keys / accounts)

| Service | Required? | Where | Purpose |
|---------|-----------|--------|---------|
| **MongoDB** | Yes (for persistence) | `backend/.env` → `MONGODB_URI` | Users, trips, favourites, notifications, destinations, reviews |
| **Google Gemini** | Optional but recommended | `backend/.env` → `GEMINI_API_KEY` | Live AI itineraries + Atlas chatbot. Without it, rule-based fallback still works. |
| **Open-Meteo** | No key | Called from the app | 6-day weather (no auth token sent) |
| **Google Maps** | No key (deep links) | App opens browser/maps URLs | Directions, nearby hotels/ATMs/etc. |

Get a free Gemini key: [Google AI Studio](https://aistudio.google.com/apikey) → paste into `backend/.env` → restart backend.

---

## Backend REST APIs (our server on `:5050/api`)

### Auth
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| POST | `/auth/register` | — | Sign up |
| POST | `/auth/login` | — | Login → JWT |
| POST | `/auth/forgot-password` | — | Reset email / demo token |
| POST | `/auth/reset-password` | — | Set new password |
| GET | `/auth/me` | JWT | Session restore |

### User
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| PUT | `/users/preferences` | JWT | Interests / style / climate |
| PUT | `/users/profile` | JWT | Name + avatar |

### Destinations
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| GET | `/destinations` | — | Explore catalogue |
| GET | `/destinations/:id` | — | Destination detail |
| POST/PUT/PATCH/DELETE | `/destinations…` | Admin | Manage catalogue |

### AI
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| POST | `/ai/plan` | JWT | Gemini itinerary (+ fallback) |
| POST | `/ai/chat` | JWT | Atlas chatbot |

### Trips / wishlist / social
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| GET/POST/PUT/DELETE | `/trips` | JWT | Save / edit / delete itineraries |
| GET/POST/DELETE | `/favorites/:id` | JWT | Wishlist |
| GET/POST | `/reviews/:destinationId` | mixed | Ratings |
| GET/POST/PATCH/DELETE | `/notifications…` | JWT | In-app alerts |

### Budget / admin / health
| Method | Route | Auth | Used for |
|--------|-------|------|----------|
| POST | `/budget/estimate` | — | Smart budget split |
| GET | `/admin/stats` | Admin | Dashboard stats |
| GET | `/health` | — | Connection test |

---

## Already complete vs PS

- Auth + forgot/reset + secure token storage + demo/memory fallback  
- Home, Explore, Destination, AI Planner, Itinerary (PDF/share/edit/status), My Trips  
- Atlas chatbot, Smart budget, Weather (temp + rain), Maps + multi-stop routes, Notifications  
- Profile name/photo + preferences, Admin add/edit/hide/unhide (Shraddha Pethkar), MongoDB persistence  
- Demo accounts seeded: `demo@tripgenie.com` / `Demo@12345`, admin as above  

## Optional upgrades (not required for PS demo)

- Push notifications (FCM)  
- Full in-app `react-native-maps` (needs Google Maps SDK key + native build)  
- SMTP for real password-reset emails  
- Live Gemini answers (set `GEMINI_API_KEY`) — fallback planner already covers the PS  

