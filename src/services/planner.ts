import { getDestination } from '../data/destinations';
import {
  BudgetBreakdown,
  ChatMessage,
  Destination,
  ItineraryDay,
  PlanRequest,
  Preferences,
  Trip,
} from '../types';
import { api, isNetworkError } from './api';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------- Recommendations ---------------------------- */

export function recommend(prefs: Preferences, all: Destination[]): { dest: Destination; score: number; why: string }[] {
  return all
    .map((dest) => {
      const matched = dest.tags.filter((t) => prefs.interests.includes(t));
      let score = matched.length * 30 + dest.rating * 5;
      if (prefs.climate !== 'Any' && dest.climate === prefs.climate) score += 15;
      const why = matched.length
        ? `Matches your interest in ${matched.join(', ')}`
        : `Popular pick, rated ${dest.rating}`;
      return { dest, score, why };
    })
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------ Trip planning ----------------------------- */

const styleMultiplier = { Budget: 0.75, Comfort: 1, Luxury: 1.8 } as const;

function buildBreakdown(dest: Destination, req: PlanRequest): BudgetBreakdown {
  const perDay = dest.avgDailyCost * styleMultiplier[req.style] * req.travelers;
  const total = perDay * req.days;
  return {
    stay: Math.round(total * 0.38),
    food: Math.round(total * 0.24),
    transport: Math.round(total * 0.18),
    activities: Math.round(total * 0.14),
    misc: Math.round(total * 0.06),
  };
}

function buildItinerary(dest: Destination, req: PlanRequest, breakdown: BudgetBreakdown): ItineraryDay[] {
  const spots = dest.highlights.length ? dest.highlights : [dest.name];
  const activityPerDay = Math.round(breakdown.activities / req.days);
  const foodPerDay = Math.round(breakdown.food / req.days);
  const days: ItineraryDay[] = [];
  for (let d = 1; d <= req.days; d++) {
    const spot = spots[(d - 1) % spots.length];
    const next = spots[d % spots.length];
    const first = d === 1;
    const last = d === req.days && req.days > 1;
    days.push({
      day: d,
      title: first ? `Arrive in ${dest.name}` : last ? 'Last-day shopping and departure' : `Explore ${spot}`,
      items: [
        {
          time: '09:00',
          title: first ? 'Arrival and check-in' : `Visit ${spot}`,
          detail: first
            ? 'Settle in, freshen up and pick up a local SIM or map.'
            : 'Start early to beat the crowds and the heat.',
          cost: first ? 0 : Math.round(activityPerDay * 0.6),
        },
        {
          time: '13:00',
          title: 'Local lunch',
          detail: `Try a well-reviewed local place. Ask for regional specialties in ${dest.region}.`,
          cost: Math.round(foodPerDay * 0.5),
        },
        {
          time: '16:00',
          title: last ? 'Souvenirs and packing' : first ? `Short walk around the neighbourhood` : `Head to ${next}`,
          detail: last ? 'Leave buffer time for travel to the station or airport.' : 'Keep the afternoon flexible for rest.',
          cost: Math.round(activityPerDay * 0.4),
        },
        {
          time: '20:00',
          title: 'Dinner and evening stroll',
          detail: 'Wrap up the day with a relaxed dinner.',
          cost: Math.round(foodPerDay * 0.5),
        },
      ],
    });
  }
  return days;
}

function localPlan(req: PlanRequest): Trip {
  const dest = getDestination(req.destinationId);
  if (!dest) throw new Error('Unknown destination');
  const breakdown = buildBreakdown(dest, req);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const over = total > req.budget;
  const tips = [
    `Best season for ${dest.name}: ${dest.bestSeason}.`,
    over
      ? `Your estimated cost is above your budget. Consider fewer days or a more budget-friendly style.`
      : `Your plan fits within your budget with about ₹${(req.budget - total).toLocaleString('en-IN')} to spare.`,
    'Book stays and long train or bus rides early for better prices.',
    'Keep digital copies of IDs and bookings.',
  ];
  return {
    id: uid(),
    destinationId: dest.id,
    destinationName: dest.name,
    emoji: dest.emoji,
    colors: dest.colors,
    days: req.days,
    travelers: req.travelers,
    budget: req.budget,
    style: req.style,
    createdAt: new Date().toISOString(),
    summary: `${req.days}-day ${req.style.toLowerCase()} trip to ${dest.name} for ${req.travelers} traveller${
      req.travelers > 1 ? 's' : ''
    }${req.interests.length ? `, focused on ${req.interests.join(', ').toLowerCase()}` : ''}.`,
    itinerary: buildItinerary(dest, req, breakdown),
    breakdown,
    tips,
    saved: false,
  };
}

/**
 * Tries the backend AI endpoint first. If the backend is unreachable the app
 * falls back to a local rule-based planner so every screen stays usable.
 */
export async function generatePlan(req: PlanRequest): Promise<{ trip: Trip; source: 'ai' | 'demo' }> {
  try {
    const res = await api.post('/ai/plan', req, { timeout: 30000 });
    const data = res.data?.trip ?? res.data;
    if (data && Array.isArray(data.itinerary)) {
      const base = localPlan(req);
      return { trip: { ...base, ...data, id: data.id ?? data._id ?? base.id }, source: 'ai' };
    }
    throw new Error('Unexpected AI response');
  } catch (err) {
    if (!isNetworkError(err) && !(err instanceof Error)) throw err;
    await wait(1200);
    return { trip: localPlan(req), source: 'demo' };
  }
}

/* --------------------------------- Chatbot -------------------------------- */

const canned: { match: RegExp; reply: string }[] = [
  { match: /(hi|hello|hey)\b/i, reply: 'Hi! Tell me where you want to go, your budget or how many days you have, and I will help plan it.' },
  { match: /(budget|cost|cheap|price)/i, reply: 'As a rough guide, budget trips in India run ₹2,000–3,000 per person per day, comfort trips ₹3,500–5,000 and luxury ₹8,000+. Use the Budget tab to split your total.' },
  { match: /(beach|sea|island)/i, reply: 'For beaches, try Goa (Nov–Feb) for a lively scene or the Andaman Islands (Oct–May) for clear water and diving.' },
  { match: /(mountain|snow|trek|hill)/i, reply: 'For mountains, Manali is great for snow and adventure, Leh-Ladakh (Jun–Sep) for dramatic landscapes and Darjeeling for tea gardens and sunrise views.' },
  { match: /(food|eat|cuisine)/i, reply: 'Food picks: Kerala for seafood and spices, Jaipur for Rajasthani thali and Varanasi for street food.' },
  { match: /(pack|luggage|carry)/i, reply: 'Pack light layers, a power bank, a basic first-aid kit, comfortable shoes and copies of your IDs. Check the weather for your dates before you finalise.' },
  { match: /(season|when|weather)/i, reply: 'Winter (Nov–Feb) suits most of India except high mountains. Ladakh is best Jun–Sep, and the Kerala backwaters Sep–Mar.' },
];

export async function askChatbot(history: ChatMessage[], text: string): Promise<string> {
  try {
    const res = await api.post('/ai/chat', { message: text, history: history.slice(-8) }, { timeout: 30000 });
    const reply = res.data?.reply ?? res.data?.message ?? res.data?.text;
    if (typeof reply === 'string' && reply.trim()) return reply;
    throw new Error('Empty chat response');
  } catch {
    await wait(700);
    const hit = canned.find((c) => c.match.test(text));
    return (
      (hit?.reply ?? 'I can suggest destinations, build an itinerary or estimate a budget. Try asking about beaches, mountains, food or the best season to travel.') +
      '\n\n(Demo mode: connect the backend for live AI answers.)'
    );
  }
}
