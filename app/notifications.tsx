import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, Empty } from '../src/components/UI';
import { useExtras } from '../src/context/ExtrasContext';
import { colors, radius, shadow, spacing } from '../src/theme';

export default function Notifications() {
  const { notifications, markAllRead, clearNotifications, unread } = useExtras();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Button title={`Mark all read${unread ? ` (${unread})` : ''}`} variant="outline" onPress={markAllRead} disabled={!unread} style={{ flex: 1, minHeight: 42, paddingVertical: 8 }} />
        <Button title="Clear all" variant="outline" onPress={clearNotifications} disabled={!notifications.length} style={{ flex: 1, minHeight: 42, paddingVertical: 8 }} />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Pressable
            style={{
              backgroundColor: '#fff',
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              borderLeftWidth: 4,
              borderLeftColor: item.read ? colors.border : colors.accent,
              ...shadow,
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.text }}>{item.title}</Text>
            <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{item.body}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
              {new Date(item.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Empty emoji="🔔" title="No notifications" text="Trip updates and travel tips will appear here." />}
      />
    </View>
  );
}
