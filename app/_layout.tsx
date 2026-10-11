import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { DestinationsProvider } from '../src/context/DestinationsContext';
import { ExtrasProvider } from '../src/context/ExtrasContext';
import { TripsProvider } from '../src/context/TripsContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DestinationsProvider>
        <ExtrasProvider>
        <TripsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerTintColor: colors.primaryDark,
              headerStyle: { backgroundColor: colors.bg },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="destination/[id]" options={{ title: 'Destination' }} />
            <Stack.Screen name="itinerary/[id]" options={{ title: 'Your itinerary' }} />
            <Stack.Screen name="chat" options={{ title: 'AI Travel Assistant' }} />
            <Stack.Screen name="budget" options={{ title: 'Budget planner' }} />
            <Stack.Screen name="preferences" options={{ title: 'Travel preferences' }} />
            <Stack.Screen name="weather" options={{ title: 'Weather' }} />
            <Stack.Screen name="map" options={{ title: 'Maps' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="admin" options={{ title: 'Admin panel' }} />
          </Stack>
        </TripsProvider>
        </ExtrasProvider>
        </DestinationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
