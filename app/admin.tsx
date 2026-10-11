import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Input, SectionTitle } from '../src/components/UI';
import { useAuth } from '../src/context/AuthContext';
import { useDestinations } from '../src/context/DestinationsContext';
import { useExtras } from '../src/context/ExtrasContext';
import { useTrips } from '../src/context/TripsContext';
import { INTERESTS } from '../src/data/destinations';
import { checkBackend } from '../src/services/health';
import { colors, spacing } from '../src/theme';
import { isAdmin } from '../src/utils/roles';
import { Destination } from '../src/types';

const PALETTE: [string, string][] = [
  ['#14B8C4', '#0E7C86'],
  ['#F2994A', '#D9622B'],
  ['#3FB67C', '#1F7A52'],
  ['#8E7CC3', '#5A4A9C'],
  ['#E56B8A', '#B23A5E'],
  ['#6C8EBF', '#3A5A8C'],
];

const num = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, ''));

export default function Admin() {
  const { user, ready } = useAuth();
  const { destinations, customIds, hiddenCount, addDestination, removeDestination, resetCatalog } = useDestinations();
  const { trips } = useTrips();
  const { reviews, favorites } = useExtras();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [emoji, setEmoji] = useState('📍');
  const [cost, setCost] = useState('3000');
  const [places, setPlaces] = useState('');
  const [desc, setDesc] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);

  if (!ready) return null; // wait for the saved login to load before deciding
  if (!isAdmin(user?.email, user?.role)) return <Redirect href="/(tabs)/profile" />;

  const toggleTag = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const add = async () => {
    const c = num(cost);
    const highlights = places.split(',').map((s) => s.trim()).filter(Boolean);
    if (name.trim().length < 2) return setError('Enter a destination name');
    if (!region.trim()) return setError('Enter the state or region');
    if (!c || c < 500) return setError('Enter a daily cost of at least ₹500');
    if (!highlights.length) return setError('Add at least one place, separated by commas');
    if (!tags.length) return setError('Select at least one tag');
    const la = lat ? num(lat) : 20.5937;
    const lo = lon ? num(lon) : 78.9629;
    if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return setError('Latitude or longitude is not valid');
    setError('');
    const d: Destination = {
      id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36),
      name: name.trim(),
      region: region.trim(),
      country: 'India',
      lat: la,
      lon: lo,
      emoji: emoji.trim() || '📍',
      colors: PALETTE[destinations.length % PALETTE.length],
      rating: 4,
      tags,
      bestSeason: 'Year-round',
      avgDailyCost: c,
      description: desc.trim() || `${name.trim()} is a great place to explore in ${region.trim()}.`,
      highlights,
      climate: 'Warm',
    };
    await addDestination(d);
    setName('');
    setRegion('');
    setPlaces('');
    setDesc('');
    setLat('');
    setLon('');
    setTags([]);
    setStatus(`Added ${d.name}. It now appears in Explore and the planner.`);
  };

  const confirm = (title: string, onYes: () => void) => {
    if (Platform.OS === 'web') return onYes();
    Alert.alert(title, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: onYes },
    ]);
  };

  const test = async () => {
    setChecking(true);
    const r = await checkBackend();
    setStatus(r.message);
    setChecking(false);
  };

  const stats = [
    ['Destinations', destinations.length],
    ['Trips', trips.length],
    ['Saved', trips.filter((t) => t.saved).length],
    ['Favourites', favorites.length],
    ['Reviews', reviews.length],
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(([label, value]) => (
          <Card key={String(label)} style={{ width: '31%', flexGrow: 1, alignItems: 'center', padding: spacing.md }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary }}>{value}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
          </Card>
        ))}
      </View>

      {status ? (
        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.chip }}>
          <Text style={{ color: colors.primaryDark, fontWeight: '600' }}>{status}</Text>
        </Card>
      ) : null}

      <SectionTitle title="Backend" />
      <Button title="Test backend connection" variant="outline" onPress={test} loading={checking} />

      <SectionTitle title="Add destination" />
      <Card>
        <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Hampi" />
        <Input label="State / region" value={region} onChangeText={setRegion} placeholder="e.g. Karnataka" />
        <Input label="Emoji" value={emoji} onChangeText={setEmoji} maxLength={4} />
        <Input label="Average cost per person per day (₹)" value={cost} onChangeText={setCost} keyboardType="number-pad" />
        <Input label="Top places (comma separated)" value={places} onChangeText={setPlaces} placeholder="Virupaksha Temple, Hemakuta Hill" />
        <Input label="Description (optional)" value={desc} onChangeText={setDesc} multiline />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input label="Latitude (optional)" value={lat} onChangeText={setLat} keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Longitude (optional)" value={lon} onChangeText={setLon} keyboardType="numbers-and-punctuation" />
          </View>
        </View>
        <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 6 }}>Tags</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {INTERESTS.map((t) => (
            <Chip key={t} label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
          ))}
        </View>
        {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}
        <Button title="Add destination" onPress={add} />
      </Card>

      <SectionTitle title="Manage catalog" />
      <Card>
        {destinations.map((d, i) => (
          <View
            key={d.id}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Text style={{ fontSize: 22, width: 36 }}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{d.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{customIds.includes(d.id) ? 'Custom' : 'Built-in'} · {d.region}</Text>
            </View>
            <Button
              title={customIds.includes(d.id) ? 'Delete' : 'Hide'}
              variant="ghost"
              onPress={() => confirm(`${customIds.includes(d.id) ? 'Delete' : 'Hide'} ${d.name}?`, () => removeDestination(d.id))}
              style={{ minHeight: 36, paddingVertical: 6, paddingHorizontal: 12 }}
            />
          </View>
        ))}
        {customIds.length || hiddenCount ? (
          <Button
            title="Reset catalog to default"
            variant="outline"
            onPress={() => confirm('Reset the catalog?', resetCatalog)}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Card>
    </ScrollView>
  );
}
