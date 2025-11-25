
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { Level } from '@/types/game';

interface LevelPreviewProps {
  level: Level;
  visible: boolean;
  onStart: () => void;
}

export function LevelPreview({ level, visible, onStart }: LevelPreviewProps) {
  const calculateOrbCounts = () => {
    const totalOrbs = 100;
    const specialOrbCount = Math.round(totalOrbs * level.specialOrbChance);
    const normalOrbCount = totalOrbs - specialOrbCount;
    
    const bonusCount = Math.round(specialOrbCount * 0.3);
    const bombCount = Math.round(specialOrbCount * 0.2);
    const freezeCount = Math.round(specialOrbCount * 0.2);
    const multiplierCount = specialOrbCount - bonusCount - bombCount - freezeCount;
    
    return {
      normal: normalOrbCount,
      bonus: bonusCount,
      bomb: bombCount,
      freeze: freezeCount,
      multiplier: multiplierCount,
    };
  };

  const orbCounts = calculateOrbCounts();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: level.backgroundColor }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.content}
          >
            <View style={styles.header}>
              <Text style={styles.levelNumber}>Level {level.id}</Text>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.description}>{level.description}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🎯 Target Score:</Text>
                <Text style={styles.statValue}>{level.targetScore.toLocaleString()}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>⏱️ Time Limit:</Text>
                <Text style={styles.statValue}>{level.timeLimit}s</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>⚡ Speed:</Text>
                <Text style={styles.statValue}>{level.orbSpeedMultiplier}x</Text>
              </View>
            </View>

            <View style={styles.orbsSection}>
              <Text style={styles.sectionTitle}>Orb Types in This Level:</Text>
              
              <View style={styles.orbGrid}>
                <View style={styles.orbItem}>
                  <View style={[styles.orbIcon, { backgroundColor: '#6200EE' }]}>
                    <Text style={styles.orbEmoji}>⚪</Text>
                  </View>
                  <Text style={styles.orbLabel}>Normal</Text>
                  <Text style={styles.orbCount}>~{orbCounts.normal}</Text>
                  <Text style={styles.orbPoints}>+10 pts</Text>
                </View>

                {orbCounts.bonus > 0 && (
                  <View style={styles.orbItem}>
                    <View style={[styles.orbIcon, { backgroundColor: '#FFD700' }]}>
                      <Text style={styles.orbEmoji}>⭐</Text>
                    </View>
                    <Text style={styles.orbLabel}>Bonus</Text>
                    <Text style={styles.orbCount}>~{orbCounts.bonus}</Text>
                    <Text style={styles.orbPoints}>+50 pts</Text>
                  </View>
                )}

                {orbCounts.bomb > 0 && (
                  <View style={styles.orbItem}>
                    <View style={[styles.orbIcon, { backgroundColor: '#FF0000' }]}>
                      <Text style={styles.orbEmoji}>💣</Text>
                    </View>
                    <Text style={styles.orbLabel}>Bomb</Text>
                    <Text style={styles.orbCount}>~{orbCounts.bomb}</Text>
                    <Text style={styles.orbPoints}>-1 Life</Text>
                  </View>
                )}

                {orbCounts.freeze > 0 && (
                  <View style={styles.orbItem}>
                    <View style={[styles.orbIcon, { backgroundColor: '#00BCD4' }]}>
                      <Text style={styles.orbEmoji}>❄️</Text>
                    </View>
                    <Text style={styles.orbLabel}>Freeze</Text>
                    <Text style={styles.orbCount}>~{orbCounts.freeze}</Text>
                    <Text style={styles.orbPoints}>5s Freeze</Text>
                  </View>
                )}

                {orbCounts.multiplier > 0 && (
                  <View style={styles.orbItem}>
                    <View style={[styles.orbIcon, { backgroundColor: '#FF6F00' }]}>
                      <Text style={styles.orbEmoji}>✨</Text>
                    </View>
                    <Text style={styles.orbLabel}>Multiplier</Text>
                    <Text style={styles.orbCount}>~{orbCounts.multiplier}</Text>
                    <Text style={styles.orbPoints}>2x Score</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={onStart}>
              <LinearGradient
                colors={[colors.primary, '#9C27B0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>START LEVEL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
    elevation: 10,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  levelName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  orbsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  orbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  orbItem: {
    alignItems: 'center',
    width: 90,
    marginBottom: 8,
  },
  orbIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  orbEmoji: {
    fontSize: 28,
  },
  orbLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  orbCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  orbPoints: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 6px 12px rgba(98, 0, 238, 0.4)',
    elevation: 6,
  },
  startButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
