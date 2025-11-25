
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
  interpolate,
} from 'react-native-reanimated';
import { Orb } from '@/types/game';

interface GameOrbProps {
  orb: Orb;
  onPress: (orb: Orb) => void;
}

export const GameOrb = React.memo<GameOrbProps>(({ orb, onPress }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const ghostOpacity = useSharedValue(1);
  const rainbowHue = useSharedValue(0);
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

    // Ghost orb fading effect
    if (orb.type === 'ghost') {
      ghostOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }

    // Rainbow orb color cycling
    if (orb.type === 'rainbow') {
      rainbowHue.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [orb.type]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: floatY.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value * (orb.type === 'ghost' ? ghostOpacity.value : 1),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
      opacity: opacity.value * 0.4,
    };
  });

  const rainbowStyle = useAnimatedStyle(() => {
    if (orb.type !== 'rainbow') return {};
    
    const hue = rainbowHue.value;
    return {
      backgroundColor: `hsl(${hue}, 100%, 50%)`,
    };
  });

  const handlePress = () => {
    if (hasBeenPressed.current) {
      console.log('Orb already pressed, ignoring');
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
      case 'shrink':
        return '🔻';
      case 'giant':
        return '🔺';
      case 'rainbow':
        return '🌈';
      case 'ghost':
        return '👻';
      default:
        return '';
    }
  };

  const getOrbBorderColor = () => {
    switch (orb.type) {
      case 'shrink':
        return '#9C27B0';
      case 'giant':
        return '#FF5722';
      case 'rainbow':
        return '#FFFFFF';
      case 'ghost':
        return '#9E9E9E';
      default:
        return 'rgba(255, 255, 255, 0.5)';
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
      {(orb.type === 'bonus' || orb.type === 'multiplier' || orb.type === 'rainbow') && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: orb.size * 1.4,
              height: orb.size * 1.4,
              borderRadius: (orb.size * 1.4) / 2,
              backgroundColor: orb.type === 'rainbow' ? '#FF1744' : orb.color,
            },
            glowStyle,
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.orb,
          orb.type === 'rainbow' ? {} : { backgroundColor: orb.color },
          {
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
            borderWidth: orb.type !== 'normal' ? 3 : 0,
            borderColor: getOrbBorderColor(),
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Rainbow animated background */}
        {orb.type === 'rainbow' && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: orb.size / 2,
              },
              rainbowStyle,
            ]}
          />
        )}

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

        {/* Special indicators */}
        {orb.type === 'shrink' && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>TINY</Text>
          </View>
        )}
        {orb.type === 'giant' && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>HUGE</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

GameOrb.displayName = 'GameOrb';

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
  specialBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  specialText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});
