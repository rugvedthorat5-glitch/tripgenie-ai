const config = require('../config');
const { buildPlan, localChatReply, mapLinks } = require('./fallbackPlanner');

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGemini(prompt, systemInstruction, attempt = 1) {
  if (!config.geminiApiKey) {
    const err = new Error('GEMINI_API_KEY not configured');
    err.code = 'NO_KEY';
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;
  const body = {
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    // Retry once on temporary overload / rate limits
    if ((res.status === 503 || res.status === 429) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      return callGemini(prompt, systemInstruction, attempt + 1);
    }
    const err = new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
    err.code = 'GEMINI_HTTP';
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return text;
}

async function generateAiPlan(req, dest) {
  const system = `You are TripGenie AI, an expert India travel planner. Reply with ONLY valid JSON matching this shape:
{
  "summary": string,
  "itinerary": [{"day": number, "title": string, "items": [{"time": "HH:MM", "title": string, "detail": string, "cost": number}]}],
  "breakdown": {"stay": number, "food": number, "transport": number, "activities": number, "misc": number},
  "tips": [string]
}
Costs are INR estimates for the whole group. Keep days = requested days. Be practical for Indian travel.`;

  const prompt = `Plan a trip:
Start: ${req.startLocation || 'India'}
Destination: ${dest.name} (${dest.region}), India
Days: ${req.days}
Start date: ${req.startDate || 'flexible'}
End date: ${req.endDate || 'flexible'}
Travellers: ${req.travelers}
Budget (INR total): ${req.budget}
Style: ${req.style}
Interests: ${(req.interests || []).join(', ') || 'general'}
Highlights to include where possible: ${(dest.highlights || []).join(', ')}
Avg daily cost hint: ₹${dest.avgDailyCost}/person
Best season: ${dest.bestSeason}`;

  try {
    const text = await callGemini(prompt, system);
    const parsed = extractJson(text);
    if (!parsed?.itinerary?.length) throw new Error('Invalid Gemini itinerary');

    const fallback = buildPlan(req, [dest]);
    const { mapUrl, routeUrl } = mapLinks(dest, req.startLocation);

    return {
      ...fallback,
      summary: parsed.summary || fallback.summary,
      itinerary: parsed.itinerary,
      breakdown: {
        stay: Number(parsed.breakdown?.stay) || fallback.breakdown.stay,
        food: Number(parsed.breakdown?.food) || fallback.breakdown.food,
        transport: Number(parsed.breakdown?.transport) || fallback.breakdown.transport,
        activities: Number(parsed.breakdown?.activities) || fallback.breakdown.activities,
        misc: Number(parsed.breakdown?.misc) || fallback.breakdown.misc,
      },
      tips: Array.isArray(parsed.tips) && parsed.tips.length ? parsed.tips : fallback.tips,
      mapUrl,
      routeUrl,
      source: 'ai',
    };
  } catch (err) {
    console.warn('Gemini plan fallback:', err.message);
    return { ...buildPlan(req, [dest]), source: 'fallback' };
  }
}

async function generateAiChat({ message, history = [], prefs, tripContext }) {
  const system = `You are Atlas, the friendly TripGenie AI travel assistant for Indian tourism.
Give concise, practical answers about destinations, sightseeing, routes, budgets, stays and activities.
Use INR for money. If user preferences or trip context are provided, personalise briefly.
Format the reply with light Markdown only: **bold** for place names, numbered or bulleted lists, short paragraphs. No headings or code fences.
Reply with JSON: {"reply": string}`;

  const hist = (history || [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'User' : 'Atlas'}: ${m.text || m.message || ''}`)
    .join('\n');

  const prompt = `Preferences: ${JSON.stringify(prefs || {})}
Trip context: ${JSON.stringify(tripContext || {})}
History:
${hist}

User: ${message}`;

  try {
    const text = await callGemini(prompt, system);
    const parsed = extractJson(text);
    const reply = parsed?.reply || text;
    if (typeof reply === 'string' && reply.trim()) return reply.trim();
    throw new Error('Empty chat');
  } catch (err) {
    console.warn('Gemini chat fallback:', err.message);
    return localChatReply(message);
  }
}

module.exports = { generateAiPlan, generateAiChat };
