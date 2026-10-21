import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, Empty } from '../src/components/UI';
import { useExtras } from '../src/context/ExtrasContext';
import { colors, radius, shadowSoft, spacing } from '../src/theme';

export default function Notifications() {
  const { notifications, markAllRead, markRead, clearNotifications, unread } = useExtras();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={{ color: colors.muted, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: 4, lineHeight: 20, fontSize: 14 }}>
        Trip updates, saved plans and friendly reminders — all in one place.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, paddingTop: spacing.sm }}>
        <Button
          title={unread ? `Mark read (${unread})` : 'All read'}
          variant="soft"
          onPress={markAllRead}
          disabled={!unread}
          style={{ flex: 1, minHeight: 44, paddingVertical: 8 }}
        />
        <Button
          title="Clear"
          variant="outline"
          onPress={clearNotifications}
          disabled={!notifications.length}
          style={{ flex: 1, minHeight: 44, paddingVertical: 8 }}
        />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markRead(item.id)}
            style={{
              backgroundColor: '#fff',
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: item.read ? colors.border : colors.accentSoft,
              borderLeftWidth: 4,
              borderLeftColor: item.read ? colors.border : colors.accent,
              ...shadowSoft,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: item.read ? colors.chip : colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={item.read ? 'notifications-outline' : 'notifications'} size={18} color={item.read ? colors.muted : colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>{item.title}</Text>
                <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{item.body}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8, fontWeight: '600' }}>
                  {new Date(item.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {!item.read ? ' · Tap to mark read' : ''}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Empty emoji="🔔" title="You're all caught up" text="Trip updates, saves and tips will show up here." />
        }
      />
    </View>
  );
}
