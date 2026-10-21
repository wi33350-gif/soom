export type PhaseType = 'inhale' | 'hold' | 'exhale' | 'hold2';

export interface BreathPhase {
  id: PhaseType;
  name: string;
  duration: number; // in seconds
  instruction: string;
  tip?: string;
  color: string;
}

export interface BreathingPattern {
  id: string;
  koreanName: string;
  englishName: string;
  category: 'sleep' | 'focus' | 'calm' | 'correction' | 'energy' | 'custom';
  tag: string;
  summary: string;
  description: string;
  scientificBasis: string;
  postureGuide: string;
  benefits: string[];
  defaultCycles: number;
  phases: BreathPhase[];
}

export interface SoundscapeState {
  isPlaying: boolean;
  masterVolume: number;
  oceanVolume: number;
  rainVolume: number;
  bowlVolume: number;
  binauralVolume: number;
  bellVolume: number;
  chimesEnabled: boolean;
  voiceGuide: boolean;
}

export interface BreathSessionLog {
  id: string;
  timestamp: number;
  patternId: string;
  patternName: string;
  durationSeconds: number;
  completedCycles: number;
  preStressLevel: number; // 1 to 5
  postStressLevel: number; // 1 to 5
  notes?: string;
}

export interface UserProgress {
  totalMinutes: number;
  totalSessions: number;
  streakDays: number;
  lastSessionDate: string; // YYYY-MM-DD
  boltScore?: number;
  boltScoreDate?: string;
  logs: BreathSessionLog[];
}
