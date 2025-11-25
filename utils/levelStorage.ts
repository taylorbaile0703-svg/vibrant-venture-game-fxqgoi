
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNLOCKED_LEVELS_KEY = '@color_blast_unlocked_levels';
const HIGH_SCORES_KEY = '@color_blast_high_scores';

export interface LevelProgress {
  unlockedLevels: number[];
  highScores: { [key: number]: number };
}

/**
 * Load unlocked levels from AsyncStorage
 */
export const loadUnlockedLevels = async (): Promise<number[]> => {
  try {
    const data = await AsyncStorage.getItem(UNLOCKED_LEVELS_KEY);
    if (data) {
      const unlockedLevels = JSON.parse(data);
      console.log('Loaded unlocked levels:', unlockedLevels);
      return unlockedLevels;
    }
    console.log('No saved unlocked levels, starting with level 1');
    return [1]; // Default: only level 1 is unlocked
  } catch (error) {
    console.error('Error loading unlocked levels:', error);
    return [1];
  }
};

/**
 * Save unlocked levels to AsyncStorage
 */
export const saveUnlockedLevels = async (unlockedLevels: number[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(unlockedLevels));
    console.log('Saved unlocked levels:', unlockedLevels);
  } catch (error) {
    console.error('Error saving unlocked levels:', error);
  }
};

/**
 * Unlock a specific level
 */
export const unlockLevel = async (levelId: number): Promise<number[]> => {
  try {
    const currentUnlocked = await loadUnlockedLevels();
    if (!currentUnlocked.includes(levelId)) {
      const updatedUnlocked = [...currentUnlocked, levelId].sort((a, b) => a - b);
      await saveUnlockedLevels(updatedUnlocked);
      console.log('Level unlocked:', levelId);
      return updatedUnlocked;
    }
    return currentUnlocked;
  } catch (error) {
    console.error('Error unlocking level:', error);
    return await loadUnlockedLevels();
  }
};

/**
 * Load high scores from AsyncStorage
 */
export const loadHighScores = async (): Promise<{ [key: number]: number }> => {
  try {
    const data = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    if (data) {
      const highScores = JSON.parse(data);
      console.log('Loaded high scores:', highScores);
      return highScores;
    }
    console.log('No saved high scores');
    return {};
  } catch (error) {
    console.error('Error loading high scores:', error);
    return {};
  }
};

/**
 * Save high scores to AsyncStorage
 */
export const saveHighScores = async (highScores: { [key: number]: number }): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    console.log('Saved high scores:', highScores);
  } catch (error) {
    console.error('Error saving high scores:', error);
  }
};

/**
 * Update high score for a specific level
 */
export const updateHighScore = async (levelId: number, score: number): Promise<void> => {
  try {
    const currentScores = await loadHighScores();
    const currentHighScore = currentScores[levelId] || 0;
    
    if (score > currentHighScore) {
      currentScores[levelId] = score;
      await saveHighScores(currentScores);
      console.log('New high score for level', levelId, ':', score);
    }
  } catch (error) {
    console.error('Error updating high score:', error);
  }
};

/**
 * Load all level progress (unlocked levels and high scores)
 */
export const loadLevelProgress = async (): Promise<LevelProgress> => {
  const [unlockedLevels, highScores] = await Promise.all([
    loadUnlockedLevels(),
    loadHighScores(),
  ]);
  
  return {
    unlockedLevels,
    highScores,
  };
};

/**
 * Clear all saved progress (useful for testing or reset functionality)
 */
export const clearAllProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([UNLOCKED_LEVELS_KEY, HIGH_SCORES_KEY]);
    console.log('All progress cleared');
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
};
