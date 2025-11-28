
export interface Orb {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  points: number;
  type: 'normal' | 'bonus' | 'bomb' | 'freeze' | 'multiplier' | 'shrink' | 'giant' | 'rainbow' | 'ghost';
  speed?: number;
  direction?: { x: number; y: number };
  isMoving?: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  targetScore: number;
  timeLimit: number;
  orbSpawnRate: number;
  maxOrbs: number;
  specialOrbChance: number;
  backgroundColor: string;
  orbSizeVariation: number;
  orbSpeedMultiplier: number;
  theme?: 'space' | 'ocean' | 'forest' | 'fire' | 'ice' | 'neon' | 'desert' | 'storm' | 'cosmic' | 'rainbow';
  mechanic?: 'moving' | 'shrinking' | 'growing' | 'teleporting' | 'gravity' | 'chaos' | 'precision' | 'speed';
  backgroundGradient?: [string, string, ...string[]];
  specialOrbTypes?: ('shrink' | 'giant' | 'rainbow' | 'ghost')[];
}

export interface GameState {
  score: number;
  level: number;
  lives: number;
  timeRemaining: number;
  multiplier: number;
  isPlaying: boolean;
  isPaused: boolean;
  freezeActive: boolean;
}

export interface PowerUp {
  type: 'freeze' | 'multiplier' | 'extraLife';
  duration: number;
  active: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  points: number;
  multiplier: number;
}
