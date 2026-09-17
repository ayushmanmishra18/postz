import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Toast as ToastHost } from '@/components/Toast';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <ToastHost />
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();
  const hasHydrated = require('@/store/authStore').useAuthStore((state: any) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
