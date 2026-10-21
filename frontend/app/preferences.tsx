import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Banner, Button, Card, Chip } from '../src/components/UI';
import { useAuth } from '../src/context/AuthContext';
import { INTERESTS } from '../src/data/destinations';
import { colors, spacing } from '../src/theme';
import { Preferences } from '../src/types';

const STYLES: Preferences['travelStyle'][] = ['Budget', 'Comfort', 'Luxury'];
const COMPANIONS: Preferences['companions'][] = ['Solo', 'Couple', 'Family', 'Friends'];
const CLIMATES: Preferences['climate'][] = ['Any', 'Warm', 'Cool', 'Snow'];

function Group<T extends string>({
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Text style={{ fontWeight: '800', color: colors.text }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.muted, marginTop: 2, marginBottom: 10, fontSize: 13 }}>{subtitle}</Text> : <View style={{ height: 10 }} />}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onChange(o)} />
        ))}
      </View>
    </Card>
  );
}

export default function PreferencesScreen() {
  const router = useRouter();
  const { prefs, savePrefs } = useAuth();
  const [draft, setDraft] = useState<Preferences>(prefs);
  const [saving, setSaving] = useState(false);

  const toggle = (i: string) =>
    setDraft((d) => ({
      ...d,
      interests: d.interests.includes(i) ? d.interests.filter((x) => x !== i) : [...d.interests, i],
    }));

  const save = async () => {
    if (!draft.interests.length) return;
    setSaving(true);
    await savePrefs(draft);
    setSaving(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} style={{ backgroundColor: colors.bg }}>
      <Banner
        title="Personalise TripGenie"
        text="These choices power Home recommendations and pre-fill the AI planner."
        tone="info"
      />

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={{ fontWeight: '800', color: colors.text }}>Interests</Text>
        <Text style={{ color: colors.muted, marginTop: 2, marginBottom: 10, fontSize: 13 }}>
          Pick at least one · {draft.interests.length} selected
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {INTERESTS.map((i) => (
            <Chip key={i} label={i} selected={draft.interests.includes(i)} onPress={() => toggle(i)} />
          ))}
        </View>
      </Card>

      <Group
        title="Travel style"
        subtitle="Affects stay and activity budget estimates"
        options={STYLES}
        value={draft.travelStyle}
        onChange={(v) => setDraft({ ...draft, travelStyle: v })}
      />
      <Group
        title="Usually travelling with"
        options={COMPANIONS}
        value={draft.companions}
        onChange={(v) => setDraft({ ...draft, companions: v })}
      />
      <Group
        title="Preferred climate"
        options={CLIMATES}
        value={draft.climate}
        onChange={(v) => setDraft({ ...draft, climate: v })}
      />

      {!draft.interests.length ? <Banner title="Select an interest" text="Choose at least one interest to continue." tone="warn" /> : null}
      <Button title="Save & continue" icon="checkmark-circle" onPress={save} loading={saving} disabled={!draft.interests.length} />
    </ScrollView>
  );
}
