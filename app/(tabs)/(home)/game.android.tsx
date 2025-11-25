
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Alert, Platform, ScaledSize } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GameOrb } from '@/components/GameOrb';
import { GameHUD } from '@/components/GameHUD';
import { ParticleExplosion } from '@/components/ParticleExplosion';
import { ScorePopup } from '@/components/ScorePopup';
import { ComboIndicator } from '@/components/ComboIndicator';
import { LevelPreview } from '@/components/LevelPreview';
import { colors } from '@/styles/commonStyles';
import { Orb, GameState } from '@/types/game';
import { LEVELS, ORB_COLORS } from '@/data/levels';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface ScorePopupData {
  id: string;
  x: number;
  y: number;
  points: number;
  multiplier: number;
}

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelId = parseInt(params.levelId as string) || 1;
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  const [showPreview, setShowPreview] = useState(true);
  const [dimensions, setDimensions] = useState(() => {
    const window = Dimensions.get('window');
    return {
      width: window.width,
      height: window.height,
      gameAreaTop: 210,
      gameAreaBottom: window.height - 100,
    };
  });

  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [combo, setCombo] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: levelId,
    lives: 3,
    timeRemaining: level.timeLimit,
    multiplier: 1,
    isPlaying: false,
    isPaused: false,
    freezeActive: false,
  });

  const orbIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const scorePopupIdCounter = useRef(0);
  const spawnInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const freezeTimeout = useRef<NodeJS.Timeout | null>(null);
  const multiplierTimeout = useRef<NodeJS.Timeout | null>(null);
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);
  const orbTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const gameStateRef = useRef(gameState);
  const gameEndedRef = useRef(false);
  const lastTapTime = useRef(0);

  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeX.value }, { translateY: shakeY.value }],
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      console.log('Dimensions changed:', window.width, 'x', window.height);
      setDimensions({
        width: window.width,
        height: window.height,
        gameAreaTop: 210,
        gameAreaBottom: window.height - 100,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    console.log('Game component mounted');
    return () => {
      console.log('Game component unmounting, cleaning up');
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up game resources');
    if (spawnInterval.current) {
      clearInterval(spawnInterval.current);
      spawnInterval.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (freezeTimeout.current) {
      clearTimeout(freezeTimeout.current);
      freezeTimeout.current = null;
    }
    if (multiplierTimeout.current) {
      clearTimeout(multiplierTimeout.current);
      multiplierTimeout.current = null;
    }
    if (comboTimeout.current) {
      clearTimeout(comboTimeout.current);
      comboTimeout.current = null;
    }
    
    orbTimeouts.current.forEach(timeout => clearTimeout(timeout));
    orbTimeouts.current.clear();
  }, []);

  const handleStartLevel = useCallback(() => {
    console.log('Starting level:', levelId);
    setShowPreview(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
    gameEndedRef.current = false;
    startGame();
  }, [levelId]);

  const startGame = useCallback(() => {
    console.log('Starting game, level:', levelId);
    
    spawnInterval.current = setInterval(() => {
      const currentState = gameStateRef.current;
      if (currentState.isPlaying && !currentState.isPaused && !currentState.freezeActive) {
        setOrbs(currentOrbs => {
          if (currentOrbs.length < level.maxOrbs) {
            const newOrb = createOrb();
            scheduleOrbRemoval(newOrb.id);
            return [...currentOrbs, newOrb];
          }
          return currentOrbs;
        });
      }
    }, level.orbSpawnRate);

    timerInterval.current = setInterval(() => {
      const currentState = gameStateRef.current;
      if (currentState.isPlaying && !currentState.isPaused && !currentState.freezeActive) {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            endGame(false);
            return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }
    }, 1000);
  }, [levelId, level.maxOrbs, level.orbSpawnRate]);

  const createOrb = useCallback((): Orb => {
    const baseSize = Math.min(dimensions.width * 0.15, 60);
    const sizeVariation = level.orbSizeVariation * Math.min(dimensions.width * 0.2, 80);
    const orbSize = baseSize + (Math.random() * sizeVariation);
    
    const safeWidth = dimensions.width - orbSize - 40;
    const safeHeight = dimensions.gameAreaBottom - dimensions.gameAreaTop - orbSize;
    
    const x = Math.max(20, Math.min(Math.random() * safeWidth + 20, dimensions.width - orbSize - 20));
    const y = Math.max(dimensions.gameAreaTop, Math.min(dimensions.gameAreaTop + Math.random() * safeHeight, dimensions.gameAreaBottom - orbSize));

    const rand = Math.random();
    let orbType: Orb['type'] = 'normal';
    let color = ORB_COLORS.normal[Math.floor(Math.random() * ORB_COLORS.normal.length)];
    let points = 10;

    if (rand < level.specialOrbChance) {
      const specialRand = Math.random();
      if (specialRand < 0.3) {
        orbType = 'bonus';
        color = ORB_COLORS.bonus;
        points = 50;
      } else if (specialRand < 0.5) {
        orbType = 'bomb';
        color = ORB_COLORS.bomb;
        points = -50;
      } else if (specialRand < 0.7) {
        orbType = 'freeze';
        color = ORB_COLORS.freeze;
        points = 20;
      } else {
        orbType = 'multiplier';
        color = ORB_COLORS.multiplier;
        points = 30;
      }
    }

    return {
      id: `orb-${orbIdCounter.current++}`,
      x,
      y,
      color,
      size: orbSize,
      points,
      type: orbType,
      speed: level.orbSpeedMultiplier,
    };
  }, [level.orbSizeVariation, level.specialOrbChance, level.orbSpeedMultiplier, dimensions]);

  const scheduleOrbRemoval = useCallback((orbId: string) => {
    const baseLifetime = 3000;
    const lifetime = baseLifetime / (level.orbSpeedMultiplier || 1);
    
    const timeout = setTimeout(() => {
      setOrbs(prev => {
        const orbStillExists = prev.some(o => o.id === orbId);
        if (orbStillExists) {
          const orb = prev.find(o => o.id === orbId);
          if (orb && orb.type !== 'bomb') {
            setGameState(prevState => {
              const newLives = prevState.lives - 1;
              if (newLives <= 0 && !gameEndedRef.current) {
                endGame(false);
              }
              return { ...prevState, lives: Math.max(0, newLives) };
            });
            resetCombo();
          }
          return prev.filter(o => o.id !== orbId);
        }
        return prev;
      });
      orbTimeouts.current.delete(orbId);
    }, lifetime);

    orbTimeouts.current.set(orbId, timeout);
  }, [level.orbSpeedMultiplier]);

  const triggerScreenShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    shakeY.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX, shakeY]);

  const updateCombo = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    if (timeSinceLastTap < 1000) {
      setCombo(prev => prev + 1);
    } else {
      setCombo(1);
    }
    
    lastTapTime.current = now;

    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    comboTimeout.current = setTimeout(() => {
      setCombo(0);
    }, 1500);
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
    if (comboTimeout.current) {
      clearTimeout(comboTimeout.current);
      comboTimeout.current = null;
    }
  }, []);

  const getComboMultiplier = useCallback((comboCount: number): number => {
    if (comboCount >= 10) return 3;
    if (comboCount >= 5) return 2;
    if (comboCount >= 2) return 1.5;
    return 1;
  }, []);

  const handleOrbPress = useCallback((orb: Orb) => {
    console.log('Orb pressed:', orb.type, orb.points);
    
    const timeout = orbTimeouts.current.get(orb.id);
    if (timeout) {
      clearTimeout(timeout);
      orbTimeouts.current.delete(orb.id);
    }

    setOrbs(prev => prev.filter(o => o.id !== orb.id));

    const particleId = `particle-${particleIdCounter.current++}`;
    setParticles(prev => [
      ...prev,
      { id: particleId, x: orb.x + orb.size / 2, y: orb.y + orb.size / 2, color: orb.color },
    ]);

    if (orb.type === 'bomb') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerScreenShake();
      resetCombo();
      
      setGameState(prev => {
        const newLives = prev.lives - 1;
        if (newLives <= 0 && !gameEndedRef.current) {
          endGame(false);
        }
        return { ...prev, lives: Math.max(0, newLives) };
      });

      const popupId = `popup-${scorePopupIdCounter.current++}`;
      setScorePopups(prev => [
        ...prev,
        {
          id: popupId,
          x: orb.x + orb.size / 2 - 30,
          y: orb.y,
          points: orb.points,
          multiplier: 1,
        },
      ]);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateCombo();
      
      if (orb.type === 'freeze') {
        activateFreeze();
      } else if (orb.type === 'multiplier') {
        activateMultiplier();
      }

      const comboMult = getComboMultiplier(combo + 1);
      const totalMultiplier = gameStateRef.current.multiplier * comboMult;

      setGameState(prev => {
        const newScore = prev.score + Math.floor(orb.points * totalMultiplier);
        if (newScore >= level.targetScore && !gameEndedRef.current) {
          endGame(true);
        }
        return { ...prev, score: newScore };
      });

      const popupId = `popup-${scorePopupIdCounter.current++}`;
      setScorePopups(prev => [
        ...prev,
        {
          id: popupId,
          x: orb.x + orb.size / 2 - 30,
          y: orb.y,
          points: orb.points,
          multiplier: totalMultiplier,
        },
      ]);
    }
  }, [level.targetScore, combo, triggerScreenShake, resetCombo, updateCombo, getComboMultiplier]);

  const activateFreeze = useCallback(() => {
    console.log('Freeze activated');
    setGameState(prev => ({ ...prev, freezeActive: true }));
    
    if (freezeTimeout.current) clearTimeout(freezeTimeout.current);
    freezeTimeout.current = setTimeout(() => {
      setGameState(prev => ({ ...prev, freezeActive: false }));
    }, 5000);
  }, []);

  const activateMultiplier = useCallback(() => {
    console.log('Multiplier activated');
    setGameState(prev => ({ ...prev, multiplier: 2 }));
    
    if (multiplierTimeout.current) clearTimeout(multiplierTimeout.current);
    multiplierTimeout.current = setTimeout(() => {
      setGameState(prev => ({ ...prev, multiplier: 1 }));
    }, 10000);
  }, []);

  const endGame = useCallback((won: boolean) => {
    if (gameEndedRef.current) {
      console.log('Game already ended, skipping');
      return;
    }
    
    gameEndedRef.current = true;
    console.log('Game ended, won:', won);
    
    cleanup();
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    setTimeout(() => {
      if (won) {
        const nextLevelId = levelId + 1;
        const nextLevel = LEVELS.find(l => l.id === nextLevelId);
        
        if (nextLevel) {
          Alert.alert(
            '🎉 Level Complete!',
            `Amazing! You scored ${gameStateRef.current.score} points!\nTarget: ${level.targetScore}\n\nReady for the next challenge?`,
            [
              {
                text: 'Back to Menu',
                onPress: () => router.back(),
                style: 'cancel',
              },
              {
                text: 'Next Level',
                onPress: () => {
                  router.replace({
                    pathname: '/(tabs)/(home)/game',
                    params: { levelId: nextLevelId.toString() },
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert(
            '🏆 GAME COMPLETE!',
            `Congratulations! You&apos;ve completed all levels!\nFinal Score: ${gameStateRef.current.score}`,
            [
              {
                text: 'Back to Menu',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } else {
        Alert.alert(
          '😢 Game Over',
          `You scored ${gameStateRef.current.score} points.\nKeep practicing!`,
          [
            {
              text: 'Back to Menu',
              onPress: () => router.back(),
            },
            {
              text: 'Try Again',
              onPress: () => {
                router.replace({
                  pathname: '/(tabs)/(home)/game',
                  params: { levelId: levelId.toString() },
                });
              },
            },
          ]
        );
      }
    }, 500);
  }, [level.targetScore, levelId, router, cleanup]);

  const handlePause = useCallback(() => {
    console.log('Game paused/resumed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleQuit = useCallback(() => {
    Alert.alert(
      'Quit Game?',
      'Are you sure you want to quit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Quit', 
          onPress: () => {
            cleanup();
            router.back();
          }, 
          style: 'destructive' 
        },
      ]
    );
  }, [router, cleanup]);

  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const removeScorePopup = useCallback((id: string) => {
    setScorePopups(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: level.backgroundColor }]}>
      <LevelPreview
        level={level}
        visible={showPreview}
        onStart={handleStartLevel}
      />

      <Animated.View style={[styles.gameContainer, shakeAnimatedStyle]}>
        <GameHUD
          gameState={gameState}
          levelName={level.name}
          targetScore={level.targetScore}
        />

        <ComboIndicator combo={combo} />

        <View style={styles.gameArea}>
          {orbs.map((orb) => (
            <GameOrb key={orb.id} orb={orb} onPress={handleOrbPress} />
          ))}
        </View>

        {particles.map((particle) => (
          <ParticleExplosion
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
            onComplete={() => removeParticle(particle.id)}
          />
        ))}

        {scorePopups.map((popup) => (
          <ScorePopup
            key={popup.id}
            x={popup.x}
            y={popup.y}
            points={popup.points}
            multiplier={popup.multiplier}
            onComplete={() => removeScorePopup(popup.id)}
          />
        ))}

        {gameState.isPaused && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseText}>PAUSED</Text>
            <Text style={styles.pauseSubtext}>Tap ▶️ to continue</Text>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
            <Text style={styles.controlButtonText}>{gameState.isPaused ? '▶️' : '⏸️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleQuit}>
            <Text style={styles.controlButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  pauseText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  pauseSubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CCCCCC',
    marginTop: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: colors.card,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  controlButtonText: {
    fontSize: 32,
  },
});
