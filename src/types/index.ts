export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'classic' | 'trueFalse' | 'multipleChoice' | 'timeAttack';

export interface GameConfig {
  difficulty: Difficulty;
  mode: GameMode;
  iterations: number;
  maxTimeMs: number;
  playerName: string;
}

export interface Operation {
  question: string;
  correctAnswer: number;
  displayAnswer?: number;
  isTrue?: boolean;
  options?: number[];
  correctIndex?: number;
}

export interface AnswerRecord {
  correct: boolean | null;
  responseTime: number;
  points: number;
}

export interface RoundResult {
  id: string;
  date: string;
  playerName: string;
  difficulty: Difficulty;
  mode: GameMode;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  averageResponseTime: number;
  accuracy: number;
  totalQuestions: number;
}

export interface BestScores {
  [key: string]: number;
}

export interface GlobalStats {
  totalRoundsPlayed: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  totalScore: number;
}
