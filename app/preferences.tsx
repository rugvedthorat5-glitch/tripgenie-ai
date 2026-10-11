import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Chip } from '../src/components/UI';
import { useAuth } from '../src/context/AuthContext';
import { INTERESTS } from '../src/data/destinations';
import { colors, spacing } from '../src/theme';
import { Preferences } from '../src/types';

const STYLES: Preferences['travelStyle'][] = ['Budget', 'Comfort', 'Luxury'];
const COMPANIONS: Preferences['companions'][] = ['Solo', 'Couple', 'Family', 'Friends'];
const CLIMATES: Preferences['climate'][] = ['Any', 'Warm', 'Cool', 'Snow'];

function Group<T extends string>({ title, options, value, onChange }: { title: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onChange(o)} />
        ))}
      </View>
    </View>
  );
}

export default function PreferencesScreen() {
  const router = useRouter();
  const { prefs, savePrefs } = useAuth();
  const [draft, setDraft] = useState<Preferences>(prefs);
  const [saving, setSaving] = useState(false);

  const toggle = (i: string) =>
    setDraft((d) => ({ ...d, interests: d.interests.includes(i) ? d.interests.filter((x) => x !== i) : [...d.interests, i] }));

  const save = async () => {
    setSaving(true);
    await savePrefs(draft);
    setSaving(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={{ color: colors.muted, marginBottom: spacing.lg }}>
        These choices drive your personalised recommendations and pre-fill the AI planner.
      </Text>
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>Interests</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg }}>
        {INTERESTS.map((i) => (
          <Chip key={i} label={i} selected={draft.interests.includes(i)} onPress={() => toggle(i)} />
        ))}
      </View>
      <Group title="Travel style" options={STYLES} value={draft.travelStyle} onChange={(v) => setDraft({ ...draft, travelStyle: v })} />
      <Group title="Usually travelling" options={COMPANIONS} value={draft.companions} onChange={(v) => setDraft({ ...draft, companions: v })} />
      <Group title="Preferred climate" options={CLIMATES} value={draft.climate} onChange={(v) => setDraft({ ...draft, climate: v })} />
      <Button title="Save preferences" onPress={save} loading={saving} />
    </ScrollView>
  );
}
