import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { colors, gradients, radius, spacing } from '../../src/theme';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (name.trim().length < 2) return setError('Enter your full name');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      router.replace('/preferences');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 28, paddingBottom: 48, paddingHorizontal: spacing.xl }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>JOIN TRIPGENIE</Text>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8, letterSpacing: -0.4 }}>Create your travel space</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 21, fontSize: 15 }}>
            One account for plans, favourites, budget tips and Atlas — built for students, families and explorers.
          </Text>
        </LinearGradient>

        <View
          style={{
            flex: 1,
            marginTop: -24,
            backgroundColor: colors.bg,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.xl,
            paddingBottom: spacing.xxl,
          }}
        >
          <Input label="Full name" placeholder="Your name" leftIcon="person-outline" value={name} onChangeText={setName} />
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="mail-outline"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            secureToggle
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            hint="A mix of letters and numbers keeps your trips safer"
          />
          <Input
            label="Confirm password"
            placeholder="Repeat password"
            secureTextEntry
            secureToggle
            leftIcon="shield-checkmark-outline"
            value={confirm}
            onChangeText={setConfirm}
          />
          {error ? <Banner title="Couldn't create account" text={error} tone="warn" /> : null}
          <Button title="Create account" icon="arrow-forward" onPress={submit} loading={loading} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
            <Text style={{ color: colors.muted }}>Already registered? </Text>
            <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '800' }}>
              Log in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
