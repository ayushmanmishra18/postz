import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { NativeWindStyleSheet } from 'nativewind';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Toast as ToastHost } from '@/components/Toast';
import { useAuthStore } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';

NativeWindStyleSheet.setOutput({
  default: 'native',
  web: 'css',
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <ToastHost />
    </QueryClientProvider>
  );
}

function RootNavigator() {
  useRealtime();
  const { isAuthenticated } = useAuth();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
