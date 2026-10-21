import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useExtras } from '../context/ExtrasContext';
import { colors, gradients, radius, shadow, shadowLift, shadowSoft, spacing, typography } from '../theme';
import { Destination } from '../types';

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const fg =
    variant === 'primary' || variant === 'danger'
      ? '#fff'
      : variant === 'soft'
        ? colors.primaryDark
        : colors.primary;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const textSize = size === 'sm' ? 12.5 : size === 'lg' ? 14.5 : 13.5;

  const content = loading ? (
    <ActivityIndicator color={fg} size="small" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon ? <Ionicons name={icon} size={iconSize} color={fg} /> : null}
      <Text style={[styles.btnText, { color: fg, fontSize: textSize }]}>{title}</Text>
    </View>
  );

  const sizeStyle =
    size === 'sm'
      ? { minHeight: 34, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 }
      : size === 'lg'
        ? { minHeight: 46, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 14 }
        : { minHeight: 40, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 12 };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          sizeStyle,
          { overflow: 'hidden', opacity: disabled ? 0.45 : pressed ? 0.92 : 1, paddingHorizontal: 0, paddingVertical: 0 },
          pressed && { transform: [{ scale: 0.985 }] },
          !disabled && shadowSoft,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.brandModern}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, sizeStyle, { width: '100%' }]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const bg =
    variant === 'danger' ? colors.danger : variant === 'soft' ? colors.primarySoft : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        sizeStyle,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
        pressed && variant === 'danger' && { transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}


export function Input({
  label,
  error,
  hint,
  leftIcon,
  secureToggle,
  ...rest
}: TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  secureToggle?: boolean;
}) {
  const [hidden, setHidden] = useState(!!rest.secureTextEntry);
  const [focused, setFocused] = useState(false);
  const isSecure = secureToggle ? hidden : rest.secureTextEntry;

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: colors.primary, backgroundColor: '#fff' },
          error ? { borderColor: colors.danger } : null,
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={focused ? colors.primary : colors.muted} style={{ marginRight: 8 }} /> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          style={styles.input}
          {...rest}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
        {secureToggle ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} style={{ padding: 4 }}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: colors.primary, borderColor: colors.primary, ...shadowSoft },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Banner({
  title,
  text,
  tone = 'info',
  onClose,
}: {
  title: string;
  text?: string;
  tone?: 'info' | 'success' | 'warn';
  onClose?: () => void;
}) {
  const bg = tone === 'success' ? colors.successSoft : tone === 'warn' ? colors.accentSoft : colors.primarySoft;
  const fg = tone === 'success' ? colors.success : tone === 'warn' ? colors.accent : colors.primaryDark;
  const icon: React.ComponentProps<typeof Ionicons>['name'] =
    tone === 'success' ? 'checkmark-circle' : tone === 'warn' ? 'alert-circle' : 'information-circle';

  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
        <Ionicons name={icon} size={18} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: fg, fontSize: 14 }}>{title}</Text>
        {text ? <Text style={{ color: colors.text, marginTop: 3, lineHeight: 20, fontSize: 13.5 }}>{text}</Text> : null}
      </View>
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionActionBtn}>
          <Text style={styles.sectionAction}>{action}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
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
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(dest.imageUrl && !imgError);
  let isFav = false;
  let toggleFav = (_id: string) => {};

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const extras = useExtras();
    isFav = extras.favorites.includes(dest.id);
    toggleFav = extras.toggleFavorite;
  } catch {
    // fallback if outside provider
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.destCard,
        compact ? { width: 250 } : { width: '100%' },
        pressed && { opacity: 0.96, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.destBanner, compact ? { height: 160 } : { height: 195 }]}>
        {/* Vibrant background fallback */}
        <LinearGradient
          colors={dest.colors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {showImage ? (
          <>
            <Image
              source={{ uri: dest.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
            <LinearGradient
              colors={['rgba(15,23,42,0.25)', 'transparent', 'rgba(15,23,42,0.72)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56 }}>{dest.emoji}</Text>
          </View>
        )}

        {/* Top Badges */}
        <View style={styles.destTopBar}>
          <View style={styles.categoryPill}>
            <Text style={{ fontSize: 13, marginRight: 4 }}>{dest.emoji}</Text>
            <Text style={styles.categoryPillText}>{dest.tags[0] || 'India'}</Text>
          </View>

          <Pressable
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              toggleFav(dest.id);
            }}
            style={({ pressed }) => [
              styles.heartBtn,
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? colors.accent : '#FFFFFF'}
            />
          </Pressable>
        </View>

        {/* Bottom Banner Info */}
        <View style={styles.destBottomBar}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingBadgeText}>{dest.rating.toFixed(1)}</Text>
          </View>

          {dest.bestSeason ? (
            <View style={styles.seasonBadge}>
              <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.seasonBadgeText}>{dest.bestSeason}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Card Content */}
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.destName} numberOfLines={1}>
              {dest.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name="location-sharp" size={12} color={colors.muted} style={{ marginRight: 3 }} />
              <Text style={styles.destRegion} numberOfLines={1}>
                {dest.region}, {dest.country}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.destPriceLabel}>From</Text>
            <Text style={styles.destPriceValue}>₹{dest.avgDailyCost.toLocaleString('en-IN')}</Text>
            <Text style={styles.destPriceSub}>/ day</Text>
          </View>
        </View>

        {note ? (
          <View style={styles.destNoteWrap}>
            <Ionicons name="sparkles" size={12} color={colors.primary} />
            <Text style={styles.destNote} numberOfLines={1}>
              {note}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Empty({
  emoji,
  title,
  text,
  actionLabel,
  onAction,
}: {
  emoji: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl, paddingVertical: spacing.xxl }}>
      <LinearGradient colors={gradients.brandSoft} style={styles.emptyOrb}>
        <Text style={{ fontSize: 32 }}>{emoji}</Text>
      </LinearGradient>
      <Text style={[styles.sectionTitle, { marginTop: spacing.md, textAlign: 'center', fontSize: 16 }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20, maxWidth: 280, fontSize: 13 }}>
        {text}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} size="sm" style={{ marginTop: spacing.md, minWidth: 150 }} />
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchBar}>
      <View style={styles.searchIconWrap}>
        <Ionicons name="search" size={15} color={colors.primary} />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1, paddingVertical: 9, paddingHorizontal: 8, fontSize: 14, color: colors.text }}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  btnText: { fontSize: 13.5, fontWeight: '700', letterSpacing: 0.1 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 6, fontSize: 13 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14.5,
    color: colors.text,
  },
  error: { color: colors.danger, marginTop: 4, fontSize: 12.5, fontWeight: '600' },
  hint: { color: colors.muted, marginTop: 4, fontSize: 11.5, lineHeight: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowSoft,
  },
  banner: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: spacing.md,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: { ...typography.title, fontSize: 18, color: colors.text, fontWeight: '800' },
  sectionActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  sectionAction: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  destCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  destBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  destTopBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destBottomBar: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
  },
  seasonBadgeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    fontSize: 10.5,
  },
  destName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  destRegion: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '500',
  },
  destPriceLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  destPriceValue: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  destPriceSub: {
    color: colors.muted,
    fontSize: 10,
  },
  destNoteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  destNote: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  emptyOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    ...shadowSoft,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

