const seed = require('../data/seedDestinations');

const styleMultiplier = { Budget: 0.75, Comfort: 1, Luxury: 1.8 };

function findDestination(destinationId, catalog = seed) {
  return catalog.find((d) => d.slug === destinationId || d.id === destinationId || String(d._id) === destinationId);
}

function buildBreakdown(dest, req) {
  const mult = styleMultiplier[req.style] || 1;
  const perDay = dest.avgDailyCost * mult * req.travelers;
  const total = perDay * req.days;
  return {
    stay: Math.round(total * 0.38),
    food: Math.round(total * 0.24),
    transport: Math.round(total * 0.18),
    activities: Math.round(total * 0.14),
    misc: Math.round(total * 0.06),
  };
}

function buildItinerary(dest, req, breakdown) {
  const spots = dest.highlights?.length ? dest.highlights : [dest.name];
  const activityPerDay = Math.round(breakdown.activities / req.days);
  const foodPerDay = Math.round(breakdown.food / req.days);
  const days = [];
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

function mapLinks(dest, startLocation) {
  const q = `${dest.lat},${dest.lon}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const routeUrl = startLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(q)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
  return { mapUrl, routeUrl };
}

function buildPlan(req, catalog = seed) {
  const dest = findDestination(req.destinationId, catalog);
  if (!dest) {
    const err = new Error('Unknown destination');
    err.status = 400;
    throw err;
  }

  const breakdown = buildBreakdown(dest, req);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const over = total > req.budget;
  const start = req.startLocation || 'your city';
  const { mapUrl, routeUrl } = mapLinks(dest, req.startLocation);

  const tips = [
    `Best season for ${dest.name}: ${dest.bestSeason}.`,
    over
      ? `Estimated cost (~₹${total.toLocaleString('en-IN')}) is above your budget. Try fewer days, Budget style, or fewer travellers.`
      : `Your plan fits within budget with about ₹${(req.budget - total).toLocaleString('en-IN')} to spare.`,
    `Travel from ${start} to ${dest.name}: prefer overnight trains/buses for Budget, or short flights for Comfort/Luxury.`,
    'Book stays and long journeys early. Keep digital copies of IDs and bookings.',
    'Prices shown are estimates and may vary by season and availability.',
  ];

  if (req.interests?.includes('Adventure')) {
    tips.push('Book adventure activities with licensed operators and check weather on the day.');
  }

  return {
    destinationId: dest.slug || dest.id,
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
    interests: req.interests || [],
    createdAt: new Date().toISOString(),
    summary: `${req.days}-day ${String(req.style).toLowerCase()} trip from ${start} to ${dest.name} for ${req.travelers} traveller${
      req.travelers > 1 ? 's' : ''
    }${req.interests?.length ? `, focused on ${req.interests.join(', ').toLowerCase()}` : ''}.`,
    itinerary: buildItinerary(dest, req, breakdown),
    breakdown,
    tips,
    mapUrl,
    routeUrl,
    source: 'fallback',
    saved: false,
    status: 'upcoming',
  };
}

const cannedChat = [
  {
    match: /(hi|hello|hey)\b/i,
    reply: "Hi! I'm Atlas, your TripGenie travel assistant. Tell me a destination, budget or how many days you have.",
  },
  {
    match: /(budget|cost|cheap|price)/i,
    reply:
      'As a rough guide in India: Budget ₹2,000–3,000 / person / day, Comfort ₹3,500–5,000, Luxury ₹8,000+. Use the Budget planner for a split.',
  },
  {
    match: /(beach|sea|island)/i,
    reply: 'For beaches try Goa (Nov–Feb) or the Andaman Islands (Oct–May) for clear water and diving.',
  },
  {
    match: /(mountain|snow|trek|hill)/i,
    reply: 'For mountains: Manali for snow & adventure, Leh-Ladakh (Jun–Sep) for landscapes, Darjeeling for tea gardens.',
  },
  {
    match: /(food|eat|cuisine)/i,
    reply: 'Food picks: Kerala for seafood & spices, Jaipur for Rajasthani thali, Varanasi for street food.',
  },
  {
    match: /(pack|luggage|carry)/i,
    reply: 'Pack light layers, a power bank, first-aid kit, comfortable shoes and ID copies. Check the weather before you finalise.',
  },
  {
    match: /(season|when|weather)/i,
    reply: 'Winter (Nov–Feb) suits most of India except high mountains. Ladakh is best Jun–Sep; Kerala backwaters Sep–Mar.',
  },
  {
    match: /(atlas)/i,
    reply: "That's me — Atlas! I help with destinations, routes, budgets, stays and activities across India.",
  },
];

function localChatReply(text) {
  const hit = cannedChat.find((c) => c.match.test(text));
  return (
    (hit?.reply ||
      'I can suggest destinations, build itineraries or estimate budgets. Ask about beaches, mountains, food or the best season.') +
    '\n\n(Rule-based fallback — connect Gemini for richer answers.)'
  );
}

module.exports = { buildPlan, findDestination, localChatReply, mapLinks };
