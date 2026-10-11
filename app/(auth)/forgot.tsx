import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Input } from '../../src/components/UI';
import { api, errorMessage, isNetworkError } from '../../src/services/api';
import { colors, spacing } from '../../src/theme';

export default function Forgot() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | 'sent' | 'demo'>(null);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setDone('sent');
    } catch (e) {
      if (isNetworkError(e)) setDone('demo');
      else setError(errorMessage(e, 'Could not send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + 24 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Forgot password?</Text>
      <Text style={{ color: colors.muted, marginTop: 4, marginBottom: spacing.xl }}>
        Enter your email and we will send you a link to reset it.
      </Text>

      {done ? (
        <Card style={{ backgroundColor: colors.chip }}>
          <Text style={{ fontWeight: '800', color: colors.primaryDark }}>
            {done === 'sent' ? 'Check your inbox' : 'Demo mode'}
          </Text>
          <Text style={{ color: colors.text, marginTop: 4, lineHeight: 21 }}>
            {done === 'sent'
              ? `If an account exists for ${email.trim()}, a reset link has been sent.`
              : 'The backend is not reachable, so no email was sent. Start the backend to use this feature.'}
          </Text>
        </Card>
      ) : (
        <>
          <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} error={error} />
          <Button title="Send reset link" onPress={submit} loading={loading} />
        </>
      )}

      <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: spacing.xl }}>
        Back to log in
      </Link>
    </ScrollView>
  );
}
