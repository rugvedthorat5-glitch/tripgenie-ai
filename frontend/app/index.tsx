import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { ready, user } = useAuth();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    // Return clean neutral background matching native splash so there is zero flicker
    return <View style={{ flex: 1, backgroundColor: '#E6F4FE' }} />;
  }

  return <Redirect href={user ? '/(tabs)/home' : '/(auth)/login'} />;
}

