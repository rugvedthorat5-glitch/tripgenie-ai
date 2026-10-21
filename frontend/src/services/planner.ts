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
          title: last ? 'Souvenirs and packing' : first ? 'Short walk around the neighbourhood' : `Head to ${next}`,
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

function mapLinks(dest: Destination, startLocation?: string) {
  const q = `${dest.lat},${dest.lon}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const routeUrl = startLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(q)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
  return { mapUrl, routeUrl };
}

export function localPlan(req: PlanRequest): Trip {
  const dest = getDestination(req.destinationId);
  if (!dest) throw new Error('Unknown destination');
  const breakdown = buildBreakdown(dest, req);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const over = total > req.budget;
  const start = req.startLocation || 'your city';
  const { mapUrl, routeUrl } = mapLinks(dest, req.startLocation);

  const tips = [
    `Best season for ${dest.name}: ${dest.bestSeason}.`,
    over
      ? `Your estimated cost is above your budget. Consider fewer days or a more budget-friendly style.`
      : `Your plan fits within your budget with about ₹${(req.budget - total).toLocaleString('en-IN')} to spare.`,
    `Travel from ${start} to ${dest.name}: overnight trains/buses for Budget, or short flights for Comfort/Luxury.`,
    'Book stays and long train or bus rides early for better prices.',
    'Keep digital copies of IDs and bookings. Prices shown are estimates.',
  ];

  return {
    id: uid(),
    destinationId: dest.id,
    destinationName: dest.name,
    startLocation: req.startLocation || '',
    startDate: req.startDate || null,
    endDate: req.endDate || null,
    emoji: dest.emoji,
    colors: dest.colors,
    days: req.days,
    travelers: req.travelers,
    budget: req.budget,
    style: req.style,
    interests: req.interests,
    createdAt: new Date().toISOString(),
    summary: `${req.days}-day ${req.style.toLowerCase()} trip from ${start} to ${dest.name} for ${req.travelers} traveller${
      req.travelers > 1 ? 's' : ''
    }${req.interests.length ? `, focused on ${req.interests.join(', ').toLowerCase()}` : ''}.`,
    itinerary: buildItinerary(dest, req, breakdown),
    breakdown,
    tips,
    mapUrl,
    routeUrl,
    source: 'demo',
    saved: false,
    status: 'upcoming',
  };
}

/**
 * Tries the backend Gemini endpoint first. If unreachable, uses a local rule-based planner.
 */
export async function generatePlan(req: PlanRequest): Promise<{ trip: Trip; source: 'ai' | 'demo' | 'fallback' }> {
  try {
    const res = await api.post('/ai/plan', req, { timeout: 45000 });
    const data = res.data?.trip ?? res.data;
    if (data && Array.isArray(data.itinerary)) {
      const base = localPlan(req);
      return {
        trip: {
          ...base,
          ...data,
          id: data.id ?? data._id ?? base.id,
          colors: data.colors?.length === 2 ? data.colors : base.colors,
          source: data.source === 'ai' ? 'ai' : 'fallback',
        },
        source: data.source === 'ai' ? 'ai' : 'fallback',
      };
    }
    throw new Error('Unexpected AI response');
  } catch (err) {
    if (!isNetworkError(err) && !(err instanceof Error)) throw err;
    await wait(800);
    return { trip: localPlan(req), source: 'demo' };
  }
}

/* --------------------------------- Atlas chatbot -------------------------------- */

const canned: { match: RegExp; reply: string }[] = [
  {
    match: /(hi|hello|hey)\b/i,
    reply: "Hi! I'm Atlas, your TripGenie travel assistant. Tell me where you want to go, your budget or how many days you have.",
  },
  {
    match: /(budget|cost|cheap|price)/i,
    reply:
      'As a rough guide, budget trips in India run ₹2,000–3,000 per person per day, comfort trips ₹3,500–5,000 and luxury ₹8,000+. Use the Budget tab to split your total.',
  },
  {
    match: /(beach|sea|island)/i,
    reply: 'For beaches, try Goa (Nov–Feb) for a lively scene or the Andaman Islands (Oct–May) for clear water and diving.',
  },
  {
    match: /(mountain|snow|trek|hill)/i,
    reply:
      'For mountains, Manali is great for snow and adventure, Leh-Ladakh (Jun–Sep) for dramatic landscapes and Darjeeling for tea gardens and sunrise views.',
  },
  {
    match: /(food|eat|cuisine)/i,
    reply: 'Food picks: Kerala for seafood and spices, Jaipur for Rajasthani thali and Varanasi for street food.',
  },
  {
    match: /(pack|luggage|carry)/i,
    reply:
      'Pack light layers, a power bank, a basic first-aid kit, comfortable shoes and copies of your IDs. Check the weather for your dates before you finalise.',
  },
  {
    match: /(season|when|weather)/i,
    reply: 'Winter (Nov–Feb) suits most of India except high mountains. Ladakh is best Jun–Sep, and the Kerala backwaters Sep–Mar.',
  },
  {
    match: /atlas/i,
    reply: "That's me — Atlas! Ask about destinations, sightseeing, routes, budgets, stays or activities anywhere in India.",
  },
];

export async function askChatbot(
  history: ChatMessage[],
  text: string,
  tripContext?: Partial<Trip> | null
): Promise<string> {
  try {
    const res = await api.post(
      '/ai/chat',
      { message: text, history: history.slice(-8), tripContext: tripContext || null },
      { timeout: 30000 }
    );
    const reply = res.data?.reply ?? res.data?.message ?? res.data?.text;
    if (typeof reply === 'string' && reply.trim()) return reply;
    throw new Error('Empty chat response');
  } catch {
    await wait(500);
    const hit = canned.find((c) => c.match.test(text));
    return (
      (hit?.reply ??
        'I can suggest destinations, build an itinerary or estimate a budget. Try asking about beaches, mountains, food or the best season to travel.') +
      '\n\n(Demo mode: connect the backend + Gemini for live Atlas answers.)'
    );
  }
}

/** Smart budget estimate from destination + style (labelled as estimates). */
export function estimateBudget(opts: {
  dest: Destination;
  days: number;
  travelers: number;
  style: Preferences['travelStyle'];
  userBudget?: number;
}) {
  const req: PlanRequest = {
    destinationId: opts.dest.id,
    days: opts.days,
    travelers: opts.travelers,
    budget: opts.userBudget || 999999,
    style: opts.style,
    interests: [],
  };
  const breakdown = buildBreakdown(opts.dest, req);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const perPerson = Math.round(total / Math.max(1, opts.travelers));
  const tips: string[] = [];
  if (opts.userBudget && total > opts.userBudget) {
    tips.push('Estimated total exceeds your budget — try Budget style, fewer days, or a cheaper destination.');
    tips.push('Cut stay costs with hostels/homestays, use trains overnight, and prioritise free attractions.');
  } else if (opts.userBudget) {
    tips.push(`You have about ₹${(opts.userBudget - total).toLocaleString('en-IN')} of buffer vs your budget.`);
  }
  tips.push('All amounts are estimates and may vary by season and availability.');
  return { breakdown, total, perPerson, tips };
}
