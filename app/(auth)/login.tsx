import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
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
    <View className="flex-1 bg-surface-50 dark:bg-surface-950">
      <View className="flex-1 p-6 justify-center">
        <View className="max-w-md mx-auto w-full">

          <View className="items-center mb-10">
            <View className="items-center justify-center w-20 h-20 rounded-2xl bg-primary-600 mb-4">
              <Ionicons name="chatbubbles" size={36} color="white" />
            </View>

            <Text className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              Welcome back
            </Text>

            <Text className="mt-2 text-surface-500 dark:text-surface-400">
              Sign in to continue to Thoughts
            </Text>
          </View>

          <View className="space-y-4">

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
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={22}
                    color="#71717a"
                  />
                </Pressable>
              }
              autoComplete="password"
            />

            <View className="flex-row items-center justify-between">

              <Pressable className="flex-row items-center gap-2">
                <View className="w-4 h-4 border-2 border-surface-300 dark:border-surface-600 rounded-sm" />

                <Text className="text-sm text-surface-600 dark:text-surface-400">
                  Remember me
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/signup')}
              >
                <Text className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Forgot password?
                </Text>
              </Pressable>

            </View>

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              fullWidth
              size="lg"
              className="mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

          </View>

          <View className="mt-8 items-center">
            <Text className="text-surface-500 dark:text-surface-400">
              Don't have an account?{' '}
            </Text>

            <Pressable
              onPress={() => router.push('/signup')}
              className="mt-1"
            >
              <Text className="text-primary-600 dark:text-primary-400 font-semibold">
                Sign up
              </Text>
            </Pressable>
          </View>

        </View>
      </View>
    </View>
  );
}