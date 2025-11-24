
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface ParticleExplosionProps {
  x: number;
  y: number;
  color: string;
  onComplete: () => void;
}

const Particle: React.FC<{
  x: number;
  y: number;
  color: string;
  angle: number;
  delay: number;
}> = ({ x, y, color, angle, delay }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const distance = 50 + Math.random() * 50;
    const radians = (angle * Math.PI) / 180;

    translateX.value = withDelay(
      delay,
      withTiming(Math.cos(radians) * distance, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(Math.sin(radians) * distance, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      })
    );

    scale.value = withDelay(
      delay,
      withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  x,
  y,
  color,
  onComplete,
}) => {
  const particleCount = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: particleCount }).map((_, index) => (
        <Particle
          key={index}
          x={x}
          y={y}
          color={color}
          angle={(360 / particleCount) * index}
          delay={index * 20}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
