import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Button, Card, Empty, money, SectionTitle } from '../../src/components/UI';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { colors, spacing } from '../../src/theme';

const PACKING = [
  'ID proof and tickets',
  'Phone, charger and power bank',
  'Medicines and first-aid kit',
  'Clothes suited to the weather',
  'Comfortable shoes',
  'Cash and cards',
  'Water bottle',
  'Toiletries',
];

const LABELS: Record<string, string> = {
  stay: 'Stay',
  food: 'Food',
  transport: 'Transport',
  activities: 'Activities',
  misc: 'Miscellaneous',
};

export default function Itinerary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTrip, toggleSaved, removeTrip } = useTrips();
  const { checks, toggleCheck, addNotification } = useExtras();
  const trip = getTrip(String(id));

  if (!trip) return <Empty emoji="🧳" title="Trip not found" text="It may have been deleted." />;

  const total = Object.values(trip.breakdown).reduce((a, b) => a + b, 0);
  const diff = trip.budget - total;

  const share = async () => {
    const text =
      `${trip.summary}\n\n` +
      trip.itinerary.map((d) => `Day ${d.day}: ${d.title}\n` + d.items.map((i) => `  ${i.time} ${i.title}`).join('\n')).join('\n\n');
    try {
      await Share.share({ message: text });
    } catch {
      // user cancelled
    }
  };

  const del = () => {
    const run = async () => {
      await removeTrip(trip.id);
      router.replace('/(tabs)/trips');
    };
    if (Platform.OS === 'web') {
      run();
      return;
    }
    Alert.alert('Delete trip?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <LinearGradient colors={trip.colors} style={{ padding: spacing.xl, alignItems: 'center' }}>
        <Text style={{ fontSize: 54 }}>{trip.emoji}</Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{trip.destinationName}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.92)', textAlign: 'center', marginTop: 4 }}>{trip.summary}</Text>
      </LinearGradient>

      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title={trip.saved ? '★ Saved' : '☆ Save trip'} variant={trip.saved ? 'primary' : 'outline'} onPress={() => {
              if (!trip.saved) addNotification('Trip saved ★', `${trip.destinationName} is saved in My Trips.`);
              toggleSaved(trip.id);
            }} style={{ flex: 1 }} />
          <Button title="Share" variant="outline" onPress={share} style={{ flex: 1 }} />
        </View>

        <SectionTitle title="Day-by-day plan" />
        {trip.itinerary.map((day) => (
          <Card key={day.day} style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>DAY {day.day}</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 }}>{day.title}</Text>
            {day.items.map((it, i) => (
              <View key={i} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ width: 52, color: colors.muted, fontWeight: '700' }}>{it.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{it.title}</Text>
                  <Text style={{ color: colors.muted, marginTop: 2 }}>{it.detail}</Text>
                </View>
                {it.cost ? <Text style={{ color: colors.accent, fontWeight: '700' }}>{money(it.cost)}</Text> : null}
              </View>
            ))}
          </Card>
        ))}

        <SectionTitle title="Estimated budget" />
        <Card>
          {Object.entries(trip.breakdown).map(([k, v]) => (
            <View key={k} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text }}>{LABELS[k] ?? k}</Text>
                <Text style={{ fontWeight: '700', color: colors.text }}>{money(v)}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.chip, marginTop: 4 }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: `${Math.round((v / total) * 100)}%` }} />
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>Total</Text>
            <Text style={{ fontWeight: '800', color: colors.text }}>{money(total)}</Text>
          </View>
          <Text style={{ marginTop: 6, color: diff >= 0 ? colors.success : colors.danger, fontWeight: '600' }}>
            {diff >= 0 ? `Within budget, ${money(diff)} left` : `${money(-diff)} over your ${money(trip.budget)} budget`}
          </Text>
        </Card>

        <SectionTitle title="Travel tips" />
        <Card>
          {trip.tips.map((t, i) => (
            <Text key={i} style={{ color: colors.text, marginBottom: 6, lineHeight: 20 }}>
              • {t}
            </Text>
          ))}
        </Card>

        <SectionTitle title="Packing checklist" />
        <Card>
          {PACKING.map((item, i) => {
            const done = (checks[trip.id] ?? []).includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggleCheck(trip.id, item)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
              >
                <Text style={{ fontSize: 20, width: 32, color: done ? colors.success : colors.muted }}>{done ? '☑' : '☐'}</Text>
                <Text style={{ color: done ? colors.muted : colors.text, textDecorationLine: done ? 'line-through' : 'none' }}>{item}</Text>
              </Pressable>
            );
          })}
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
            {(checks[trip.id] ?? []).length} of {PACKING.length} packed
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
          <Button title="☀️ Weather" variant="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/weather', params: { destinationId: trip.destinationId } })} />
          <Button title="🗺️ Map" variant="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/map', params: { destinationId: trip.destinationId } })} />
        </View>

        <Button title="Delete trip" variant="ghost" onPress={del} style={{ marginTop: spacing.lg }} />
      </View>
    </ScrollView>
  );
}
