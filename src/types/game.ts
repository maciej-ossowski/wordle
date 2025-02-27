export interface GameResult {
  word: string;
  attempts: number;
  won: boolean;
  timestamp: number;
  guesses: string[];
}

export interface DailyResult {
  word: string;
  won: boolean;
  attempts: number;
  date: string;
  guesses: string[];
}

export interface Stats {
  currentStreak: number;
  maxStreak: number;
  totalGames: number;
  wins: number;
  attempts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    fail: number;
  };
} 