import React from 'react';
import { Tabs } from 'expo-router';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';

const TabBarIcon = ({ name, focused, color, size = 24 }: any) => (
  <Ionicons name={focused ? name.replace('-outline', '') : name} size={size} color={color} />
);

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const { activeTab, setActiveTab } = useUIStore();

  if (!isAuthenticated) {
    return <Tabs screenOptions={{ headerShown: false }}><Tabs.Screen name="index" /></Tabs>;
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => <TabBarIcon name="home-outline" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => <TabBarIcon name="search-outline" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused, color }) => <TabBarIcon name="notifications-outline" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => <TabBarIcon name="person-outline" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}