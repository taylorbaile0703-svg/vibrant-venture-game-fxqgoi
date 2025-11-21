
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { GameState } from '@/types/game';

interface GameHUDProps {
  gameState: GameState;
  levelName: string;
  targetScore: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, levelName, targetScore }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.statBox}>
          <Text style={styles.label}>Level</Text>
          <Text style={styles.value}>{gameState.level}</Text>
          <Text style={styles.sublabel}>{levelName}</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.value}>{gameState.score}</Text>
          <Text style={styles.sublabel}>/ {targetScore}</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatTime(gameState.timeRemaining)}</Text>
        </View>
      </View>
      
      <View style={styles.bottomRow}>
        <View style={styles.livesContainer}>
          <Text style={styles.label}>Lives: </Text>
          {Array.from({ length: gameState.lives }).map((_, index) => (
            <Text key={index} style={styles.heart}>❤️</Text>
          ))}
        </View>
        
        {gameState.multiplier > 1 && (
          <View style={styles.multiplierBadge}>
            <Text style={styles.multiplierText}>x{gameState.multiplier}</Text>
          </View>
        )}
        
        {gameState.freezeActive && (
          <View style={styles.powerUpBadge}>
            <Text style={styles.powerUpText}>❄️ FREEZE</Text>
          </View>
        )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '800',
  },
  sublabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
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
    fontSize: 20,
    marginLeft: 4,
  },
  multiplierBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  multiplierText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  powerUpBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  powerUpText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
