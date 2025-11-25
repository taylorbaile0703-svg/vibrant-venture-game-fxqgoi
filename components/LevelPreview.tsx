
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
    
    const specialTypes = level.specialOrbTypes || [];
    const hasSpecialTypes = specialTypes.length > 0;
    
    let shrinkCount = 0;
    let giantCount = 0;
    let rainbowCount = 0;
    let ghostCount = 0;
    let bonusCount = 0;
    let bombCount = 0;
    let freezeCount = 0;
    let multiplierCount = 0;
    
    if (hasSpecialTypes) {
      shrinkCount = specialTypes.includes('shrink') ? Math.round(specialOrbCount * 0.15) : 0;
      giantCount = specialTypes.includes('giant') ? Math.round(specialOrbCount * 0.15) : 0;
      rainbowCount = specialTypes.includes('rainbow') ? Math.round(specialOrbCount * 0.15) : 0;
      ghostCount = specialTypes.includes('ghost') ? Math.round(specialOrbCount * 0.15) : 0;
      
      const remaining = specialOrbCount - shrinkCount - giantCount - rainbowCount - ghostCount;
      bonusCount = Math.round(remaining * 0.25);
      bombCount = Math.round(remaining * 0.25);
      freezeCount = Math.round(remaining * 0.25);
      multiplierCount = remaining - bonusCount - bombCount - freezeCount;
    } else {
      bonusCount = Math.round(specialOrbCount * 0.3);
      bombCount = Math.round(specialOrbCount * 0.2);
      freezeCount = Math.round(specialOrbCount * 0.2);
      multiplierCount = specialOrbCount - bonusCount - bombCount - freezeCount;
    }
    
    return {
      normal: normalOrbCount,
      bonus: bonusCount,
      bomb: bombCount,
      freeze: freezeCount,
      multiplier: multiplierCount,
      shrink: shrinkCount,
      giant: giantCount,
      rainbow: rainbowCount,
      ghost: ghostCount,
    };
  };

  const orbCounts = calculateOrbCounts();
  
  const getThemeEmoji = () => {
    switch (level.theme) {
      case 'space': return '🚀';
      case 'ocean': return '🌊';
      case 'forest': return '🌲';
      case 'fire': return '🔥';
      case 'ice': return '❄️';
      case 'neon': return '⚡';
      case 'desert': return '🏜️';
      case 'storm': return '⛈️';
      case 'cosmic': return '🌌';
      case 'rainbow': return '🌈';
      default: return '🎮';
    }
  };
  
  const getMechanicDescription = () => {
    switch (level.mechanic) {
      case 'moving': return 'Orbs drift around the screen';
      case 'shrinking': return 'Orbs get smaller over time';
      case 'growing': return 'Orbs expand as you play';
      case 'precision': return 'Focus on accuracy';
      case 'speed': return 'Lightning fast reflexes needed';
      case 'chaos': return 'Unpredictable madness';
      default: return 'Standard gameplay';
    }
  };

  const gradientColors = level.backgroundGradient || [level.backgroundColor, level.backgroundColor];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={gradientColors}
            style={styles.backgroundGradient}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.content}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                  <Text style={styles.themeEmoji}>{getThemeEmoji()}</Text>
                  <Text style={styles.levelNumber}>Level {level.id}</Text>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.description}>{level.description}</Text>
                  {level.theme && (
                    <View style={styles.themeBadge}>
                      <Text style={styles.themeText}>{level.theme.toUpperCase()} THEME</Text>
                    </View>
                  )}
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
                  {level.mechanic && (
                    <View style={styles.mechanicRow}>
                      <Text style={styles.mechanicLabel}>🎮 Mechanic:</Text>
                      <Text style={styles.mechanicValue}>{getMechanicDescription()}</Text>
                    </View>
                  )}
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

                    {orbCounts.shrink > 0 && (
                      <View style={styles.orbItem}>
                        <View style={[styles.orbIcon, { backgroundColor: '#9C27B0' }]}>
                          <Text style={styles.orbEmoji}>🔻</Text>
                        </View>
                        <Text style={styles.orbLabel}>Shrink</Text>
                        <Text style={styles.orbCount}>~{orbCounts.shrink}</Text>
                        <Text style={styles.orbPoints}>+25 pts</Text>
                      </View>
                    )}

                    {orbCounts.giant > 0 && (
                      <View style={styles.orbItem}>
                        <View style={[styles.orbIcon, { backgroundColor: '#FF5722' }]}>
                          <Text style={styles.orbEmoji}>🔺</Text>
                        </View>
                        <Text style={styles.orbLabel}>Giant</Text>
                        <Text style={styles.orbCount}>~{orbCounts.giant}</Text>
                        <Text style={styles.orbPoints}>+40 pts</Text>
                      </View>
                    )}

                    {orbCounts.rainbow > 0 && (
                      <View style={styles.orbItem}>
                        <View style={[styles.orbIcon, { backgroundColor: '#FF1744' }]}>
                          <Text style={styles.orbEmoji}>🌈</Text>
                        </View>
                        <Text style={styles.orbLabel}>Rainbow</Text>
                        <Text style={styles.orbCount}>~{orbCounts.rainbow}</Text>
                        <Text style={styles.orbPoints}>+75 pts</Text>
                      </View>
                    )}

                    {orbCounts.ghost > 0 && (
                      <View style={styles.orbItem}>
                        <View style={[styles.orbIcon, { backgroundColor: '#9E9E9E' }]}>
                          <Text style={styles.orbEmoji}>👻</Text>
                        </View>
                        <Text style={styles.orbLabel}>Ghost</Text>
                        <Text style={styles.orbCount}>~{orbCounts.ghost}</Text>
                        <Text style={styles.orbPoints}>+35 pts</Text>
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
              </ScrollView>
            </LinearGradient>
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
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
    elevation: 10,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  themeEmoji: {
    fontSize: 48,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  themeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  themeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  mechanicRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(98, 0, 238, 0.2)',
  },
  mechanicLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  mechanicValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  orbsSection: {
    marginBottom: 20,
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
    marginBottom: 10,
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
