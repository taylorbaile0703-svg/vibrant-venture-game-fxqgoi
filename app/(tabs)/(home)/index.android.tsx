
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ScaledSize } from 'react-native';
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
import { loadLevelProgress } from '@/utils/levelStorage';

export default function HomeScreen() {
  const router = useRouter();
  const [highScores, setHighScores] = useState<{ [key: number]: number }>({});
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use state for dimensions to make them reactive
  const [dimensions, setDimensions] = useState(() => {
    const window = Dimensions.get('window');
    return {
      width: window.width,
      height: window.height,
    };
  });

  const titleScale = useSharedValue(1);
  const titleRotate = useSharedValue(0);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      console.log('Loading level progress...');
      try {
        const progress = await loadLevelProgress();
        setUnlockedLevels(progress.unlockedLevels);
        setHighScores(progress.highScores);
        console.log('Progress loaded successfully');
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // Reload progress when screen comes into focus
  useEffect(() => {
    const reloadProgress = async () => {
      console.log('Reloading level progress...');
      try {
        const progress = await loadLevelProgress();
        setUnlockedLevels(progress.unlockedLevels);
        setHighScores(progress.highScores);
      } catch (error) {
        console.error('Error reloading progress:', error);
      }
    };

    // Set up an interval to check for updates
    const interval = setInterval(reloadProgress, 2000);

    return () => clearInterval(interval);
  }, []);

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      console.log('Dimensions changed:', window.width, 'x', window.height);
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

  const titleFontSize = Math.min(dimensions.width * 0.1, 42);
  const subtitleFontSize = Math.min(dimensions.width * 0.045, 18);
  const buttonFontSize = Math.min(dimensions.width * 0.045, 18);
  const sectionTitleFontSize = Math.min(dimensions.width * 0.06, 24);
  const footerFontSize = Math.min(dimensions.width * 0.035, 14);
  const paddingHorizontal = Math.min(dimensions.width * 0.05, 20);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 70,
            paddingHorizontal: paddingHorizontal,
            paddingBottom: 40,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { marginBottom: dimensions.height * 0.03 }]}>
          <Animated.View style={animatedTitleStyle}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>🎯 COLOR BLAST</Text>
          </Animated.View>
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>Tap the orbs, score big!</Text>
        </View>

        <View style={[styles.buttonContainer, { marginBottom: dimensions.height * 0.03 }]}>
          <TouchableOpacity 
            style={[
              styles.tutorialButton,
              {
                paddingVertical: dimensions.height * 0.02,
                paddingHorizontal: dimensions.width * 0.08,
              }
            ]} 
            onPress={handleTutorial}
          >
            <Text style={[styles.tutorialButtonText, { fontSize: buttonFontSize }]}>📚 How to Play</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.levelsContainer, { marginBottom: dimensions.height * 0.03 }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Select Level</Text>
          <View style={styles.gridContainer}>
            {LEVELS.map((level, index) => (
              <LevelCard
                key={index}
                level={level}
                isUnlocked={unlockedLevels.includes(level.id)}
                highScore={highScores[level.id] || 0}
                onPress={() => handleLevelPress(level.id)}
                compact={true}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontSize: footerFontSize }]}>Complete levels to unlock more!</Text>
          <Text style={[styles.footerText, { fontSize: footerFontSize - 2, marginTop: 8 }]}>
            Unlocked: {unlockedLevels.length} / {LEVELS.length}
          </Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  tutorialButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  tutorialButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  levelsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
