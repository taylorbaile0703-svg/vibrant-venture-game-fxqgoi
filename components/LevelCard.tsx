
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, ScaledSize } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Level } from '@/types/game';

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  highScore: number;
  onPress: () => void;
  compact?: boolean;
}

export const LevelCard: React.FC<LevelCardProps> = ({ level, isUnlocked, highScore, onPress, compact = false }) => {
  // Use state for dimensions to make them reactive
  const [dimensions, setDimensions] = useState(() => {
    const window = Dimensions.get('window');
    const cardWidth = (window.width - 60) / 4;
    return {
      width: window.width,
      cardWidth: cardWidth,
    };
  });

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const cardWidth = (window.width - 60) / 4;
      setDimensions({
        width: window.width,
        cardWidth: cardWidth,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          { 
            width: dimensions.cardWidth,
            height: dimensions.cardWidth,
            backgroundColor: isUnlocked ? level.backgroundColor : '#E0E0E0',
            opacity: isUnlocked ? 1 : 0.6,
          },
        ]}
        onPress={onPress}
        disabled={!isUnlocked}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactLevelNumber}>{level.id}</Text>
          {!isUnlocked && <Text style={styles.compactLock}>🔒</Text>}
          {highScore > 0 && <Text style={styles.compactStar}>⭐</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isUnlocked ? level.backgroundColor : '#E0E0E0' },
      ]}
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.levelNumber}>Level {level.id}</Text>
        {!isUnlocked && <Text style={styles.lockedText}>🔒</Text>}
      </View>
      
      <Text style={styles.levelName}>{level.name}</Text>
      <Text style={styles.description}>{level.description}</Text>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValue}>{level.targetScore}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{level.timeLimit}s</Text>
        </View>
        {highScore > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>
        )}
      </View>
      
      {isUnlocked && (
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>PLAY</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lockedText: {
    fontSize: 20,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  compactCard: {
    borderRadius: 12,
    marginBottom: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactLevelNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  compactLock: {
    fontSize: 16,
    position: 'absolute',
    top: -8,
    right: -8,
  },
  compactStar: {
    fontSize: 12,
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
});
