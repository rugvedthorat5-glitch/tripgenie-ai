import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Input, money } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useTrips } from '../../src/context/TripsContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { INTERESTS } from '../../src/data/destinations';
import { getDestination } from '../../src/data/destinations';
import { generatePlan } from '../../src/services/planner';
import { colors, spacing } from '../../src/theme';
import { Preferences } from '../../src/types';

const STYLES: Preferences['travelStyle'][] = ['Budget', 'Comfort', 'Luxury'];

function Stepper({ value, onChange, min = 1, max = 15 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const btn = { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chip, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Pressable style={btn} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={{ fontSize: 22, color: colors.primaryDark, fontWeight: '800' }}>−</Text>
      </Pressable>
      <Text style={{ fontSize: 20, fontWeight: '800', minWidth: 28, textAlign: 'center', color: colors.text }}>{value}</Text>
      <Pressable style={btn} onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={{ fontSize: 22, color: colors.primaryDark, fontWeight: '800' }}>+</Text>
      </Pressable>
    </View>
  );
}

export default function Planner() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destinationId?: string }>();
  const { prefs } = useAuth();
  const { addTrip } = useTrips();
  const { destinations } = useDestinations();
  const { addNotification } = useExtras();

  const [destinationId, setDestinationId] = useState(params.destinationId ?? destinations[0]?.id ?? '');
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [budgetText, setBudgetText] = useState('30000');
  const [style, setStyle] = useState<Preferences['travelStyle']>(prefs.travelStyle);
  const [interests, setInterests] = useState<string[]>(prefs.interests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.destinationId) setDestinationId(params.destinationId);
  }, [params.destinationId]);

  const toggleInterest = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const submit = async () => {
    if (!getDestination(destinationId)) return setError('Pick a destination first');
    const budget = parseInt(budgetText.replace(/[^0-9]/g, ''), 10);
    if (!budget || budget < 1000) return setError('Enter a budget of at least ₹1,000');
    setError('');
    setLoading(true);
    try {
      const { trip } = await generatePlan({ destinationId, days, travelers, budget, style, interests });
      await addTrip(trip);
      addNotification('Itinerary ready ✨', `Your ${trip.days}-day plan for ${trip.destinationName} is ready to view.`);
      router.push(`/itinerary/${trip.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate a plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>Destination</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {destinations.map((d) => (
          <Chip key={d.id} label={`${d.emoji} ${d.name}`} selected={destinationId === d.id} onPress={() => setDestinationId(d.id)} />
        ))}
      </ScrollView>

      <Card style={{ gap: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Days</Text>
          <Stepper value={days} onChange={setDays} max={14} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Travellers</Text>
          <Stepper value={travelers} onChange={setTravelers} max={10} />
        </View>
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Input
          label="Total budget (₹)"
          keyboardType="number-pad"
          value={budgetText}
          onChangeText={setBudgetText}
          placeholder="30000"
        />
        {budgetText ? (
          <Text style={{ color: colors.muted, marginTop: -6, marginBottom: spacing.md }}>
            About {money(parseInt(budgetText.replace(/[^0-9]/g, '') || '0', 10) / (days * travelers))} per person per day
          </Text>
        ) : null}
      </View>

      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>Travel style</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {STYLES.map((s) => (
          <Chip key={s} label={s} selected={style === s} onPress={() => setStyle(s)} />
        ))}
      </View>

      <Text style={{ fontWeight: '800', color: colors.text, marginVertical: 8 }}>Interests</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {INTERESTS.map((i) => (
          <Chip key={i} label={i} selected={interests.includes(i)} onPress={() => toggleInterest(i)} />
        ))}
      </View>

      {error ? <Text style={{ color: colors.danger, marginVertical: spacing.sm }}>{error}</Text> : null}
      <Button title={loading ? 'AI is planning your trip…' : '✨ Generate itinerary'} onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
}
