import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tw } from 'nativewind';
import Toast from 'react-native-toast-message';

export function Toast() {
  return (
    <Toast
      position="top"
      visibilityTime={4000}
      autoHide={true}
      topOffset={50}
      textStyle={StyleSheet.create({
        text: { fontSize: 16, fontWeight: '500' },
      }).text}
    />
  );
}