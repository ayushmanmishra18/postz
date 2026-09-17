import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />;
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#71717a',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} /> }} />
      <Tabs.Screen name="search" options={{ tabBarIcon: ({ focused, color }) => <TabIcon name="search" focused={focused} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ tabBarIcon: ({ focused, color }) => <TabIcon name="notifications" focused={focused} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} /> }} />
    </Tabs>
  );
}
