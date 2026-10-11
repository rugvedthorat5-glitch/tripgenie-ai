import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName, iconOutline: IconName) => ({
  title,
  tabBarLabel: title,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? icon : iconOutline} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { ready, user } = useAuth();
  if (ready && !user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ ...tab('Home', 'home', 'home-outline'), headerShown: false }} />
      <Tabs.Screen name="explore" options={{ ...tab('Explore', 'compass', 'compass-outline'), title: 'Explore' }} />
      <Tabs.Screen name="planner" options={{ ...tab('Plan', 'sparkles', 'sparkles-outline'), title: 'AI Trip Planner' }} />
      <Tabs.Screen name="trips" options={{ ...tab('Trips', 'bookmark', 'bookmark-outline'), title: 'My Trips' }} />
      <Tabs.Screen name="profile" options={{ ...tab('Profile', 'person', 'person-outline'), title: 'Profile' }} />
    </Tabs>
  );
}
