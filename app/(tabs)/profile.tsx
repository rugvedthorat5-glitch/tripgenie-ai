import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { useExtras } from '../../src/context/ExtrasContext';
import { useTrips } from '../../src/context/TripsContext';
import { API_URL } from '../../src/services/api';
import { checkBackend } from '../../src/services/health';
import { colors, spacing } from '../../src/theme';
import { isAdmin } from '../../src/utils/roles';

type Row = { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; href: string };

const baseRows: Row[] = [
  { label: 'Travel preferences', icon: 'options', href: '/preferences' },
  { label: 'Budget planner', icon: 'wallet', href: '/budget' },
  { label: 'Weather', icon: 'partly-sunny', href: '/weather' },
  { label: 'Maps', icon: 'map', href: '/map' },
  { label: 'Notifications', icon: 'notifications', href: '/notifications' },
  { label: 'AI assistant', icon: 'chatbubbles', href: '/chat' },
];

export default function Profile() {
  const router = useRouter();
  const { user, prefs, logout, demo, avatar, setAvatar } = useAuth();
  const { trips } = useTrips();
  const { favorites, unread } = useExtras();
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);
  const initial = (user?.name ?? 'T').charAt(0).toUpperCase();
  const rows = isAdmin(user?.email, user?.role)
    ? [...baseRows, { label: 'Admin panel', icon: 'shield-checkmark' as const, href: '/admin' }]
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

  const test = async () => {
    setChecking(true);
    setStatus((await checkBackend()).message);
    setChecking(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Card style={{ alignItems: 'center' }}>
        <Pressable onPress={pickPhoto} style={{ width: 84, height: 84 }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 84, height: 84, borderRadius: 42 }} />
          ) : (
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{initial}</Text>
            </View>
          )}
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>
        {avatar ? (
          <Pressable onPress={() => setAvatar(null)}>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>Remove photo</Text>
          </Pressable>
        ) : null}
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 10 }}>{user?.name}</Text>
        <Text style={{ color: colors.muted }}>{user?.email}</Text>
        <View style={{ flexDirection: 'row', gap: 24, marginTop: spacing.lg }}>
          {[
            [trips.length, 'Plans'],
            [trips.filter((t) => t.saved).length, 'Saved'],
            [favorites.length, 'Favourites'],
            [prefs.interests.length, 'Interests'],
          ].map(([n, label]) => (
            <View key={String(label)} style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>{n}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.lg, paddingVertical: 4 }}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            onPress={() => router.push(r.href as never)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Ionicons name={r.icon} size={20} color={colors.primary} />
            <Text style={{ flex: 1, marginLeft: 12, color: colors.text, fontWeight: '600' }}>{r.label}</Text>
            {r.label === 'Notifications' && unread ? (
              <View style={{ backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 7, marginRight: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{unread}</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={{ fontWeight: '800', color: colors.text }}>Connection</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>
          {demo ? 'Demo mode: the backend was not reachable at login.' : 'Connected to your backend session.'}
        </Text>
        <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>API: {API_URL}</Text>
        {status ? <Text style={{ color: colors.primaryDark, marginTop: 8, fontWeight: '600' }}>{status}</Text> : null}
        <Button title="Test backend connection" variant="outline" onPress={test} loading={checking} style={{ marginTop: spacing.md }} />
      </Card>

      <Button title="Log out" variant="outline" onPress={out} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}
