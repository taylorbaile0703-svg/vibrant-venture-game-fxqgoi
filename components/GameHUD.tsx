
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { GameState } from '@/types/game';

interface GameHUDProps {
  gameState: GameState;
  levelName: string;
  targetScore: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, levelName, targetScore }) => {
  const scoreScale = useSharedValue(1);
  const livesScale = useSharedValue(1);
  const timeScale = useSharedValue(1);

  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [gameState.score]);

  useEffect(() => {
    livesScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [gameState.lives]);

  useEffect(() => {
    if (gameState.timeRemaining <= 10) {
      timeScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [gameState.timeRemaining]);

  const scoreAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scoreScale.value }],
    };
  });

  const livesAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: livesScale.value }],
    };
  });

  const timeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: timeScale.value }],
    };
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((gameState.score / targetScore) * 100, 100);
  const isLowTime = gameState.timeRemaining <= 10;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.statBox}>
          <Text style={styles.label}>Level {gameState.level}</Text>
          <Text style={styles.sublabel}>{levelName}</Text>
        </View>
        
        <Animated.View style={[styles.statBox, scoreAnimatedStyle]}>
          <Text style={styles.label}>Score</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{gameState.score}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.sublabel}>Goal: {targetScore}</Text>
        </Animated.View>
        
        <Animated.View style={[styles.statBox, timeAnimatedStyle]}>
          <Text style={styles.label}>Time</Text>
          <Text style={[styles.value, isLowTime && styles.lowTimeValue]}>
            {formatTime(gameState.timeRemaining)}
          </Text>
        </Animated.View>
      </View>
      
      <View style={styles.bottomRow}>
        <Animated.View style={[styles.livesContainer, livesAnimatedStyle]}>
          <Text style={styles.label}>Lives: </Text>
          {Array.from({ length: 3 }).map((_, index) => (
            <Text key={index} style={[styles.heart, index >= gameState.lives && styles.lostHeart]}>
              {index < gameState.lives ? '❤️' : '🖤'}
            </Text>
          ))}
        </Animated.View>
        
        <View style={styles.powerUpsContainer}>
          {gameState.multiplier > 1 && (
            <View style={styles.multiplierBadge}>
              <Text style={styles.badgeIcon}>✨</Text>
              <Text style={styles.multiplierText}>x{gameState.multiplier}</Text>
            </View>
          )}
          
          {gameState.freezeActive && (
            <View style={styles.powerUpBadge}>
              <Text style={styles.badgeIcon}>❄️</Text>
              <Text style={styles.powerUpText}>FREEZE</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '900',
  },
  lowTimeValue: {
    color: '#FF0000',
  },
  sublabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(98, 0, 238, 0.2)',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    fontSize: 22,
    marginLeft: 4,
  },
  lostHeart: {
    opacity: 0.3,
  },
  powerUpsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  multiplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    boxShadow: '0px 2px 6px rgba(255, 64, 129, 0.4)',
    elevation: 4,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  multiplierText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  powerUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    boxShadow: '0px 2px 6px rgba(3, 218, 197, 0.4)',
    elevation: 4,
  },
  powerUpText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
});
