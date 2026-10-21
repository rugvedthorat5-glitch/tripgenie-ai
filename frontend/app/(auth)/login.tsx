import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radius, shadowLift, shadowSoft, spacing } from '../../src/theme';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError('Please enter a valid email address');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'demo' | 'admin') => {
    setError('');
    if (type === 'demo') {
      setEmail('demo@tripgenie.com');
      setPassword('Demo@12345');
    } else {
      setEmail('admin@tripgenie.com');
      setPassword('Admin@12345');
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/hero-bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(5, 20, 28, 0.45)',
            'rgba(6, 26, 36, 0.82)',
            'rgba(6, 26, 36, 0.96)',
          ]}
          style={styles.gradientOverlay}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollInner,
              { paddingTop: insets.top + (isDesktop ? 48 : 24) },
              isDesktop && styles.scrollInnerDesktop,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Hero Area */}
            <View style={[styles.heroHeader, isDesktop && styles.heroHeaderDesktop]}>
              <View style={styles.brandTitleRow}>
                <View style={styles.brandIconBox}>
                  <LinearGradient
                    colors={['#14A8B5', '#0C7A86']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.brandIconGradient}
                  >
                    <Ionicons name="compass" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.brandName}>TripGenie</Text>
                    <View style={styles.aiTag}>
                      <Text style={styles.aiTagText}>AI</Text>
                    </View>
                  </View>
                  <Text style={styles.brandSub}>Your Personal Travel Companion</Text>
                </View>
              </View>
            </View>

            {/* Simple, Clean Form Card */}
            <View style={[styles.authCard, isDesktop && styles.authCardDesktop]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSubtitle}>
                  Sign in to plan your trips and view your saved itineraries.
                </Text>
              </View>

              {/* Error Banner */}
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#E11D48" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email address</Text>
                <View
                  style={[
                    styles.modernInputBox,
                    emailFocused && styles.modernInputBoxFocused,
                  ]}
                >
                  <View style={[styles.inputIconCircle, emailFocused && styles.inputIconCircleFocused]}>
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={emailFocused ? colors.primary : '#64748B'}
                    />
                  </View>
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    style={styles.fieldInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                  {email ? (
                    <Pressable onPress={() => setEmail('')} hitSlop={8} style={{ padding: 4 }}>
                      <Ionicons name="close-circle" size={17} color="#CBD5E1" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <View style={styles.passwordHeaderRow}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <Link href="/(auth)/forgot" style={styles.forgotPasswordLink}>
                    Forgot password?
                  </Link>
                </View>
                <View
                  style={[
                    styles.modernInputBox,
                    passwordFocused && styles.modernInputBoxFocused,
                  ]}
                >
                  <View style={[styles.inputIconCircle, passwordFocused && styles.inputIconCircleFocused]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color={passwordFocused ? colors.primary : '#64748B'}
                    />
                  </View>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    style={styles.fieldInput}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onSubmitEditing={submit}
                  />
                  <Pressable
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={8}
                    style={{ padding: 6 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={showPassword ? colors.primary : '#94A3B8'}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Quick Fill Helper */}
              <View style={styles.quickFillRow}>
                <Text style={styles.quickFillLabel}>Quick login:</Text>
                <Pressable
                  onPress={() => handleFillDemo('demo')}
                  style={({ pressed }) => [
                    styles.quickFillBtn,
                    email === 'demo@tripgenie.com' && styles.quickFillBtnActive,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Ionicons name="person-outline" size={13} color="#0C7A86" />
                  <Text style={styles.quickFillBtnText}>User</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleFillDemo('admin')}
                  style={({ pressed }) => [
                    styles.quickFillBtn,
                    email === 'admin@tripgenie.com' && styles.quickFillBtnActive,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Ionicons name="shield-outline" size={13} color="#D97706" />
                  <Text style={styles.quickFillBtnText}>Admin</Text>
                </Pressable>
              </View>

              {/* Primary Sign In Button */}
              <Pressable
                onPress={submit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.actionButtonWrap,
                  pressed && { transform: [{ scale: 0.985 }] },
                  loading && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={['#0C7A86', '#129BB3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.actionButtonContent}>
                      <Text style={styles.actionButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Create Account Link */}
              <View style={styles.bottomLinkContainer}>
                <Text style={styles.bottomLinkMuted}>Don't have an account? </Text>
                <Link href="/(auth)/register" style={styles.bottomLinkHighlight}>
                  Create an account
                </Link>
              </View>
            </View>
          </ScrollView>

        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071A24',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollInner: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  scrollInnerDesktop: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  heroHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroHeaderDesktop: {
    maxWidth: 440,
    width: '100%',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadowSoft,
  },
  brandIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  aiTag: {
    backgroundColor: '#2DD4BF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  aiTagText: {
    color: '#042F2E',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  brandSub: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...shadowLift,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  authCardDesktop: {
    maxWidth: 440,
    width: '100%',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 19,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE4E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDA4AF',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#BE123C',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  modernInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  modernInputBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    ...shadowSoft,
  },
  inputIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputIconCircleFocused: {
    backgroundColor: '#E6F7F8',
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 10,
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quickFillLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickFillBtnActive: {
    backgroundColor: '#E6F7F8',
    borderColor: colors.primary,
  },
  quickFillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  actionButtonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    ...shadowLift,
    marginBottom: 16,
  },
  actionButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomLinkMuted: {
    fontSize: 13.5,
    color: '#64748B',
  },
  bottomLinkHighlight: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
  },
  offlineDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 12,
  },
  offlineDemoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    marginBottom: 8,
  },
  serverConfigToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  serverConfigBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  serverConfigLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  serverConfigInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#0F172A',
  },
  serverConfigSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  serverConfigSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  serverConfigResetBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  serverConfigResetBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  serverConfigMsg: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
    marginTop: 6,
  },
  serverConfigHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 15,
  },
});
