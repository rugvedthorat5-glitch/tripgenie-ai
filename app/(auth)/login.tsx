import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radius, spacing } from '../../src/theme';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{ paddingTop: insets.top + 40, paddingBottom: 50, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 56 }}>🧭</Text>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 6 }}>TripGenie AI</Text>
          <Text style={{ color: '#D7F0F2', marginTop: 4 }}>Personalised trips, planned by AI</Text>
        </LinearGradient>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.bg,
            marginTop: -24,
            borderTopLeftRadius: radius.lg + 8,
            borderTopRightRadius: radius.lg + 8,
            padding: spacing.xl,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.lg }}>
            Welcome back
          </Text>
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
          />
          <Link href="/(auth)/forgot" style={{ color: colors.primary, fontWeight: '600', textAlign: 'right', marginBottom: spacing.md }}>
            Forgot password?
          </Link>
          {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}
          <Button title="Log in" onPress={submit} loading={loading} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
            <Text style={{ color: colors.muted }}>New here? </Text>
            <Link href="/(auth)/register" style={{ color: colors.primary, fontWeight: '700' }}>
              Create an account
            </Link>
          </View>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: spacing.xl, fontSize: 12 }}>
            If the backend is not running, the app opens in demo mode so you can still test every screen.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
