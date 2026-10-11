import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

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
    if (name.trim().length < 2) return setError('Enter your name');
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Create account</Text>
        <Text style={{ color: colors.muted, marginBottom: spacing.xl, marginTop: 4 }}>
          Tell us a bit about you and we will tailor trips to your taste.
        </Text>
        <Input label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
        <Input
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input label="Password" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
        <Input label="Confirm password" placeholder="Repeat password" secureTextEntry value={confirm} onChangeText={setConfirm} />
        {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}
        <Button title="Sign up" onPress={submit} loading={loading} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.muted }}>Already registered? </Text>
          <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '700' }}>
            Log in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
