import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, DestinationCard, Empty, SearchBar } from '../../src/components/UI';
import { useDestinations } from '../../src/context/DestinationsContext';
import { INTERESTS } from '../../src/data/destinations';
import { colors, radius, shadowSoft, spacing } from '../../src/theme';

export default function Explore() {
  const router = useRouter();
  const { destinations } = useDestinations();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q));
      const matchT = !tag || d.tags.includes(tag);
      return matchQ && matchT;
    });
  }, [query, tag, destinations]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top Filter & Search Section */}
      <View style={styles.topFilterBox}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by city, state, or vibe (e.g. Goa, snow, temples)…"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.md }}
          contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
        >
          <Chip label="✨ All Places" selected={!tag} onPress={() => setTag(null)} />
          {INTERESTS.map((t) => (
            <Chip key={t} label={t} selected={tag === t} onPress={() => setTag(tag === t ? null : t)} />
          ))}
        </ScrollView>

        <View style={styles.resultsMetaRow}>
          <View style={styles.resultCountBadge}>
            <Text style={styles.resultCountText}>
              {list.length} {list.length === 1 ? 'place' : 'places'} found
            </Text>
          </View>
          {tag || query ? (
            <Pressable
              onPress={() => {
                setQuery('');
                setTag(null);
              }}
              style={styles.clearBtn}
            >
              <Ionicons name="refresh" size={12} color={colors.primary} />
              <Text style={styles.clearBtnText}>Reset filters</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Destinations List */}
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DestinationCard dest={item} onPress={() => router.push(`/destination/${item.id}`)} />
        )}
        ListEmptyComponent={
          <Empty
            emoji="🔍"
            title="No matching destinations"
            text="We couldn't find any spots matching your search. Try another keyword or browse all destinations."
            actionLabel="View all destinations"
            onAction={() => {
              setQuery('');
              setTag(null);
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topFilterBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: 2,
  },

  resultCountBadge: {
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCountText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtnText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '700',
  },
});

