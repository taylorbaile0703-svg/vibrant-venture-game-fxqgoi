
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Orb } from '@/types/game';

interface GameOrbProps {
  orb: Orb;
  onPress: (orb: Orb) => void;
}

export const GameOrb: React.FC<GameOrbProps> = ({ orb, onPress }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const hasBeenPressed = useRef(false);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (hasBeenPressed.current) {
      return;
    }
    hasBeenPressed.current = true;

    scale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onPress)(orb);
        }
      })
    );
    opacity.value = withTiming(0, { duration: 200 });
  };

  const getOrbIcon = () => {
    switch (orb.type) {
      case 'bonus':
        return '⭐';
      case 'bomb':
        return '💣';
      case 'freeze':
        return '❄️';
      case 'multiplier':
        return '✨';
      default:
        return '';
    }
  };

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          left: orb.x,
          top: orb.y,
          width: orb.size,
          height: orb.size,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.orb,
          {
            backgroundColor: orb.color,
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {orb.type !== 'normal' && (
          <Text style={[styles.orbIcon, { fontSize: orb.size * 0.4 }]}>{getOrbIcon()}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  orbContainer: {
    position: 'absolute',
  },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  orbIcon: {
    fontSize: 24,
  },
});
