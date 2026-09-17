import 'nativewind';
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module 'nativewind' {
  export function tw(strings: TemplateStringsArray, ...values: any[]): string;
  export function tw(str: string): string;
}