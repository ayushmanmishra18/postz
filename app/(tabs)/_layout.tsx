import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const outline = (name + '-outline') as IconName;
  return <Ionicons name={focused ? name : outline} size={23} color={color} />;
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const insets = useSafeAreaInsets();
  if (!hasHydrated) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#0ea5e9" /></View>;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: '#0284c7',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarStyle: {
      height: 56 + insets.bottom,
      paddingTop: 8,
      paddingBottom: 8 + insets.bottom,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      backgroundColor: '#ffffff',
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({focused,color}) => <TabIcon name="home" focused={focused} color={color}/> }} />
    <Tabs.Screen name="search" options={{ title: 'Discover', tabBarIcon: ({focused,color}) => <TabIcon name="search" focused={focused} color={color}/> }} />
    <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: ({focused,color}) => <TabIcon name="notifications" focused={focused} color={color}/> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({focused,color}) => <TabIcon name="person" focused={focused} color={color}/> }} />
  </Tabs>;
}