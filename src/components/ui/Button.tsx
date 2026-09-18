import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary-600 text-white active:bg-primary-700 hover:bg-primary-700",
      secondary: "bg-surface-100 text-surface-900 active:bg-surface-200 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-50 dark:active:bg-surface-700 dark:hover:bg-surface-700",
      outline: "border-2 border-primary-600 text-primary-600 active:bg-primary-50 hover:bg-primary-50 dark:active:bg-primary-900/20 dark:hover:bg-primary-900/20",
      ghost: "text-primary-600 active:bg-primary-50 hover:bg-primary-50 dark:active:bg-primary-900/20 dark:hover:bg-primary-900/20",
      danger: "bg-red-600 text-white active:bg-red-700 hover:bg-red-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
    };

    const textVariants = {
      primary: "text-white",
      secondary: "text-surface-900 dark:text-surface-50",
      outline: "text-primary-600",
      ghost: "text-primary-600",
      danger: "text-white",
    };

    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        style={style}
        {...props}
      >
        {loading ? (
          <View className={"flex-row items-center justify-center gap-2"}>
            <Text className={`text-xs ${textVariants[variant]}`}>Loading...</Text>
          </View>
        ) : (
          <View className={"flex-row items-center justify-center gap-2"}>
            {leftIcon && <View className={"flex-shrink-0"}>{leftIcon}</View>}
            <Text className={`font-medium ${textVariants[variant]}`}>{children}</Text>
            {rightIcon && <View className={"flex-shrink-0"}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
