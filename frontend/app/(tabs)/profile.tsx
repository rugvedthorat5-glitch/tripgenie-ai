import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Banner, Button, Card, Input } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { API_URL, getActiveApiUrl, setCustomApiUrl } from '../../src/services/api';
import { checkBackend } from '../../src/services/health';
import { colors, gradients, radius, spacing } from '../../src/theme';
import { isAdmin } from '../../src/utils/roles';

type Row = { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; href: string; tint: string };

const baseRows: Row[] = [
  { label: 'Travel preferences', icon: 'options', href: '/preferences', tint: '#0C7A86' },
  { label: 'Budget planner', icon: 'wallet', href: '/budget', tint: '#C47B1A' },
  { label: 'Weather', icon: 'partly-sunny', href: '/weather', tint: '#3B82F6' },
  { label: 'Maps', icon: 'map', href: '/map', tint: '#1F8A70' },
  { label: 'Notifications', icon: 'notifications', href: '/notifications', tint: '#DB2777' },
  { label: 'Ask Atlas', icon: 'chatbubbles', href: '/chat', tint: '#5B6CFF' },
];

export default function Profile() {
  const router = useRouter();
  const { user, prefs, logout, demo, avatar, setAvatar, updateProfile } = useAuth();
  const { trips } = useTrips();
  const { favorites, unread } = useExtras();
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const initial = (user?.name ?? 'T').charAt(0).toUpperCase();
  const rows = isAdmin(user?.email, user?.role)
    ? [...baseRows, { label: 'Admin panel', icon: 'shield-checkmark' as const, href: '/admin', tint: '#06525A' }]
    : baseRows;

  const out = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const pickPhoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });
      if (!r.canceled && r.assets[0]?.base64) {
        await setAvatar(`data:image/jpeg;base64,${r.assets[0].base64}`);
      }
    } catch {
      setStatus('Could not open the photo library.');
    }
  };

  const [activeUrl, setActiveUrl] = useState(API_URL);

  useEffect(() => {
    getActiveApiUrl().then(setActiveUrl);
  }, []);

  const test = async () => {
    setChecking(true);
    const fresh = await getActiveApiUrl();
    setActiveUrl(fresh);
    const res = await checkBackend();
    setStatus(res.message);
    setChecking(false);
  };

  const resetToCloud = async () => {
    setChecking(true);
    await setCustomApiUrl('');
    const fresh = await getActiveApiUrl();
    setActiveUrl(fresh);
    const res = await checkBackend();
    setStatus(res.message);
    setChecking(false);
  };

  const saveName = async () => {
    if (nameDraft.trim().length < 2) return setStatus('Name must be at least 2 characters');
    setSavingName(true);
    await updateProfile(nameDraft.trim());
    setSavingName(false);
    setEditing(false);
    setStatus('Profile name updated.');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} style={{ backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      <Card style={{ alignItems: 'center', overflow: 'hidden', paddingTop: 0 }}>
        <LinearGradient colors={gradients.brandSoft} style={{ width: '100%', height: 72, marginBottom: -36 }} />
        <Pressable onPress={pickPhoto} style={{ width: 92, height: 92 }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: '#fff' }} />
          ) : (
            <LinearGradient
              colors={gradients.brandModern}
              style={{ width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}
            >
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800' }}>{initial}</Text>
            </LinearGradient>
          )}
          <View
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#fff',
            }}
          >
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>
        {avatar ? (
          <Pressable onPress={() => setAvatar(null)}>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Remove photo</Text>
          </Pressable>
        ) : null}

        {editing ? (
          <View style={{ width: '100%', marginTop: spacing.md }}>
            <Input label="Display name" value={nameDraft} onChangeText={setNameDraft} leftIcon="person-outline" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Save" onPress={saveName} loading={savingName} style={{ flex: 1 }} />
              <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12, letterSpacing: -0.3 }}>{user?.name}</Text>
            <Text style={{ color: colors.muted, marginTop: 2, fontSize: 13.5 }}>{user?.email}</Text>
            <Pressable
              onPress={() => {
                setNameDraft(user?.name || '');
                setEditing(true);
              }}
              style={{ marginTop: 10, backgroundColor: colors.primarySoft, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill }}
            >
              <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 12.5 }}>Edit name</Text>
            </Pressable>
          </>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg, width: '100%' }}>
          {[
            [trips.length, 'Plans'],
            [trips.filter((t) => t.saved).length, 'Saved'],
            [favorites.length, 'Favourites'],
            [prefs.interests.length, 'Interests'],
          ].map(([n, label]) => (
            <View key={String(label)} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.borderLight }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.primaryDark }}>{n}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2, fontWeight: '600' }}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md, paddingVertical: 4, paddingHorizontal: spacing.sm }}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            onPress={() => router.push(r.href as never)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 13,
              paddingHorizontal: spacing.sm,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: colors.borderLight,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${r.tint}14`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={r.icon} size={18} color={r.tint} />
            </View>
            <Text style={{ flex: 1, marginLeft: 12, color: colors.text, fontWeight: '700', fontSize: 14 }}>{r.label}</Text>
            {r.label === 'Notifications' && unread ? (
              <View style={{ backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 7, marginRight: 8, minWidth: 22, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{unread}</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ))}
      </Card>


      <Card style={{ marginTop: spacing.lg }}>
        <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>Live Cloud Backend</Text>
        <Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>
          Connected to Hostinger cloud backend. All AI features, trips and preferences sync in real-time.
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>API: {activeUrl}</Text>
        {status ? <Banner title="Status" text={status} tone="info" /> : null}
        <Button title="Test Connection" variant="outline" onPress={test} loading={checking} style={{ marginTop: spacing.md }} />
      </Card>

      <Button title="Log out" variant="outline" onPress={out} style={{ marginTop: spacing.xl }} icon="log-out-outline" />
    </ScrollView>
  );
}
