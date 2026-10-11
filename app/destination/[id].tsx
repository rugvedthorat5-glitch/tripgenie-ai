import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Empty, Input, money, SectionTitle } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { colors, spacing } from '../../src/theme';

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { destinations } = useDestinations();
  const { favorites, toggleFavorite, reviewsFor, addReview } = useExtras();
  const dest = destinations.find((d) => d.id === String(id));

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  if (!dest) return <Empty emoji="🗺️" title="Destination not found" text="Go back and pick another place." />;

  const fav = favorites.includes(dest.id);
  const reviews = reviewsFor(dest.id);
  const avg = reviews.length ? (dest.rating * 5 + reviews.reduce((a, r) => a + r.rating, 0)) / (5 + reviews.length) : dest.rating;

  const submit = () => {
    if (text.trim().length < 3) return setErr('Write a short review first');
    setErr('');
    addReview(dest.id, user?.name ?? 'Traveller', rating, text.trim());
    setText('');
    setRating(5);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: dest.name,
          headerRight: () => (
            <Pressable onPress={() => toggleFavorite(dest.id)} hitSlop={10}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? colors.accent : colors.primaryDark} />
            </Pressable>
          ),
        }}
      />
      <LinearGradient colors={dest.colors} style={{ height: 190, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 76 }}>{dest.emoji}</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{dest.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
          {dest.region}, {dest.country} · ★ {avg.toFixed(1)}
          {reviews.length ? ` (${reviews.length} review${reviews.length > 1 ? 's' : ''})` : ''}
        </Text>
      </LinearGradient>

      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {dest.tags.map((t) => (
            <Chip key={t} label={t} selected />
          ))}
        </View>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, marginTop: spacing.sm }}>{dest.description}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.lg }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Best season</Text>
            <Text style={{ fontWeight: '800', color: colors.text, marginTop: 4 }}>{dest.bestSeason}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Avg. per day</Text>
            <Text style={{ fontWeight: '800', color: colors.text, marginTop: 4 }}>{money(dest.avgDailyCost)}</Text>
          </Card>
        </View>

        <SectionTitle title="Top highlights" />
        <Card>
          {dest.highlights.map((h, i) => (
            <View key={h} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Text style={{ color: colors.primary, fontWeight: '800', width: 26 }}>{i + 1}.</Text>
              <Text style={{ color: colors.text, flex: 1 }}>{h}</Text>
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
          <Button title="☀️ Weather" variant="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/weather', params: { destinationId: dest.id } })} />
          <Button title="🗺️ Map" variant="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/map', params: { destinationId: dest.id } })} />
        </View>

        <View style={{ marginTop: spacing.md, gap: 10 }}>
          <Button title={`Plan a trip to ${dest.name}`} onPress={() => router.push({ pathname: '/(tabs)/planner', params: { destinationId: dest.id } })} />
          <Button title="Ask the AI assistant" variant="outline" onPress={() => router.push('/chat')} />
        </View>

        <SectionTitle title={`Reviews (${reviews.length})`} />
        <Card>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 6 }}>Rate this place</Text>
          <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                <Text style={{ fontSize: 30, color: n <= rating ? '#F5A524' : colors.border }}>★</Text>
              </Pressable>
            ))}
          </View>
          <Input placeholder="Share your experience…" value={text} onChangeText={setText} multiline error={err} />
          <Button title="Post review" onPress={submit} />
        </Card>
        {reviews.map((r) => (
          <Card key={r.id} style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{r.author}</Text>
              <Text style={{ color: '#F5A524', fontWeight: '800' }}>{'★'.repeat(r.rating)}</Text>
            </View>
            <Text style={{ color: colors.text, marginTop: 4, lineHeight: 20 }}>{r.text}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
              {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
