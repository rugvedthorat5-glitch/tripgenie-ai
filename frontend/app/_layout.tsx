import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { DestinationsProvider } from '../src/context/DestinationsContext';
import { ExtrasProvider } from '../src/context/ExtrasContext';
import { TripsProvider } from '../src/context/TripsContext';
import { colors } from '../src/theme';

// Keep native splash screen visible until initial auth hydration is complete
SplashScreen.preventAutoHideAsync().catch(() => {});

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'travel-clean-web-reset';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      * {
        outline: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      *:focus, *:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
      div[role="tab"], div[role="button"], button, a {
        outline: none !important;
        border-color: transparent;
      }
      div[role="tab"]:focus, div[role="tab"]:focus-visible {
        outline: none !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}


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
              headerTitleStyle: { fontWeight: '800', color: colors.text, fontSize: 17 },
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="destination/[id]" options={{ title: 'Destination' }} />
            <Stack.Screen name="itinerary/[id]" options={{ title: 'Your itinerary' }} />
            <Stack.Screen name="chat" options={{ title: 'Atlas — AI Assistant' }} />
            <Stack.Screen name="budget" options={{ title: 'Smart budget planner' }} />
            <Stack.Screen name="preferences" options={{ title: 'Travel preferences' }} />
            <Stack.Screen name="weather" options={{ title: 'Weather' }} />
            <Stack.Screen name="map" options={{ title: 'Maps & nearby' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="admin" options={{ title: 'Admin — Shraddha Pethkar' }} />
          </Stack>
        </TripsProvider>
        </ExtrasProvider>
        </DestinationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
