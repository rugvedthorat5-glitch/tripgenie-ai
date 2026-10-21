import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Input } from '../../src/components/UI';
import { api, errorMessage, isNetworkError } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const [email, setEmail] = useState(String(params.email || ''));
  const [token, setToken] = useState(String(params.token || ''));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email');
    if (token.trim().length < 10) return setError('Paste the reset token from your email / backend response');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        token: token.trim(),
        password,
      });
      setDone(true);
    } catch (e) {
      if (isNetworkError(e)) setError('Backend not reachable. Start the API to reset passwords.');
      else setError(errorMessage(e, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + 24 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Reset password</Text>
      <Text style={{ color: colors.muted, marginTop: 4, marginBottom: spacing.xl }}>
        Enter the token from your reset email (or the demo response from forgot-password).
      </Text>

      {done ? (
        <Card style={{ backgroundColor: colors.chip }}>
          <Text style={{ fontWeight: '800', color: colors.primaryDark }}>Password updated</Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>You can log in with your new password.</Text>
          <Button title="Go to login" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.md }} />
        </Card>
      ) : (
        <>
          <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Input label="Reset token" autoCapitalize="none" value={token} onChangeText={setToken} />
          <Input label="New password" secureTextEntry value={password} onChangeText={setPassword} error={error} />
          <Button title="Update password" onPress={submit} loading={loading} />
        </>
      )}

      <Link href="/(auth)/forgot" style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: spacing.xl }}>
        Request a new reset link
      </Link>
    </ScrollView>
  );
}
