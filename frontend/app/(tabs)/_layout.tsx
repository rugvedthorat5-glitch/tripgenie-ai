import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import type { ColorValue } from 'react-native';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  icon: IconName;
  iconOutline: IconName;
  focused: boolean;
  color: ColorValue;
}

function AnimatedTabIcon({ icon, iconOutline, focused, color }: TabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1.18,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1.0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(dotScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.0,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={focused ? icon : iconOutline}
          size={focused ? 23 : 21}
          color={color as string}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.activeDot,
          {
            transform: [{ scale: dotScale }],
            opacity: dotScale,
          },
        ]}
      />
    </View>
  );
}

const tab = (title: string, icon: IconName, iconOutline: IconName) => ({
  title,
  tabBarLabel: title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <AnimatedTabIcon
      icon={icon}
      iconOutline={iconOutline}
      focused={focused}
      color={color}
    />
  ),
});

export default function TabsLayout() {
  const { ready, user } = useAuth();
  const insets = useSafeAreaInsets();
  if (ready && !user) return <Redirect href="/(auth)/login" />;

  const bottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '800',
          color: colors.text,
          fontSize: 17,
          letterSpacing: -0.3,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.92)' : '#FFFFFF',
          borderTopColor: 'rgba(226, 232, 240, 0.8)',
          borderTopWidth: StyleSheet.hairlineWidth * 1.5,
          height: 56 + bottom,
          paddingBottom: bottom - 2,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#0F172A',
              shadowOpacity: 0.08,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -3 },
            },
            android: {
              elevation: 8,
            },
          }),
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          ...tab('Home', 'home', 'home-outline'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          ...tab('Explore', 'compass', 'compass-outline'),
          title: 'Explore India',
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          ...tab('AI Plan', 'sparkles', 'sparkles-outline'),
          title: 'AI Trip Planner',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          ...tab('Trips', 'bookmark', 'bookmark-outline'),
          title: 'My Journeys',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          ...tab('Profile', 'person', 'person-outline'),
          title: 'My Account',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    width: 36,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  tabBarLabel: {
    fontSize: 10.5,
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
