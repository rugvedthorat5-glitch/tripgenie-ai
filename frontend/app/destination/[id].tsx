import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, Card, Chip, Empty, Input, money, SectionTitle } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { Review, useExtras } from '../../src/context/ExtrasContext';
import { api } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { destinations } = useDestinations();
  const { favorites, toggleFavorite, reviewsFor, addReview, addNotification } = useExtras();
  const dest = destinations.find((d) => d.id === String(id));

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [posted, setPosted] = useState(false);
  const [remoteReviews, setRemoteReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/reviews/${id}`)
      .then((res) => {
        const list = (res.data?.reviews || []) as Review[];
        setRemoteReviews(list);
      })
      .catch(() => setRemoteReviews([]));
  }, [id, posted]);

  if (!dest) {
    return (
      <Empty
        emoji="🗺️"
        title="Destination not found"
        text="It may have been removed. Browse Explore to pick another place."
        actionLabel="Go to Explore"
        onAction={() => router.replace('/(tabs)/explore')}
      />
    );
  }

  const fav = favorites.includes(dest.id);
  const localReviews = reviewsFor(dest.id);
  const reviews = (() => {
    const map = new Map<string, Review>();
    [...remoteReviews, ...localReviews].forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  })();
  const avg = reviews.length
    ? (dest.rating * 5 + reviews.reduce((a, r) => a + r.rating, 0)) / (5 + reviews.length)
    : dest.rating;

  const submit = () => {
    if (text.trim().length < 3) return setErr('Write a short review first');
    setErr('');
    addReview(dest.id, user?.name ?? 'Traveller', rating, text.trim());
    setText('');
    setRating(5);
    setPosted(true);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled" style={{ backgroundColor: colors.bg }}>
      <Stack.Screen
        options={{
          title: dest.name,
          headerRight: () => (
            <Pressable
              onPress={() => {
                toggleFavorite(dest.id);
                if (!fav) addNotification('Added to wishlist', `${dest.name} was saved to your wishlist.`);
              }}
              hitSlop={10}
              style={{ paddingHorizontal: 4 }}
            >
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? colors.accent : colors.primaryDark} />
            </Pressable>
          ),
        }}
      />
      <View style={{ height: 280, position: 'relative', overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.xl }}>
        {/* Base vibrant gradient always visible */}
        <LinearGradient
          colors={dest.colors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {dest.imageUrl ? (
          <>
            <Image
              source={{ uri: dest.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(15,23,42,0.15)', 'rgba(15,23,42,0.4)', 'rgba(15,23,42,0.88)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : null}
        <View style={{ zIndex: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(15,23,42,0.65)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13 }}>{dest.emoji}</Text>
              <Text style={{ color: '#fff', fontSize: 11.5, fontWeight: '700' }}>{dest.tags[0] || 'India'}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(15,23,42,0.65)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11.5 }}>{avg.toFixed(1)}</Text>
            </View>
            {reviews.length ? (
              <View style={{ backgroundColor: 'rgba(15,23,42,0.65)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: 11 }}>
                  {reviews.length} review{reviews.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.6 }}>
            {dest.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.85)" style={{ marginRight: 4 }} />
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14.5, fontWeight: '600' }}>
              {dest.region}, {dest.country}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {dest.tags.map((t) => (
            <Chip key={t} label={t} selected />
          ))}
        </View>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 24, marginTop: spacing.md, fontWeight: '400' }}>{dest.description}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.lg }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 8, fontWeight: '600' }}>Best Season</Text>
            <Text style={{ fontWeight: '800', color: colors.text, marginTop: 2, fontSize: 15 }}>{dest.bestSeason}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 8, fontWeight: '600' }}>Avg. Per Day</Text>
            <Text style={{ fontWeight: '800', color: colors.primaryDark, marginTop: 2, fontSize: 16 }}>{money(dest.avgDailyCost)}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>approx. per person</Text>
          </Card>
        </View>

        <SectionTitle title="Top Highlights" />
        <Card>
          {dest.highlights.map((h, i) => (
            <View
              key={h}
              style={{ flexDirection: 'row', paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: colors.borderLight, alignItems: 'center' }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: colors.primaryDark, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>

              </View>
              <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>{h}</Text>
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
          <Button
            title="Weather"
            icon="partly-sunny-outline"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/weather', params: { destinationId: dest.id } })}
          />
          <Button
            title="Maps"
            icon="map-outline"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/map', params: { destinationId: dest.id } })}
          />
        </View>

        <View style={{ marginTop: spacing.md, gap: 10 }}>
          <Button
            title={`Plan trip to ${dest.name}`}
            icon="sparkles"
            onPress={() => router.push({ pathname: '/(tabs)/planner', params: { destinationId: dest.id } })}
          />
          <Button title="Ask Atlas" icon="chatbubbles-outline" variant="soft" onPress={() => router.push('/chat')} />
        </View>

        <SectionTitle title={`Reviews (${reviews.length})`} />
        {posted ? <Banner title="Thanks for your review!" tone="success" /> : null}
        <Card>
          <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 6 }}>Rate this place</Text>
          <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                <Text style={{ fontSize: 32, color: n <= rating ? '#F5A524' : colors.border, marginRight: 2 }}>★</Text>
              </Pressable>
            ))}
          </View>
          <Input placeholder="Share your experience…" value={text} onChangeText={setText} multiline error={err} />
          <Button title="Post review" icon="send" onPress={submit} />
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
