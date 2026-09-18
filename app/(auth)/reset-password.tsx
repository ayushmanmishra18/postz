import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword } = useAuth();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!token || password.length < 8 || password !== confirm) return;
    setLoading(true);
    try {
      await resetPassword({ token, password });
      router.replace('/login');
    } catch {
      // handled by resetPasswordMutation's onError toast
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1 justify-center px-6">
        <View className="w-full max-w-md self-center bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">Choose a new password</Text>
          <Text className="mt-2 mb-7 text-slate-500">Use at least 8 characters.</Text>
          <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <Input label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="••••••••" containerClassName="mt-4" error={confirm && password !== confirm ? 'Passwords do not match' : undefined} />
          <Button className="mt-5" fullWidth size="lg" disabled={loading || !token || password.length < 8 || password !== confirm} onPress={submit}>{loading ? 'Updating...' : 'Update password'}</Button>
          <Pressable onPress={() => router.replace('/login')} className="mt-5 items-center"><Text className="font-semibold text-primary-600">Back to sign in</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
