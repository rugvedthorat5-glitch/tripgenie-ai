import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Banner, Button, Card, Empty, Input, money, SectionTitle } from '../../src/components/UI';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { colors, spacing } from '../../src/theme';
import { downloadItineraryPdf } from '../../src/utils/pdf';

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
  const { getTrip, toggleSaved, removeTrip, updateTrip } = useTrips();
  const { destinations } = useDestinations();
  const { checks, toggleCheck, addNotification } = useExtras();
  const trip = getTrip(String(id));
  const [editing, setEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [budgetDraft, setBudgetDraft] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  if (!trip) {
    return (
      <Empty
        emoji="🧳"
        title="Trip not found"
        text="It may have been deleted."
        actionLabel="My Trips"
        onAction={() => router.replace('/(tabs)/trips')}
      />
    );
  }

  const total = Object.values(trip.breakdown).reduce((a, b) => a + b, 0);
  const diff = trip.budget - total;
  const checked = checks[trip.id] ?? trip.packingChecks ?? [];
  const dest = destinations.find((d) => d.id === trip.destinationId);
  const stopRouteUrl = (() => {
    const stops = dest?.highlights?.slice(0, 4) || [];
    if (!stops.length) return trip.routeUrl;
    const origin = trip.startLocation || stops[0];
    const destination = `${dest?.lat},${dest?.lon}`;
    const waypoints = stops
      .slice(0, 3)
      .map((s) => encodeURIComponent(`${s}, ${dest?.name || ''}, India`))
      .join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
      destination
    )}&waypoints=${waypoints}`;
  })();

  const share = async () => {
    const text =
      `${trip.summary}\n\n` +
      trip.itinerary.map((d) => `Day ${d.day}: ${d.title}\n` + d.items.map((i) => `  ${i.time} ${i.title}`).join('\n')).join('\n\n') +
      (stopRouteUrl ? `\n\nRoute: ${stopRouteUrl}` : '');
    try {
      await Share.share({ message: text });
    } catch {
      // cancelled
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

  const startEdit = () => {
    setSummaryDraft(trip.summary);
    setBudgetDraft(String(trip.budget));
    setEditing(true);
  };

  const saveEdit = async () => {
    const budget = parseInt(budgetDraft.replace(/[^0-9]/g, ''), 10) || trip.budget;
    await updateTrip(trip.id, { summary: summaryDraft.trim() || trip.summary, budget });
    setEditing(false);
    addNotification('Trip updated', `${trip.destinationName} itinerary was edited.`);
  };

  const pdf = async () => {
    setPdfBusy(true);
    try {
      await downloadItineraryPdf(trip);
    } catch {
      Alert.alert('Could not export PDF', 'Try Share instead.');
    } finally {
      setPdfBusy(false);
    }
  };

  const open = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} style={{ backgroundColor: colors.bg }}>
      <LinearGradient colors={trip.colors} style={{ padding: spacing.xl, alignItems: 'center', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)', top: -40, right: -30 }} />
        <Text style={{ fontSize: 56 }}>{trip.emoji}</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>{trip.destinationName}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.94)', textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 8 }}>{trip.summary}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{trip.days} days</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{trip.travelers} travellers</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{trip.style}</Text>
          </View>
        </View>
        {trip.startLocation ? (
          <Text style={{ color: 'rgba(255,255,255,0.88)', marginTop: 12 }}>From {trip.startLocation}</Text>
        ) : null}
        {trip.startDate ? (
          <Text style={{ color: 'rgba(255,255,255,0.88)', marginTop: 2 }}>
            {trip.startDate}
            {trip.endDate ? ` → ${trip.endDate}` : ''}
          </Text>
        ) : null}
        {trip.source ? (
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 10, fontSize: 12, fontWeight: '600' }}>
            {trip.source === 'ai' ? '✦ Crafted with Gemini AI' : trip.source === 'demo' ? '✦ Demo planner' : '✦ Smart fallback planner'}
          </Text>
        ) : null}
      </LinearGradient>

      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button
            title={trip.saved ? '★ Saved' : '☆ Save trip'}
            variant={trip.saved ? 'primary' : 'outline'}
            onPress={() => {
              if (!trip.saved) addNotification('Trip saved ★', `${trip.destinationName} is saved in My Trips.`);
              toggleSaved(trip.id);
            }}
            style={{ flex: 1, minWidth: '45%' }}
          />
          <Button title="Share" variant="outline" onPress={share} style={{ flex: 1, minWidth: '45%' }} />
          <Button title={editing ? 'Cancel' : 'Edit'} variant="outline" onPress={() => (editing ? setEditing(false) : startEdit())} style={{ flex: 1, minWidth: '45%' }} />
          <Button title={pdfBusy ? 'Exporting…' : 'PDF'} variant="outline" onPress={pdf} loading={pdfBusy} style={{ flex: 1, minWidth: '45%' }} />
        </View>

        {editing ? (
          <Card style={{ marginTop: spacing.md }}>
            <Input label="Summary" value={summaryDraft} onChangeText={setSummaryDraft} multiline />
            <Input label="Budget (₹)" value={budgetDraft} onChangeText={setBudgetDraft} keyboardType="number-pad" />
            <Button title="Save changes" onPress={saveEdit} />
          </Card>
        ) : null}

        <SectionTitle title="Day-by-day plan" />
        {trip.itinerary.map((day) => (
          <Card key={day.day} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: colors.primaryDark, fontWeight: '800', fontSize: 11 }}>DAY {day.day}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6, letterSpacing: -0.2 }}>{day.title}</Text>
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
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>All prices are estimates</Text>
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
          <Text style={{ marginTop: 4, color: colors.muted }}>
            ≈ {money(total / Math.max(1, trip.travelers))} per person
          </Text>
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
            const done = checked.includes(item);
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
            {checked.length} of {PACKING.length} packed
          </Text>
        </Card>

        <SectionTitle title="Trip status" />
        <Card>
          <Text style={{ color: colors.muted, marginBottom: 10 }}>
            Current: <Text style={{ fontWeight: '800', color: colors.text }}>{trip.status === 'past' ? 'Past trip' : 'Upcoming'}</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title="Mark upcoming"
              variant={trip.status !== 'past' ? 'primary' : 'outline'}
              style={{ flex: 1 }}
              onPress={() => updateTrip(trip.id, { status: 'upcoming' })}
            />
            <Button
              title="Mark past"
              variant={trip.status === 'past' ? 'primary' : 'outline'}
              style={{ flex: 1 }}
              onPress={() => {
                updateTrip(trip.id, { status: 'past' });
                addNotification('Trip completed', `${trip.destinationName} moved to past trips.`);
              }}
            />
          </View>
        </Card>

        <SectionTitle title="Maps & route" />
        <Banner title="Route between stops" text="Opens Google Maps with your start city and destination highlights as waypoints." tone="info" />
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button title="Weather" icon="partly-sunny-outline" variant="outline" style={{ flex: 1, minWidth: '45%' }} onPress={() => router.push({ pathname: '/weather', params: { destinationId: trip.destinationId } })} />
          <Button title="Map" icon="map-outline" variant="outline" style={{ flex: 1, minWidth: '45%' }} onPress={() => router.push({ pathname: '/map', params: { destinationId: trip.destinationId } })} />
          {stopRouteUrl ? (
            <Button title="Open travel route (multi-stop)" icon="navigate" onPress={() => open(stopRouteUrl)} style={{ flex: 1, minWidth: '100%' }} />
          ) : null}
          {trip.mapUrl ? (
            <Button title="Open destination map" variant="soft" icon="location-outline" onPress={() => open(trip.mapUrl)} style={{ flex: 1, minWidth: '100%' }} />
          ) : null}
        </View>

        <Button title="Delete trip" variant="ghost" onPress={del} style={{ marginTop: spacing.lg }} />
      </View>
    </ScrollView>
  );
}
