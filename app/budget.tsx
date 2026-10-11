import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Chip, Input, money, SectionTitle } from '../src/components/UI';
import { colors, spacing } from '../src/theme';

const SPLITS = [
  { key: 'stay', label: 'Stay', pct: 38, color: '#0E7C86' },
  { key: 'food', label: 'Food', pct: 24, color: '#FF7A59' },
  { key: 'transport', label: 'Transport', pct: 18, color: '#6C8EBF' },
  { key: 'activities', label: 'Activities', pct: 14, color: '#E0A526' },
  { key: 'misc', label: 'Miscellaneous', pct: 6, color: '#8E7CC3' },
];

export default function Budget() {
  const [totalText, setTotalText] = useState('40000');
  const [days, setDays] = useState(5);
  const [people, setPeople] = useState(2);

  const total = parseInt(totalText.replace(/[^0-9]/g, '') || '0', 10);
  const perPersonDay = useMemo(() => (days && people ? total / (days * people) : 0), [total, days, people]);
  const level = perPersonDay < 2500 ? 'Backpacker' : perPersonDay < 5000 ? 'Comfortable' : 'Premium';

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
      <Input label="Total trip budget (₹)" keyboardType="number-pad" value={totalText} onChangeText={setTotalText} />

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

      <Card style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.muted }}>Per person, per day</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>{money(perPersonDay)}</Text>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{level} budget</Text>
      </Card>

      <SectionTitle title="Suggested split" />
      <Card>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: spacing.lg }}>
          {SPLITS.map((s) => (
            <View key={s.key} style={{ flex: s.pct, backgroundColor: s.color }} />
          ))}
        </View>
        {SPLITS.map((s) => (
          <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: s.color, marginRight: 10 }} />
            <Text style={{ flex: 1, color: colors.text }}>
              {s.label} ({s.pct}%)
            </Text>
            <Text style={{ fontWeight: '700', color: colors.text }}>{money((total * s.pct) / 100)}</Text>
          </View>
        ))}
      </Card>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing.md }}>
        Percentages are a general guideline. Adjust for long train journeys, flights or luxury stays.
      </Text>
    </ScrollView>
  );
}
