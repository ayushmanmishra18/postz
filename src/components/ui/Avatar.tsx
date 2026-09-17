import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { tw } from '@/lib/tw';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof View> {
  source?: string | { uri: string } | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'rounded';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-surface-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ source, name, size = 'md', shape = 'circle', status, className = '', style, ...props }, ref) => {
    const sizeClass = sizeClasses[size];
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
    const bgColor = name ? getColorFromName(name) : 'bg-surface-300 dark:bg-surface-600';

    return (
      <View ref={ref} className={tw`relative inline-flex ${className}`} style={style} {...props}>
        {source ? (
          <Image
            source={source}
            className={tw`${sizeClass} ${shapeClass} bg-cover`}
            style={{ borderRadius: shape === 'circle' ? 9999 : 12 }}
          />
        ) : (
          <View className={tw`${sizeClass} ${shapeClass} ${bgColor} items-center justify-center flex-shrink-0`}>
            <View className={tw`text-white font-medium`}>
              {name ? getInitials(name) : '?'}
            </View>
          </View>
        )}
        {status && (
          <View
            className={tw`
              absolute bottom-0 right-0 border-2 border-white dark:border-surface-900 ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
              ${statusSizes[size]} ${statusColors[status]}
            `}
            aria-label={`Status: ${status}`}
          />
        )}
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';