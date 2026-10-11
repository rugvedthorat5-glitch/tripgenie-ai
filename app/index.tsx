import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme';

export default function Index() {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 60 }}>🧭</Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 }}>TripGenie AI</Text>
        <View style={{ marginTop: 24 }}>
          <ActivityIndicator color="#fff" />
        </View>
      </LinearGradient>
    );
  }
  return <Redirect href={user ? '/(tabs)/home' : '/(auth)/login'} />;
}
