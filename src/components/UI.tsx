import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';
import { Destination } from '../types';

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Input({ label, error, ...rest }: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? { borderColor: colors.danger } : null]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function DestinationCard({
  dest,
  onPress,
  note,
  compact,
}: {
  dest: Destination;
  onPress: () => void;
  note?: string;
  compact?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.destCard, compact && { width: 220 }]}>
      <LinearGradient colors={dest.colors} style={styles.destBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={{ fontSize: 44 }}>{dest.emoji}</Text>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>★ {dest.rating}</Text>
        </View>
      </LinearGradient>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.destName}>{dest.name}</Text>
        <Text style={styles.destRegion}>
          {dest.region}, {dest.country}
        </Text>
        <Text style={styles.destCost}>from ₹{dest.avgDailyCost.toLocaleString('en-IN')} / day</Text>
        {note ? <Text style={styles.destNote}>{note}</Text> : null}
      </View>
    </Pressable>
  );
}

export function Empty({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: spacing.xs }}>{text}</Text>
    </View>
  );
}

export const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnText: { fontSize: 16, fontWeight: '700' },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, marginTop: 4, fontSize: 13 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chip,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { color: colors.primaryDark, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  sectionAction: { color: colors.primary, fontWeight: '700' },
  destCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow,
  },
  destBanner: { height: 110, alignItems: 'center', justifyContent: 'center' },
  ratingPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  destName: { fontSize: 17, fontWeight: '800', color: colors.text },
  destRegion: { color: colors.muted, marginTop: 2 },
  destCost: { color: colors.primary, fontWeight: '700', marginTop: 6 },
  destNote: { color: colors.accent, marginTop: 4, fontSize: 12, fontWeight: '600' },
});
