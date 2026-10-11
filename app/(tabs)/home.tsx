import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, DestinationCard, SectionTitle } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { recommend } from '../../src/services/planner';
import { colors, spacing } from '../../src/theme';

type Quick = { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; href: string };

const quick: Quick[] = [
  { label: 'AI Planner', icon: 'sparkles', href: '/(tabs)/planner' },
  { label: 'Chat', icon: 'chatbubbles', href: '/chat' },
  { label: 'Budget', icon: 'wallet', href: '/budget' },
  { label: 'Explore', icon: 'compass', href: '/(tabs)/explore' },
  { label: 'Weather', icon: 'partly-sunny', href: '/weather' },
  { label: 'Maps', icon: 'map', href: '/map' },
  { label: 'My Trips', icon: 'bookmark', href: '/(tabs)/trips' },
  { label: 'Alerts', icon: 'notifications', href: '/notifications' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, prefs, demo } = useAuth();
  const { destinations } = useDestinations();
  const { unread, favorites } = useExtras();
  const { trips } = useTrips();
  const recs = useMemo(() => recommend(prefs, destinations).slice(0, 5), [prefs, destinations]);
  const popular = useMemo(() => destinations.slice().sort((a, b) => b.rating - a.rating).slice(0, 3), [destinations]);
  const favDests = destinations.filter((d) => favorites.includes(d.id));
  const upcoming = trips[0];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={{ paddingTop: insets.top + 16, paddingHorizontal: spacing.xl, paddingBottom: 56 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#D7F0F2' }}>Hello,</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{user?.name ?? 'Traveller'} 👋</Text>
            <Text style={{ color: '#D7F0F2', marginTop: 4 }}>Where to next?</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            {unread ? (
              <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{unread}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        {demo ? (
          <View style={{ marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Demo mode (backend offline)</Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: -32 }}>
        <Card style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: spacing.md }}>
          {quick.map((q) => (
            <Pressable key={q.label} onPress={() => router.push(q.href as never)} style={{ alignItems: 'center', width: '25%', paddingVertical: 8 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={q.icon} size={22} color={colors.primary} />
              </View>
              <Text style={{ marginTop: 6, fontSize: 12, fontWeight: '600', color: colors.text }}>{q.label}</Text>
            </Pressable>
          ))}
        </Card>

        {upcoming ? (
          <>
            <SectionTitle title="Latest plan" action="See all" onAction={() => router.push('/(tabs)/trips')} />
            <Pressable onPress={() => router.push(`/itinerary/${upcoming.id}`)}>
              <LinearGradient colors={upcoming.colors} style={{ borderRadius: 20, padding: spacing.lg }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={{ fontSize: 34 }}>{upcoming.emoji}</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 }}>{upcoming.destinationName}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
                  {upcoming.days} days · {upcoming.travelers} traveller{upcoming.travelers > 1 ? 's' : ''} · {upcoming.style}
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        ) : null}

        <SectionTitle title="Recommended for you" action="Preferences" onAction={() => router.push('/preferences')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 14 }}>
        {recs.map(({ dest, why }) => (
          <DestinationCard key={dest.id} dest={dest} note={why} compact onPress={() => router.push(`/destination/${dest.id}`)} />
        ))}
      </ScrollView>

      {favDests.length ? (
        <>
          <View style={{ paddingHorizontal: spacing.lg }}>
            <SectionTitle title="Your favourites ♥" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 14 }}>
            {favDests.map((d) => (
              <DestinationCard key={d.id} dest={d} compact onPress={() => router.push(`/destination/${d.id}`)} />
            ))}
          </ScrollView>
        </>
      ) : null}

      <View style={{ paddingHorizontal: spacing.lg }}>
        <SectionTitle title="Popular right now" />
        {popular.map((d) => (
          <DestinationCard key={d.id} dest={d} onPress={() => router.push(`/destination/${d.id}`)} />
        ))}
      </View>
    </ScrollView>
  );
}
