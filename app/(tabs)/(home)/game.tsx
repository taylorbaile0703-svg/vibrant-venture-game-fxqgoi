
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GameOrb } from '@/components/GameOrb';
import { GameHUD } from '@/components/GameHUD';
import { colors } from '@/styles/commonStyles';
import { Orb, GameState } from '@/types/game';
import { LEVELS, ORB_COLORS } from '@/data/levels';

const { width, height } = Dimensions.get('window');
const GAME_AREA_TOP = 180;
const GAME_AREA_BOTTOM = height - 150;

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const levelId = parseInt(params.levelId as string) || 1;
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: levelId,
    lives: 3,
    timeRemaining: level.timeLimit,
    multiplier: 1,
    isPlaying: true,
    isPaused: false,
    freezeActive: false,
  });

  const orbIdCounter = useRef(0);
  const spawnInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const freezeTimeout = useRef<NodeJS.Timeout | null>(null);
  const multiplierTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startGame();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (spawnInterval.current) clearInterval(spawnInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (freezeTimeout.current) clearTimeout(freezeTimeout.current);
    if (multiplierTimeout.current) clearTimeout(multiplierTimeout.current);
  };

  const startGame = () => {
    console.log('Starting game, level:', levelId);
    
    spawnInterval.current = setInterval(() => {
      if (gameState.isPlaying && !gameState.isPaused && orbs.length < level.maxOrbs) {
        spawnOrb();
      }
    }, level.orbSpawnRate);

    timerInterval.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          endGame(false);
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  };

  const spawnOrb = () => {
    const orbSize = 60 + Math.random() * 40;
    const x = Math.random() * (width - orbSize - 40) + 20;
    const y = GAME_AREA_TOP + Math.random() * (GAME_AREA_BOTTOM - GAME_AREA_TOP - orbSize);

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

    const newOrb: Orb = {
      id: `orb-${orbIdCounter.current++}`,
      x,
      y,
      color,
      size: orbSize,
      points,
      type: orbType,
    };

    setOrbs(prev => [...prev, newOrb]);

    setTimeout(() => {
      setOrbs(prev => prev.filter(o => o.id !== newOrb.id));
      if (orbType !== 'bomb') {
        setGameState(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            endGame(false);
          }
          return { ...prev, lives: newLives };
        });
      }
    }, 3000);
  };

  const handleOrbPress = (orb: Orb) => {
    console.log('Orb pressed:', orb.type, orb.points);
    
    setOrbs(prev => prev.filter(o => o.id !== orb.id));

    if (orb.type === 'bomb') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setGameState(prev => {
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          endGame(false);
        }
        return { ...prev, lives: newLives };
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (orb.type === 'freeze') {
        activateFreeze();
      } else if (orb.type === 'multiplier') {
        activateMultiplier();
      }

      setGameState(prev => {
        const newScore = prev.score + (orb.points * prev.multiplier);
        if (newScore >= level.targetScore) {
          endGame(true);
        }
        return { ...prev, score: newScore };
      });
    }
  };

  const activateFreeze = () => {
    console.log('Freeze activated');
    setGameState(prev => ({ ...prev, freezeActive: true }));
    
    if (freezeTimeout.current) clearTimeout(freezeTimeout.current);
    freezeTimeout.current = setTimeout(() => {
      setGameState(prev => ({ ...prev, freezeActive: false }));
    }, 5000);
  };

  const activateMultiplier = () => {
    console.log('Multiplier activated');
    setGameState(prev => ({ ...prev, multiplier: 2 }));
    
    if (multiplierTimeout.current) clearTimeout(multiplierTimeout.current);
    multiplierTimeout.current = setTimeout(() => {
      setGameState(prev => ({ ...prev, multiplier: 1 }));
    }, 10000);
  };

  const endGame = (won: boolean) => {
    console.log('Game ended, won:', won);
    cleanup();
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    setTimeout(() => {
      Alert.alert(
        won ? '🎉 Level Complete!' : '😢 Game Over',
        won 
          ? `You scored ${gameState.score} points!\nTarget: ${level.targetScore}`
          : `You scored ${gameState.score} points.\nBetter luck next time!`,
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
    }, 500);
  };

  const handlePause = () => {
    console.log('Game paused');
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Game?',
      'Are you sure you want to quit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', onPress: () => router.back(), style: 'destructive' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: level.backgroundColor }]}>
      <GameHUD
        gameState={gameState}
        levelName={level.name}
        targetScore={level.targetScore}
      />

      <View style={styles.gameArea}>
        {orbs.map((orb) => (
          <GameOrb key={orb.id} orb={orb} onPress={handleOrbPress} />
        ))}
      </View>

      {gameState.isPaused && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>PAUSED</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  pauseText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: colors.card,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 28,
  },
});
