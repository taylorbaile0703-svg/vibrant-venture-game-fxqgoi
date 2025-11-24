
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
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
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const hasBeenPressed = useRef(false);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    // Continuous floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Continuous rotation for special orbs
    if (orb.type !== 'normal') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }

    // Pulsing glow effect for special orbs
    if (orb.type === 'bonus' || orb.type === 'multiplier') {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: floatY.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
      opacity: opacity.value * 0.4,
    };
  });

  const handlePress = () => {
    if (hasBeenPressed.current) {
      return;
    }
    hasBeenPressed.current = true;

    // Explosive tap animation
    scale.value = withSequence(
      withTiming(1.3, { duration: 80, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onPress)(orb);
        }
      })
    );
    opacity.value = withTiming(0, { duration: 150 });
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

  const getOrbGradient = () => {
    switch (orb.type) {
      case 'bonus':
        return ['#FFD700', '#FFA500'];
      case 'bomb':
        return ['#FF0000', '#8B0000'];
      case 'freeze':
        return ['#00BCD4', '#0097A7'];
      case 'multiplier':
        return ['#FF6F00', '#E65100'];
      default:
        return [orb.color, orb.color];
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
      {/* Glow effect for special orbs */}
      {(orb.type === 'bonus' || orb.type === 'multiplier') && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: orb.size * 1.4,
              height: orb.size * 1.4,
              borderRadius: (orb.size * 1.4) / 2,
              backgroundColor: orb.color,
            },
            glowStyle,
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.orb,
          {
            backgroundColor: orb.color,
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
            borderWidth: orb.type !== 'normal' ? 3 : 0,
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Inner shine effect */}
        <View
          style={[
            styles.shine,
            {
              width: orb.size * 0.4,
              height: orb.size * 0.4,
              borderRadius: (orb.size * 0.4) / 2,
            },
          ]}
        />

        {orb.type !== 'normal' && (
          <Text style={[styles.orbIcon, { fontSize: orb.size * 0.45 }]}>
            {getOrbIcon()}
          </Text>
        )}

        {/* Points indicator for bonus orbs */}
        {orb.type === 'bonus' && (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+{orb.points}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  orbContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.4)',
    elevation: 8,
  },
  glow: {
    position: 'absolute',
    zIndex: -1,
  },
  shine: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  orbIcon: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
  },
});
