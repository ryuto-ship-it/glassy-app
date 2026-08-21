import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

// Gives every tab a soft fade + rise whenever it regains focus, so
// switching tabs feels like a transition instead of an instant swap.
export function TabFade({ children, style }: Props) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0;
      translateY.value = 14;
      opacity.value = withTiming(1, { duration: 280 });
      translateY.value = withTiming(0, { duration: 280 });
    }
  }, [isFocused, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[{ flex: 1 }, animStyle, style]}>{children}</Animated.View>;
}
