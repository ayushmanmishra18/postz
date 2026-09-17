import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((state) => state.setLoading);
  const { refetchUser } = useAuth();

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        await refetchUser();
      } catch {
        // No valid session; continue as signed out.
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refetchUser, setLoading]);

  return <>{children}</>;
}
