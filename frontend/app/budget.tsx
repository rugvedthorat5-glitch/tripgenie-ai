import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Banner, Card, Chip, Input, money, SectionTitle } from '../src/components/UI';
import { useDestinations } from '../src/context/DestinationsContext';
import { api } from '../src/services/api';
import { estimateBudget } from '../src/services/planner';
import { colors, spacing } from '../src/theme';
import { Preferences } from '../src/types';

const STYLES: Preferences['travelStyle'][] = ['Budget', 'Comfort', 'Luxury'];

const SPLITS = [
  { key: 'stay', label: 'Stay', pct: 38, color: '#0E7C86' },
  { key: 'food', label: 'Food', pct: 24, color: '#FF7A59' },
  { key: 'transport', label: 'Transport', pct: 18, color: '#6C8EBF' },
  { key: 'activities', label: 'Activities', pct: 14, color: '#E0A526' },
  { key: 'misc', label: 'Miscellaneous', pct: 6, color: '#8E7CC3' },
];

export default function Budget() {
  const { destinations } = useDestinations();
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? '');
  const [userBudgetText, setUserBudgetText] = useState('40000');
  const [days, setDays] = useState(5);
  const [people, setPeople] = useState(2);
  const [style, setStyle] = useState<Preferences['travelStyle']>('Comfort');

  const dest = destinations.find((d) => d.id === destinationId) ?? destinations[0];
  const userBudget = parseInt(userBudgetText.replace(/[^0-9]/g, '') || '0', 10);

  const localEstimate = useMemo(() => {
    if (!dest) return null;
    return estimateBudget({ dest, days, travelers: people, style, userBudget });
  }, [dest, days, people, style, userBudget]);

  const [serverEstimate, setServerEstimate] = useState<typeof localEstimate>(null);

  useEffect(() => {
    if (!destinationId) return;
    let cancelled = false;
    api
      .post('/budget/estimate', {
        destinationId,
        days,
        travelers: people,
        style,
        userBudget: userBudget || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        const d = res.data;
        setServerEstimate({
          breakdown: d.breakdown,
          total: d.total,
          perPerson: d.perPerson,
          tips: d.tips || [],
        });
      })
      .catch(() => {
        if (!cancelled) setServerEstimate(null);
      });
    return () => {
      cancelled = true;
    };
  }, [destinationId, days, people, style, userBudget]);

  const estimate = serverEstimate || localEstimate;
  const total = estimate?.total ?? 0;
  const perPerson = estimate?.perPerson ?? 0;
  const perPersonDay = days && people ? total / (days * people) : 0;
  const over = userBudget > 0 && total > userBudget;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
      <Banner
        title="Plan with a clear budget"
        text="Friendly estimates from destination, days, travellers and style. All prices are labelled estimates — not final bookings."
        tone="info"
      />
      {serverEstimate ? (
        <Text style={{ color: colors.success, fontSize: 12, marginBottom: spacing.sm, fontWeight: '700' }}>Synced with backend estimate</Text>
      ) : null}

      <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 6 }}>Destination</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {destinations.map((d) => (
          <Chip key={d.id} label={`${d.emoji} ${d.name}`} selected={destinationId === d.id} onPress={() => setDestinationId(d.id)} />
        ))}
      </ScrollView>

      <Input label="Your trip budget (₹)" keyboardType="number-pad" value={userBudgetText} onChangeText={setUserBudgetText} />

      <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 6 }}>Days</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[2, 3, 5, 7, 10, 14].map((d) => (
          <Chip key={d} label={`${d}`} selected={days === d} onPress={() => setDays(d)} />
        ))}
      </View>
      <Text style={{ fontWeight: '700', color: colors.text, marginVertical: 6 }}>Travellers</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 6, 8].map((p) => (
          <Chip key={p} label={`${p}`} selected={people === p} onPress={() => setPeople(p)} />
        ))}
      </View>
      <Text style={{ fontWeight: '700', color: colors.text, marginVertical: 6 }}>Travel style</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {STYLES.map((s) => (
          <Chip key={s} label={s} selected={style === s} onPress={() => setStyle(s)} />
        ))}
      </View>

      <Card style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.muted }}>Estimated total</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>{money(total)}</Text>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {money(perPerson)} / person · {money(perPersonDay)} / person / day
        </Text>
        <Text style={{ marginTop: 8, fontWeight: '700', color: over ? colors.danger : colors.success }}>
          {over
            ? `${money(total - userBudget)} over your ${money(userBudget)} budget`
            : `Within budget · ${money(Math.max(0, userBudget - total))} buffer`}
        </Text>
      </Card>

      <SectionTitle title="Suggested split (estimates)" />
      <Card>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: spacing.lg }}>
          {SPLITS.map((s) => (
            <View key={s.key} style={{ flex: s.pct, backgroundColor: s.color }} />
          ))}
        </View>
        {estimate
          ? (Object.keys(estimate.breakdown) as (keyof typeof estimate.breakdown)[]).map((k) => {
              const meta = SPLITS.find((s) => s.key === k);
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: meta?.color || colors.primary, marginRight: 10 }} />
                  <Text style={{ flex: 1, color: colors.text }}>
                    {meta?.label || k} ({meta?.pct ?? 0}%)
                  </Text>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{money(estimate.breakdown[k])}</Text>
                </View>
              );
            })
          : null}
      </Card>

      {estimate?.tips?.length ? (
        <>
          <SectionTitle title="Suggestions" />
          <Card>
            {estimate.tips.map((t, i) => (
              <Text key={i} style={{ color: colors.text, marginBottom: 6, lineHeight: 20 }}>
                • {t}
              </Text>
            ))}
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}
