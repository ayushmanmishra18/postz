import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';

export default function Layout() {
  const { isAuthenticated } = useAuth();
  const { activeTab, setActiveTab } = useUIStore();

  if (!isAuthenticated) {
    return (
      <View className={tw`flex-1`}>
        <Stack.Screen name="login" />
      </View>
    );
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
          tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}