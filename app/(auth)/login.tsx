import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const setLoading = useAuthStore((state) => state.setLoading);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({ email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={tw`flex-1 bg-surface-50 dark:bg-surface-950`}>
      <View className={tw`flex-1 p-6 justify-center`}>
        <View className={tw`max-w-md mx-auto w-full`}>
          <View className={tw`text-center mb-10`}>
            <View className={tw`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-600 mb-4`}>
              <Ionicons name="chatbubbles" size={36} color="white" />
            </View>
            <Text className={tw`text-3xl font-bold text-surface-900 dark:text-surface-50`}>Welcome back</Text>
            <Text className={tw`mt-2 text-surface-500 dark:text-surface-400`}>Sign in to continue to Thoughts</Text>
          </View>

          <View className={tw`space-y-4`}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)} className={tw`p-2`}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#71717a"
                  />
                </Pressable>
              }
              autoComplete="password"
            />

            <View className={tw`flex-row items-center justify-between`}>
              <Pressable className={tw`flex-row items-center gap-2`}>
                <View className={tw`w-4 h-4 border-2 border-surface-300 dark:border-surface-600 rounded-sm`} />
                <Text className={tw`text-sm text-surface-600 dark:text-surface-400`}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => {}} className={tw`text-sm text-primary-600 dark:text-primary-400 font-medium`}>
                Forgot password?
              </Pressable>
            </View>

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              fullWidth
              size="lg"
              className={tw`mt-2`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </View>

          <View className={tw`mt-8 text-center`}>
            <Text className={tw`text-surface-500 dark:text-surface-400`}>
              Don't have an account?{' '}
              <Pressable
                onPress={() => {
                  // Navigate to signup
                }}
                className={tw`text-primary-600 dark:text-primary-400 font-semibold`}
              >
                Sign up
              </Pressable>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}