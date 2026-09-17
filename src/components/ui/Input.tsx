import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { tw } from 'nativewind';
import { useId } from 'react';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      style,
      secureTextEntry = false,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <View className={tw`w-full ${containerClassName}`}>
        {label && (
          <Text
            id={`${id}-label`}
            className={tw`block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5`}
          >
            {label}
          </Text>
        )}
        <View className={tw`relative`}>
          {leftIcon && (
            <View className={tw`absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500`}>
              {leftIcon}
            </View>
          )}
          <TextInput
            ref={ref}
            id={id}
            secureTextEntry={secureTextEntry}
            className={tw`
              w-full
              px-4 py-3
              bg-white dark:bg-surface-900
              border-2 border-surface-200 dark:border-surface-700
              rounded-xl
              text-surface-900 dark:text-surface-50
              placeholder:text-surface-400 dark:placeholder:text-surface-500
              font-medium
              focus:border-primary-500 focus:outline-none
              disabled:bg-surface-100 dark:disabled:bg-surface-800
              disabled:text-surface-500 dark:disabled:text-surface-400
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            style={style}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {rightIcon && (
            <View className={tw`absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500`}>
              {rightIcon}
            </View>
          )}
        </View>
        {error && (
          <Text id={errorId} className={tw`mt-1.5 text-sm text-red-600 dark:text-red-400`} role="alert">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text id={helperId} className={tw`mt-1.5 text-sm text-surface-500 dark:text-surface-400`}>
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';