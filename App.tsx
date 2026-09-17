import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Thoughts App</Text>
    </View>
  );
}