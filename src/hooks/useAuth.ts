import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, User } from '@/types';
import Toast from 'react-native-toast-message';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, logout, updateUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: me, refetch } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 10,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: `Hello, ${data.user.displayName}` });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Login failed', text2: error.response?.data?.error || 'Invalid credentials' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      Toast.show({ type: 'success', text1: 'Account created!', text2: `Welcome to Thoughts, ${data.user.displayName}` });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: error.response?.data?.error || 'Please try again' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await logout();
      queryClient.clear();
      Toast.show({ type: 'success', text1: 'Logged out', text2: 'See you soon!' });
    },
    onError: async () => {
      await logout();
      queryClient.clear();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Email sent', text2: 'Check your inbox for reset instructions' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Failed', text2: error.response?.data?.error || 'Please try again' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Password reset', text2: 'You can now login with your new password' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Reset failed', text2: error.response?.data?.error || 'Invalid or expired token' });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(updatedUser.username) });
      Toast.show({ type: 'success', text1: 'Profile updated', text2: 'Changes saved successfully' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Update failed', text2: error.response?.data?.error || 'Please try again' });
    },
  });

  return {
    user: me || user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    refetchUser: refetch,
  };
}