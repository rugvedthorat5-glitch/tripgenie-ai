import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, TextInput, View } from 'react-native';
import { Chip, DestinationCard, Empty } from '../../src/components/UI';
import { useDestinations } from '../../src/context/DestinationsContext';
import { INTERESTS } from '../../src/data/destinations';
import { colors, radius, spacing } from '../../src/theme';

export default function Explore() {
  const router = useRouter();
  const { destinations } = useDestinations();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
      const matchT = !tag || d.tags.includes(tag);
      return matchQ && matchT;
    });
  }, [query, tag, destinations]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
          }}
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Search destinations or states"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, padding: 12, fontSize: 16, color: colors.text }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.md }}>
          <Chip label="All" selected={!tag} onPress={() => setTag(null)} />
          {INTERESTS.map((t) => (
            <Chip key={t} label={t} selected={tag === t} onPress={() => setTag(tag === t ? null : t)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => <DestinationCard dest={item} onPress={() => router.push(`/destination/${item.id}`)} />}
        ListEmptyComponent={<Empty emoji="🔎" title="No matches" text="Try a different search or clear the filter." />}
      />
    </View>
  );
}
