import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, DestinationCard, SectionTitle } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useDestinations } from '../../src/context/DestinationsContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { recommend } from '../../src/services/planner';
import { colors, gradients, radius, shadow, shadowSoft, spacing } from '../../src/theme';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'Beaches', label: 'Beaches', emoji: '🏖️' },
  { id: 'Mountains', label: 'Mountains', emoji: '🏔️' },
  { id: 'Culture', label: 'Heritage', emoji: '🏰' },
  { id: 'Nature', label: 'Nature', emoji: '🌿' },
  { id: 'Spiritual', label: 'Spiritual', emoji: '🧘' },
  { id: 'Adventure', label: 'Adventure', emoji: '🤿' },
];

const QUICK_TOOLS = [
  { id: 'chat', label: 'Ask Atlas', icon: 'chatbubbles' as const, href: '/chat', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'weather', label: 'Weather', icon: 'partly-sunny' as const, href: '/weather', color: '#0284C7', bg: '#F0F9FF' },
  { id: 'budget', label: 'Budget', icon: 'wallet' as const, href: '/budget', color: '#D97706', bg: '#FFFBEB' },
  { id: 'map', label: 'Map', icon: 'map' as const, href: '/map', color: '#16A34A', bg: '#F0FDF4' },
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, prefs, demo, avatar } = useAuth();
  const { destinations } = useDestinations();
  const { unread, favorites } = useExtras();
  const { trips } = useTrips();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const recs = useMemo(() => recommend(prefs, destinations).slice(0, 6), [prefs, destinations]);
  const popular = useMemo(
    () => destinations.slice().sort((a, b) => b.rating - a.rating).slice(0, 6),
    [destinations]
  );

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'all') return popular;
    return destinations.filter((d) => d.tags.includes(selectedCategory)).slice(0, 6);
  }, [destinations, popular, selectedCategory]);

  const favDests = destinations.filter((d) => favorites.includes(d.id));
  const upcoming = trips[0];
  const firstName = (user?.name ?? 'Traveller').split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  // Featured hero destination
  const featured = destinations.find((d) => d.id === 'goa') || destinations[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing.xxl + 10 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Sleek Top Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 14) + 4 }]}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [styles.profilePill, pressed && { opacity: 0.85 }]}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={gradients.brandModern} style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initial}</Text>
              </LinearGradient>
            )}
            <View>
              <Text style={styles.greetingSub}>{getTimeGreeting()},</Text>
              <Text style={styles.greetingName}>{firstName} 👋</Text>
            </View>
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/chat')}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="chatbubbles-outline" size={18} color={colors.text} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.text} />
              {unread ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* Compact Floating Search Bar */}
        <Pressable
          onPress={() => router.push('/(tabs)/explore')}
          style={({ pressed }) => [styles.searchPill, pressed && { opacity: 0.92 }]}
        >
          <Ionicons name="search" size={16} color={colors.primary} style={{ marginLeft: 2 }} />
          <Text style={styles.searchPillPlaceholder} numberOfLines={1}>
            Where to? Search Goa, Manali, Kerala, 50+ places…
          </Text>
          <View style={styles.searchPillFilterBtn}>
            <Ionicons name="options-outline" size={14} color={colors.muted} />
          </View>
        </Pressable>
      </View>

      {/* Category Pills (Vibrant, Compact, Not oversized) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={({ pressed }) => [
                styles.categoryChip,
                isActive && styles.categoryChipActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ fontSize: 13, marginRight: 4 }}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Compact, Vibrant AI Planner Banner (Replaced big dark block) */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: 4 }}>
        <Pressable
          onPress={() => router.push('/(tabs)/planner')}
          style={({ pressed }) => [
            styles.aiPlannerCard,
            pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
          ]}
        >
          <LinearGradient
            colors={['#0F766E', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.aiPlannerGlow} />

          <View style={{ flex: 1, zIndex: 2 }}>
            <View style={styles.aiPlannerTag}>
              <Ionicons name="sparkles" size={10} color="#2DD4BF" style={{ marginRight: 3 }} />
              <Text style={styles.aiPlannerTagText}>AI TRIP ARCHITECT</Text>
            </View>
            <Text style={styles.aiPlannerTitle}>Plan Your Trip in Seconds</Text>
            <Text style={styles.aiPlannerSub}>Day-by-day itineraries with stays, routes & budgets</Text>
          </View>

          <View style={styles.aiPlannerBtn}>
            <Text style={styles.aiPlannerBtnText}>Plan</Text>
            <Ionicons name="arrow-forward" size={13} color="#0D9488" />
          </View>
        </Pressable>
      </View>

      {/* Quick Tools Row (Compact 1-row strip instead of 4 giant boxes) */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <View style={styles.toolsRow}>
          {QUICK_TOOLS.map((tool) => (
            <Pressable
              key={tool.id}
              onPress={() => router.push(tool.href as never)}
              style={({ pressed }) => [
                styles.toolPill,
                { backgroundColor: tool.bg },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={tool.icon} size={15} color={tool.color} />
              <Text style={[styles.toolPillText, { color: tool.color }]}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Active Trip Banner if user has an upcoming plan */}
      {upcoming ? (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <Pressable
            onPress={() => router.push(`/itinerary/${upcoming.id}`)}
            style={({ pressed }) => [
              styles.upcomingCard,
              pressed && { opacity: 0.95 },
            ]}
          >
            <LinearGradient
              colors={upcoming.colors || gradients.brandModern}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upcomingGrad}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingBadgeText}>ACTIVE TRIP</Text>
                </View>
                <Text style={styles.upcomingName} numberOfLines={1}>{upcoming.destinationName}</Text>
                <Text style={styles.upcomingMeta}>
                  {upcoming.days} days · {upcoming.travelers} traveller{upcoming.travelers > 1 ? 's' : ''} · {upcoming.style}
                </Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 32 }}>{upcoming.emoji}</Text>
                <View style={styles.upcomingArrowBtn}>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}

      {/* Curated Recommendations - Visual Discovery */}
      <View style={{ marginTop: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionTitle
            title="Curated For You"
            action="Preferences"
            onAction={() => router.push('/preferences')}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12, paddingTop: 2 }}
        >
          {recs.map(({ dest, why }) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              note={why}
              compact
              onPress={() => router.push(`/destination/${dest.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Wishlist Carousel if any favorited */}
      {favDests.length ? (
        <View style={{ marginTop: spacing.md }}>
          <View style={{ paddingHorizontal: spacing.lg }}>
            <SectionTitle
              title="Saved In Your Wishlist"
              action="View All"
              onAction={() => router.push('/(tabs)/trips')}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12, paddingTop: 2 }}
          >
            {favDests.map((d) => (
              <DestinationCard
                key={d.id}
                dest={d}
                compact
                onPress={() => router.push(`/destination/${d.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Category / Trending Spotlight Grid */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <SectionTitle
          title={selectedCategory === 'all' ? 'Popular Right Now' : `${selectedCategory} Escapes`}
          action="Explore All"
          onAction={() => router.push('/(tabs)/explore')}
        />
        <View style={{ gap: 12 }}>
          {filteredDestinations.map((d) => (
            <DestinationCard
              key={d.id}
              dest={d}
              onPress={() => router.push(`/destination/${d.id}`)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  greetingSub: {
    color: colors.muted,
    fontSize: 11.5,
    fontWeight: '500',
  },
  greetingName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchPillPlaceholder: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  searchPillFilterBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiPlannerCard: {
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadowSoft,
  },
  aiPlannerGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  aiPlannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  aiPlannerTagText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9.5,
    letterSpacing: 0.4,
  },
  aiPlannerTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  aiPlannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    marginTop: 2,
  },
  aiPlannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    marginLeft: 10,
    ...shadowSoft,
  },
  aiPlannerBtnText: {
    color: '#0D9488',
    fontWeight: '800',
    fontSize: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  toolPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toolPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  upcomingCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadowSoft,
  },
  upcomingGrad: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upcomingBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  upcomingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  upcomingName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  upcomingMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11.5,
    marginTop: 2,
  },
  upcomingArrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
