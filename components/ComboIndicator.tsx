
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, ScaledSize } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface ComboIndicatorProps {
  combo: number;
}

export const ComboIndicator: React.FC<ComboIndicatorProps> = ({ combo }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(combo > 0 ? 1 : 0);

  // Use state for dimensions to make them reactive
  const [dimensions, setDimensions] = useState(() => {
    const window = Dimensions.get('window');
    return {
      width: window.width,
      height: window.height,
    };
  });

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

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

  const comboTextFontSize = Math.min(dimensions.width * 0.04, 16);
  const comboNumberFontSize = Math.min(dimensions.width * 0.08, 32);
  const flameFontSize = Math.min(dimensions.width * 0.05, 20);
  const topPosition = Platform.OS === 'android' ? dimensions.height * 0.18 : dimensions.height * 0.17;
  const paddingHorizontal = Math.min(dimensions.width * 0.06, 24);
  const paddingVertical = Math.min(dimensions.height * 0.015, 12);

  return (
    <Animated.View style={[
      styles.container,
      {
        top: topPosition,
        paddingHorizontal: paddingHorizontal,
        paddingVertical: paddingVertical,
      },
      animatedStyle
    ]}>
      <Text style={[styles.comboText, { fontSize: comboTextFontSize }]}>COMBO</Text>
      <Text style={[styles.comboNumber, { fontSize: comboNumberFontSize }]}>x{combo}</Text>
      <View style={styles.flames}>
        <Text style={[styles.flame, { fontSize: flameFontSize }]}>🔥</Text>
        {combo >= 5 && <Text style={[styles.flame, { fontSize: flameFontSize }]}>🔥</Text>}
        {combo >= 10 && <Text style={[styles.flame, { fontSize: flameFontSize }]}>🔥</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    boxShadow: '0px 4px 12px rgba(255, 69, 0, 0.6)',
    elevation: 10,
    zIndex: 150,
  },
  comboText: {
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  comboNumber: {
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
    marginHorizontal: 2,
  },
});
