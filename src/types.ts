export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
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
  colors: [string, string];
  rating: number;
  tags: string[];
  bestSeason: string;
  avgDailyCost: number; // INR per person per day
  description: string;
  highlights: string[];
  climate: 'Warm' | 'Cool' | 'Snow';
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
  emoji: string;
  colors: [string, string];
  days: number;
  travelers: number;
  budget: number;
  style: string;
  createdAt: string;
  summary: string;
  itinerary: ItineraryDay[];
  breakdown: BudgetBreakdown;
  tips: string[];
  saved: boolean;
};

export type PlanRequest = {
  destinationId: string;
  days: number;
  travelers: number;
  budget: number;
  style: Preferences['travelStyle'];
  interests: string[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};
