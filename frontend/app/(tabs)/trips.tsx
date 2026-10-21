import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip, DestinationCard, Empty, money } from '../../src/components/UI';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { colors, gradients, radius, shadow, shadowSoft, spacing } from '../../src/theme';


type Mode = 'upcoming' | 'saved' | 'past' | 'places';

export default function Trips() {
  const router = useRouter();
  const { trips } = useTrips();
  const { destinations } = useDestinations();
  const { favorites } = useExtras();
  const [mode, setMode] = useState<Mode>('upcoming');

  const list = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (mode === 'saved') return trips.filter((t) => t.saved);
    if (mode === 'past') {
      return trips.filter((t) => t.status === 'past' || (t.endDate && t.endDate < today));
    }
    return trips.filter((t) => t.status !== 'past' && !(t.endDate && t.endDate < today));
  }, [trips, mode]);

  const favDests = destinations.filter((d) => favorites.includes(d.id));

  const chips = (
    <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip label="Upcoming" selected={mode === 'upcoming'} onPress={() => setMode('upcoming')} />
        <Chip label="★ Saved" selected={mode === 'saved'} onPress={() => setMode('saved')} />
        <Chip label="Past" selected={mode === 'past'} onPress={() => setMode('past')} />
        <Chip label="♥ Wishlist" selected={mode === 'places'} onPress={() => setMode('places')} />
      </ScrollView>
    </View>
  );


  if (mode === 'places') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {chips}
        <FlatList
          data={favDests}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => <DestinationCard dest={item} onPress={() => router.push(`/destination/${item.id}`)} />}
          ListEmptyComponent={<Empty emoji="🤍" title="Wishlist empty" text="Tap the heart on a destination to keep it here for later." />}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {chips}
      <FlatList
        data={list}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const total = Object.values(item.breakdown).reduce((a, b) => a + b, 0);
          const dest = destinations.find((d) => d.id === item.destinationId);
          const photoUrl = dest?.imageUrl;

          return (
            <Pressable
              onPress={() => router.push(`/itinerary/${item.id}`)}
              style={({ pressed }) => [
                {
                  backgroundColor: '#FFFFFF',
                  borderRadius: radius.lg,
                  marginBottom: spacing.md,
                  overflow: 'hidden',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.95 : 1,
                  ...shadowSoft,
                },
              ]}
            >
              <View style={{ width: 104, position: 'relative', overflow: 'hidden' }}>
                <LinearGradient
                  colors={item.colors || gradients.brandModern}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                {photoUrl ? (
                  <>
                    <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(15,23,42,0.6)']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </>
                ) : null}
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                </View>
              </View>

              <View style={{ flex: 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, flex: 1, letterSpacing: -0.2 }} numberOfLines={1}>
                    {item.destinationName}
                  </Text>
                  {item.saved ? (
                    <View style={{ backgroundColor: colors.accentSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, marginLeft: 6 }}>
                      <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 10 }}>SAVED</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12.5 }}>
                  {item.days} days · {item.travelers} traveller{item.travelers > 1 ? 's' : ''} · {item.style}
                </Text>

                {item.startLocation ? (
                  <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>From {item.startLocation}</Text>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ color: colors.primaryDark, fontWeight: '800', fontSize: 14 }}>Est. {money(total)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ color: colors.muted, fontSize: 11.5 }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.muted} />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Empty
            emoji="🧳"
            title={mode === 'saved' ? 'No saved trips yet' : mode === 'past' ? 'No past trips yet' : 'No upcoming trips'}
            text="Generate an itinerary with the AI planner and it will show up here — ready whenever you are."
            actionLabel="Plan my first trip"
            onAction={() => router.push('/(tabs)/planner')}
          />
        }
      />
    </View>
  );
}
