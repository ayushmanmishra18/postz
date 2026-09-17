import React from 'react';

import ToastView from 'react-native-toast-message';

export function Toast() {
  return (
    <ToastView
      position="top"
      visibilityTime={4000}
      autoHide={true}
      topOffset={50}
    />
  );
}