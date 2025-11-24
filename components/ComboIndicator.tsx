
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ComboIndicatorProps {
  combo: number;
}

export const ComboIndicator: React.FC<ComboIndicatorProps> = ({ combo }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(combo > 0 ? 1 : 0);

  useEffect(() => {
    if (combo > 0) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (combo < 2) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.comboText}>COMBO</Text>
      <Text style={styles.comboNumber}>x{combo}</Text>
      <View style={styles.flames}>
        <Text style={styles.flame}>🔥</Text>
        {combo >= 5 && <Text style={styles.flame}>🔥</Text>}
        {combo >= 10 && <Text style={styles.flame}>🔥</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? height * 0.18 : height * 0.17,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.95)',
    paddingHorizontal: Math.min(width * 0.06, 24),
    paddingVertical: Math.min(height * 0.015, 12),
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    boxShadow: '0px 4px 12px rgba(255, 69, 0, 0.6)',
    elevation: 10,
    zIndex: 150,
  },
  comboText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  comboNumber: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  flames: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  flame: {
    fontSize: Math.min(width * 0.05, 20),
    marginHorizontal: 2,
  },
});
