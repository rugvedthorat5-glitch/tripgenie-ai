import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Banner, Button, Card, Chip, Input, money } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useTrips } from '../../src/context/TripsContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { INTERESTS, getDestination } from '../../src/data/destinations';
import { generatePlan } from '../../src/services/planner';
import { colors, radius, shadowSoft, spacing } from '../../src/theme';

import { Preferences } from '../../src/types';

const STYLES: { id: Preferences['travelStyle']; label: string; icon: string }[] = [
  { id: 'Budget', label: 'Budget', icon: '🎒' },
  { id: 'Comfort', label: 'Comfort', icon: '✨' },
  { id: 'Luxury', label: 'Luxury', icon: '👑' },
];

const BUDGET_PRESETS = [
  { label: '₹15,000', value: '15000' },
  { label: '₹30,000', value: '30000' },
  { label: '₹50,000', value: '50000' },
  { label: '₹1,00,000', value: '100000' },
];

function Stepper({
  value,
  onChange,
  min = 1,
  max = 15,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        style={({ pressed }) => [
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: value <= min ? 0.35 : pressed ? 0.8 : 1,
          },
        ]}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <Text style={{ fontSize: 16, color: colors.text, fontWeight: '800' }}>−</Text>
      </Pressable>
      <Text style={{ fontSize: 16, fontWeight: '800', minWidth: 22, textAlign: 'center', color: colors.text }}>
        {value}
      </Text>
      <Pressable
        style={({ pressed }) => [
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.primarySoft,
            borderWidth: 1,
            borderColor: colors.primaryMid,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: value >= max ? 0.35 : pressed ? 0.8 : 1,
          },
        ]}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <Text style={{ fontSize: 16, color: colors.primaryDark, fontWeight: '800' }}>+</Text>
      </Pressable>
    </View>
  );
}



function daysBetween(start?: string, end?: string) {
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return diff >= 1 && diff <= 21 ? diff : null;
}

export default function Planner() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destinationId?: string }>();
  const { prefs } = useAuth();
  const { addTrip } = useTrips();
  const { destinations } = useDestinations();
  const { addNotification } = useExtras();

  const [startLocation, setStartLocation] = useState('Mumbai');
  const [destinationId, setDestinationId] = useState(params.destinationId ?? destinations[0]?.id ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [budgetText, setBudgetText] = useState('30000');
  const [style, setStyle] = useState<Preferences['travelStyle']>(prefs.travelStyle);
  const [interests, setInterests] = useState<string[]>(prefs.interests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceNote, setSourceNote] = useState('');

  useEffect(() => {
    if (params.destinationId) setDestinationId(params.destinationId);
  }, [params.destinationId]);

  const derivedDays = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  useEffect(() => {
    if (derivedDays) setDays(derivedDays);
  }, [derivedDays]);

  const toggleInterest = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const submit = async () => {
    if (!startLocation.trim()) return setError('Enter your starting location');
    if (!getDestination(destinationId) && !destinations.find((d) => d.id === destinationId)) {
      return setError('Pick a destination first');
    }
    const budget = parseInt(budgetText.replace(/[^0-9]/g, ''), 10);
    if (!budget || budget < 1000) return setError('Enter a budget of at least ₹1,000');
    setError('');
    setLoading(true);
    setSourceNote('');
    try {
      const { trip, source } = await generatePlan({
        destinationId,
        days,
        travelers,
        budget,
        style,
        interests,
        startLocation: startLocation.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      });
      const saved = await addTrip({ ...trip, saved: true });
      addNotification(
        'Itinerary ready',
        `Your ${saved.days}-day plan for ${saved.destinationName} is ready (${source === 'ai' ? 'Gemini AI' : 'TripGenie Planner'}).`
      );
      setSourceNote(
        source === 'ai'
          ? 'Generated with Gemini AI in the cloud.'
          : 'Generated with TripGenie intelligent planner.'
      );
      router.push(`/itinerary/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate a plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.bg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: spacing.sm, paddingHorizontal: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>
          Plan Your Next Adventure
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 2 }}>
          Crafted by Gemini AI · Custom activities, stays, routes & budgets
        </Text>
      </View>

      <Card style={{ padding: 12, gap: 10, marginBottom: spacing.sm }}>
        <Input
          label="Starting from"
          placeholder="e.g. Mumbai, Bangalore, Delhi…"
          leftIcon="navigate-outline"
          value={startLocation}
          onChangeText={setStartLocation}
        />

        <View>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 6, fontSize: 12.5 }}>
            Select Destination (50 Verified spots)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 2 }}>
            {destinations.map((d) => (
              <Chip
                key={d.id}
                label={`${d.emoji} ${d.name}`}
                selected={destinationId === d.id}
                onPress={() => setDestinationId(d.id)}
              />
            ))}
          </ScrollView>
        </View>
      </Card>

      <Card style={{ padding: 12, gap: 10, marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontWeight: '700', color: colors.text, fontSize: 13 }}>Duration</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Trip length in days</Text>
          </View>
          <Stepper value={days} onChange={setDays} max={14} />
        </View>

        <View style={{ height: 1, backgroundColor: colors.borderLight }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontWeight: '700', color: colors.text, fontSize: 13 }}>Travellers</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Total group size</Text>
          </View>
          <Stepper value={travelers} onChange={setTravelers} max={10} />
        </View>
      </Card>

      <Card style={{ padding: 12, gap: 8, marginBottom: spacing.sm }}>
        <Input
          label="Estimated Budget (₹)"
          keyboardType="number-pad"
          value={budgetText}
          onChangeText={setBudgetText}
          placeholder="30000"
          leftIcon="cash-outline"
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: -4 }}>
          {BUDGET_PRESETS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setBudgetText(p.value)}
              style={({ pressed }) => [
                {
                  backgroundColor: budgetText === p.value ? colors.primarySoft : colors.bg,
                  borderWidth: 1,
                  borderColor: budgetText === p.value ? colors.primary : colors.border,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: radius.pill,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: budgetText === p.value ? colors.primaryDark : colors.textSecondary,
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {budgetText ? (
          <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>
            Approx. {money(parseInt(budgetText.replace(/[^0-9]/g, '') || '0', 10) / (days * travelers))} / person / day
          </Text>
        ) : null}
      </Card>

      <Card style={{ padding: 12, gap: 10, marginBottom: spacing.sm }}>
        <Text style={{ fontWeight: '700', color: colors.text, fontSize: 13 }}>Travel Style</Text>
        
        {/* Sleek Segmented Pill Selector */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.bg,
            borderRadius: radius.pill,
            padding: 3,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {STYLES.map((s) => {
            const isSelected = style === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setStyle(s.id)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 7,
                    borderRadius: radius.pill,
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: colors.borderLight,
                    opacity: pressed ? 0.85 : 1,
                  },
                  isSelected && shadowSoft,
                ]}
              >
                <Text style={{ fontSize: 13, marginRight: 4 }}>{s.icon}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? colors.primaryDark : colors.muted,
                  }}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ fontWeight: '700', color: colors.text, fontSize: 13, marginTop: 2 }}>
          Interests & Vibes
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {INTERESTS.map((i) => (
            <Chip key={i} label={i} selected={interests.includes(i)} onPress={() => toggleInterest(i)} />
          ))}
        </View>
      </Card>

      {error ? <Text style={{ color: colors.danger, marginVertical: spacing.xs, fontWeight: '600', fontSize: 12.5 }}>{error}</Text> : null}
      {sourceNote ? <Text style={{ color: colors.muted, marginTop: spacing.xs, fontSize: 11.5 }}>{sourceNote}</Text> : null}

      <Button
        title={loading ? 'Generating Itinerary…' : 'Generate Itinerary ✨'}
        icon="sparkles"
        onPress={submit}
        loading={loading}
        size="md"
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );


}
