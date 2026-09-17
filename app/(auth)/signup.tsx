import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { tw } from '@/lib/tw';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const setLoading = useAuthStore((state) => state.setLoading);
  const [formData, setFormData] = React.useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register({
        displayName: formData.displayName.trim(),
        username: formData.username.toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View className={tw`flex-1 bg-slate-50 dark:bg-slate-950`}>
      <View className={tw`flex-1 p-6 justify-center`}>
        <View className={tw`max-w-md mx-auto w-full`}>
          <View className={tw`text-center mb-10`}>
            <View className={tw`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-600 mb-4`}>
              <Ionicons name="chatbubbles" size={36} color="white" />
            </View>
            <Text className={tw`text-3xl font-bold text-surface-900 dark:text-surface-50`}>Create account</Text>
            <Text className={tw`mt-2 text-surface-500 dark:text-surface-400`}>Join Thoughts and share your ideas</Text>
          </View>

          <View className={tw`space-y-4`}>
            <Input
              label="Display Name"
              value={formData.displayName}
              onChangeText={(v) => handleChange('displayName', v)}
              placeholder="John Doe"
              error={errors.displayName}
              autoCapitalize="words"
            />

            <Input
              label="Username"
              value={formData.username}
              onChangeText={(v) => handleChange('username', v.toLowerCase())}
              placeholder="@username"
              error={errors.username}
              autoCapitalize="none"
              leftIcon={<Text className={tw`text-surface-400`}>@</Text>}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChangeText={(v) => handleChange('email', v.toLowerCase())}
              placeholder="you@example.com"
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChangeText={(v) => handleChange('password', v)}
              placeholder="••••••••"
              error={errors.password}
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
              autoComplete="new-password"
              helperText="At least 8 characters"
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              placeholder="••••••••"
              error={errors.confirmPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />

            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              fullWidth
              size="lg"
              className={tw`mt-2`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </View>

          <View className={tw`mt-8 text-center`}>
            <Text className={tw`text-surface-500 dark:text-surface-400`}>
              Already have an account?{' '}
              <Pressable
                onPress={() => router.push('/login')}
                className={tw`text-primary-600 dark:text-primary-400 font-semibold`}
              >
                Sign in
              </Pressable>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}