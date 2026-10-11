import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Chip } from '../src/components/UI';
import { askChatbot } from '../src/services/planner';
import { colors, radius, spacing } from '../src/theme';
import { ChatMessage } from '../src/types';

const SUGGESTIONS = ['Best beaches in India?', 'Plan a mountain trip', 'What should I pack?', 'Cheap food destinations'];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', role: 'assistant', text: 'Hi! I am your AI travel assistant. Ask me about destinations, budgets, seasons or packing.' },
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
    const reply = await askChatbot(history, t);
    setMessages((cur) => [...cur, { id: `a${Date.now()}`, role: 'assistant', text: reply }]);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          return (
            <View
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: mine ? colors.primary : '#fff',
                borderRadius: radius.lg,
                borderBottomRightRadius: mine ? 4 : radius.lg,
                borderBottomLeftRadius: mine ? radius.lg : 4,
                padding: spacing.md,
                borderWidth: mine ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: mine ? '#fff' : colors.text, lineHeight: 21 }}>{item.text}</Text>
            </View>
          );
        }}
        ListFooterComponent={busy ? <ActivityIndicator style={{ alignSelf: 'flex-start', marginTop: 8 }} color={colors.primary} /> : null}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: spacing.lg }}>
        {SUGGESTIONS.map((s) => (
          <Chip key={s} label={s} onPress={() => send(s)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about your next trip…"
          placeholderTextColor={colors.muted}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          style={{ flex: 1, backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, color: colors.text }}
        />
        <Pressable
          onPress={() => send()}
          disabled={busy || !text.trim()}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: busy || !text.trim() ? 0.5 : 1 }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
