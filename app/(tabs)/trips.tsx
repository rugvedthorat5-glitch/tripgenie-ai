import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, Chip, DestinationCard, Empty, money } from '../../src/components/UI';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { colors, radius, shadow, spacing } from '../../src/theme';

type Mode = 'all' | 'saved' | 'places';

export default function Trips() {
  const router = useRouter();
  const { trips } = useTrips();
  const { destinations } = useDestinations();
  const { favorites } = useExtras();
  const [mode, setMode] = useState<Mode>('all');
  const list = mode === 'saved' ? trips.filter((t) => t.saved) : trips;
  const favDests = destinations.filter((d) => favorites.includes(d.id));

  const chips = (
    <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
      <Chip label="All plans" selected={mode === 'all'} onPress={() => setMode('all')} />
      <Chip label="★ Saved" selected={mode === 'saved'} onPress={() => setMode('saved')} />
      <Chip label="♥ Places" selected={mode === 'places'} onPress={() => setMode('places')} />
    </View>
  );

  if (mode === 'places') {
    return (
      <View style={{ flex: 1 }}>
        {chips}
        <FlatList
          data={favDests}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => <DestinationCard dest={item} onPress={() => router.push(`/destination/${item.id}`)} />}
          ListEmptyComponent={<Empty emoji="🤍" title="No favourite places" text="Tap the heart on a destination to keep it here." />}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {chips}
      <FlatList
        data={list}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const total = Object.values(item.breakdown).reduce((a, b) => a + b, 0);
          return (
            <Pressable
              onPress={() => router.push(`/itinerary/${item.id}`)}
              style={{ backgroundColor: '#fff', borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', flexDirection: 'row', ...shadow }}
            >
              <LinearGradient colors={item.colors} style={{ width: 84, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
              </LinearGradient>
              <View style={{ flex: 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{item.destinationName}</Text>
                  {item.saved ? <Text style={{ color: colors.accent }}>★</Text> : null}
                </View>
                <Text style={{ color: colors.muted, marginTop: 2 }}>
                  {item.days} days · {item.travelers} traveller{item.travelers > 1 ? 's' : ''} · {item.style}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 6 }}>Est. {money(total)}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View>
            <Empty
              emoji="🧳"
              title={mode === 'saved' ? 'No saved trips yet' : 'No trips planned yet'}
              text="Generate an itinerary with the AI planner and it will show up here."
            />
            <Button title="Plan my first trip" onPress={() => router.push('/(tabs)/planner')} />
          </View>
        }
      />
    </View>
  );
}
