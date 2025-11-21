
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { LevelCard } from '@/components/LevelCard';
import { LEVELS } from '@/data/levels';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [highScores, setHighScores] = useState<{ [key: number]: number }>({});
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);

  const titleScale = useSharedValue(1);
  const titleRotate = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    titleRotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: titleScale.value },
        { rotate: `${titleRotate.value}deg` },
      ],
    };
  });

  const handleLevelPress = (levelId: number) => {
    console.log('Starting level:', levelId);
    router.push({
      pathname: '/(tabs)/(home)/game',
      params: { levelId: levelId.toString() },
    });
  };

  const handleTutorial = () => {
    console.log('Starting tutorial');
    router.push('/(tabs)/(home)/tutorial');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Animated.View style={animatedTitleStyle}>
            <Text style={styles.title}>🎯 COLOR BLAST</Text>
          </Animated.View>
          <Text style={styles.subtitle}>Tap the orbs, score big!</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.tutorialButton} onPress={handleTutorial}>
            <Text style={styles.tutorialButtonText}>📚 How to Play</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.levelsContainer}>
          <Text style={styles.sectionTitle}>Select Level</Text>
          {LEVELS.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              isUnlocked={unlockedLevels.includes(level.id)}
              highScore={highScores[level.id] || 0}
              onPress={() => handleLevelPress(level.id)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Complete levels to unlock more!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  tutorialButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  tutorialButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  levelsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
