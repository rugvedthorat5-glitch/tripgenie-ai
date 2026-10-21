export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  avatar?: string | null;
};

export type Preferences = {
  interests: string[];
  travelStyle: 'Budget' | 'Comfort' | 'Luxury';
  companions: 'Solo' | 'Couple' | 'Family' | 'Friends';
  climate: 'Any' | 'Warm' | 'Cool' | 'Snow';
};

export type Destination = {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  emoji: string;
  imageUrl?: string;
  colors: [string, string];
  rating: number;
  tags: string[];
  bestSeason: string;
  avgDailyCost: number; // INR per person per day
  description: string;
  highlights: string[];
  climate: 'Warm' | 'Cool' | 'Snow';
  hidden?: boolean;
};

export type ItineraryItem = {
  time: string;
  title: string;
  detail: string;
  cost: number;
};

export type ItineraryDay = {
  day: number;
  title: string;
  items: ItineraryItem[];
};

export type BudgetBreakdown = {
  stay: number;
  food: number;
  transport: number;
  activities: number;
  misc: number;
};

export type Trip = {
  id: string;
  destinationId: string;
  destinationName: string;
  startLocation?: string;
  startDate?: string | null;
  endDate?: string | null;
  emoji: string;
  colors: [string, string];
  days: number;
  travelers: number;
  budget: number;
  style: string;
  interests?: string[];
  createdAt: string;
  summary: string;
  itinerary: ItineraryDay[];
  breakdown: BudgetBreakdown;
  tips: string[];
  mapUrl?: string;
  routeUrl?: string;
  source?: 'ai' | 'fallback' | 'demo' | 'manual';
  saved: boolean;
  status?: 'upcoming' | 'past' | 'draft';
  packingChecks?: string[];
};

export type PlanRequest = {
  destinationId: string;
  days: number;
  travelers: number;
  budget: number;
  style: Preferences['travelStyle'];
  interests: string[];
  startLocation?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};
