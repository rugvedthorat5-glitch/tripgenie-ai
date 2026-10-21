import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RichText } from '../src/components/RichText';
import { Chip } from '../src/components/UI';
import { useAuth } from '../src/context/AuthContext';
import { useTrips } from '../src/context/TripsContext';
import { askChatbot } from '../src/services/planner';
import { colors, gradients, radius, shadowSoft, spacing } from '../src/theme';
import { ChatMessage } from '../src/types';

const SUGGESTIONS = [
  'Best beaches in India?',
  'Plan a mountain trip',
  'What should I pack?',
  'Cheap food destinations',
  'Help with my latest trip',
];

export default function Chat() {
  const { prefs } = useAuth();
  const { trips } = useTrips();
  const latest = trips[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm0',
      role: 'assistant',
      text: `Hi! I'm Atlas, your TripGenie AI travel assistant. Ask me about destinations, sightseeing, routes, budgets, stays or activities${
        latest ? ` — I can also personalise around your ${latest.destinationName} trip` : ''
      }.`,
    },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = async (raw?: string) => {
    const t = (raw ?? text).trim();
    if (!t || busy) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text: t };
    const history = [...messages, userMsg];
    setMessages(history);
    setText('');
    setBusy(true);
    const personalise = /trip|my plan|itinerary|latest/i.test(t);
    const reply = await askChatbot(history, t, personalise || latest ? { ...latest, interests: prefs.interests } : { interests: prefs.interests });
    setMessages((cur) => [...cur, { id: `a${Date.now()}`, role: 'assistant', text: reply }]);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <LinearGradient colors={gradients.brandModern} style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>Atlas Concierge</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>AI Travel Expert · Powered by Gemini</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.successSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
          <Text style={{ color: colors.success, fontWeight: '800', fontSize: 10.5 }}>ONLINE</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          return (
            <View
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                borderRadius: radius.lg,
                borderBottomRightRadius: mine ? 4 : radius.lg,
                borderBottomLeftRadius: mine ? radius.lg : 4,
                padding: spacing.md,
                ...(mine
                  ? { backgroundColor: colors.primaryDark }
                  : {
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: colors.border,
                      ...shadowSoft,
                    }),
                overflow: 'hidden',
              }}
            >
              {mine ? (
                <Text style={{ color: '#FFFFFF', lineHeight: 22, fontSize: 14.5 }}>{item.text}</Text>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <Ionicons name="sparkles" size={11} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11, letterSpacing: 0.3 }}>ATLAS AI</Text>
                  </View>
                  <RichText text={item.text} color={colors.text} />
                </>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          busy ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingHorizontal: 4 }}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={{ color: colors.muted, fontSize: 12.5 }}>Atlas is preparing your travel advice…</Text>
            </View>
          ) : null
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 6, gap: 8 }}>
        {SUGGESTIONS.map((s) => (
          <Chip key={s} label={s} onPress={() => send(s)} />
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          gap: 10,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          backgroundColor: '#FFFFFF',
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask Atlas about places, routes, food, stays…"
          placeholderTextColor={colors.muted}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          style={{
            flex: 1,
            backgroundColor: colors.bg,
            borderRadius: radius.pill,
            paddingHorizontal: 16,
            paddingVertical: 11,
            fontSize: 15,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
        <Pressable
          onPress={() => send()}
          disabled={busy || !text.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            overflow: 'hidden',
            opacity: busy || !text.trim() ? 0.45 : 1,
          }}
        >
          <LinearGradient colors={gradients.brandModern} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}
