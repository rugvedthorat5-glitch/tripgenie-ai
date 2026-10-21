import axios from 'axios';

export type DayForecast = {
  date: string;
  code: number;
  max: number;
  min: number;
  rainMm: number;
  precipProb: number;
};

export type Weather = {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  code: number;
  rainMm: number;
  daily: DayForecast[];
};

export function describe(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Clear sky', emoji: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', emoji: '⛅' };
  if (code === 3) return { label: 'Overcast', emoji: '☁️' };
  if (code === 45 || code === 48) return { label: 'Fog', emoji: '🌫️' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', emoji: '🌦️' };
  if (code >= 61 && code <= 67) return { label: 'Rain', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snow', emoji: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', emoji: '🌧️' };
  if (code === 85 || code === 86) return { label: 'Snow showers', emoji: '🌨️' };
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Unknown', emoji: '🌡️' };
}

/**
 * Free Open-Meteo forecast (no API key needed).
 * Uses plain axios on purpose so the app's auth token is never sent to a third party.
 */
export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,precipitation' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max' +
    '&timezone=auto&forecast_days=6';
  const res = await axios.get(url, { timeout: 10000 });
  const c = res.data.current;
  const d = res.data.daily;
  return {
    temp: c.temperature_2m,
    feels: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    code: c.weather_code,
    rainMm: c.precipitation ?? 0,
    daily: (d.time as string[]).map((date, i) => ({
      date,
      code: d.weather_code[i],
      max: d.temperature_2m_max[i],
      min: d.temperature_2m_min[i],
      rainMm: d.precipitation_sum?.[i] ?? 0,
      precipProb: d.precipitation_probability_max?.[i] ?? 0,
    })),
  };
}

export function advice(w: Weather): string {
  const rainyDay = w.daily.find((d) => d.rainMm >= 2 || d.precipProb >= 60);
  if (w.code >= 95) return 'Thunderstorms expected. Keep outdoor plans flexible and avoid open areas during storms.';
  if ((w.code >= 51 && w.code <= 67) || (w.code >= 80 && w.code <= 82) || w.rainMm >= 1) {
    return 'Rain likely. Carry a raincoat or umbrella and waterproof your bag. Prefer indoor museums/cafes for peak rain hours.';
  }
  if (rainyDay) {
    return `Rain chance around ${rainyDay.precipProb || '—'}% on ${rainyDay.date}. Keep a light rain plan for outdoor activities.`;
  }
  if (w.code >= 71 && w.code <= 86) return 'Snow around. Pack warm layers, gloves and shoes with good grip.';
  if (w.temp >= 35) return 'Very hot. Travel early morning or evening, drink lots of water and wear sunscreen.';
  if (w.temp <= 8) return 'Cold weather. Pack heavy layers, a cap and gloves.';
  if (w.temp <= 18) return 'Cool and pleasant. A light jacket will do.';
  return 'Comfortable weather for sightseeing. Light cotton clothes and sunscreen are enough.';
}
