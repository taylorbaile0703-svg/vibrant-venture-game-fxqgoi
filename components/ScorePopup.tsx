
import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ScorePopupProps {
  x: number;
  y: number;
  points: number;
  multiplier: number;
  onComplete: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  x,
  y,
  points,
  multiplier,
  onComplete,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withTiming(-80, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
    );

    scale.value = withSequence(
      withTiming(1.2, { duration: 150, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) })
    );

    const timer = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const totalPoints = points * multiplier;
  const isNegative = totalPoints < 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Text
        style={[
          styles.text,
          {
            color: isNegative ? '#FF0000' : multiplier > 1 ? '#FFD700' : '#00FF00',
          },
        ]}
      >
        {isNegative ? '' : '+'}
        {totalPoints}
        {multiplier > 1 && ` (x${multiplier})`}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1001,
  },
  text: {
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
