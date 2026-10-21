import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
  brand?: boolean;
};

/** Shared layout for login / register / forgot / reset — clean, standard-app style. */
export function AuthShell({ title, subtitle, children, footer, showBack = false, brand = true }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (showBack ? 8 : 20),
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
      >
        {showBack ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        {brand ? (
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Ionicons name="compass" size={22} color="#fff" />
            </View>
            <Text style={styles.brand}>TripGenie AI</Text>
          </View>
        ) : null}

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function AuthSuccess({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <View style={styles.successBox}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={styles.successText}>{text}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
    marginLeft: -4,
    gap: 2,
  },
  backText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 4,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  body: { marginTop: 22 },
  footer: { marginTop: 'auto', paddingTop: 28 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },
  successBox: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  successText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 21,
    fontSize: 14.5,
  },
});
