import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try { await forgotPassword({ email: email.trim().toLowerCase() }); }
    catch { /* handled by forgotPasswordMutation's onError toast */ }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1 justify-center px-6">
        <View className="w-full max-w-md self-center bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-8">
            <Ionicons name="arrow-back" size={22} color="#475569" />
          </Pressable>
          <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mb-5">
            <Ionicons name="lock-closed-outline" size={28} color="#0284c7" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">Reset your password</Text>
          <Text className="mt-2 mb-7 text-slate-500">Enter your email and we'll send reset instructions.</Text>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
          <Button className="mt-5" fullWidth size="lg" disabled={loading} onPress={submit}>{loading ? 'Sending...' : 'Send reset link'}</Button>
          <Pressable onPress={() => router.replace('/login')} className="mt-5 items-center">
            <Text className="font-semibold text-primary-600">Back to sign in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
