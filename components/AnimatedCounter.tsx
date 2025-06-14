import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: any;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
  style,
  decimals = 0,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration }, () => {
      runOnJS(setDisplayValue)(
        prefix + value.toFixed(decimals) + suffix
      );
    });
  }, [value, duration, decimals, suffix, prefix]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentValue = interpolate(
      animatedValue.value,
      [0, value],
      [0, value]
    );
    
    runOnJS(setDisplayValue)(
      prefix + currentValue.toFixed(decimals) + suffix
    );

    return {
      opacity: withTiming(1, { duration: 300 }),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.counter, style]}>{displayValue}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1e293b',
  },
});