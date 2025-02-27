'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Stats {
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

interface DailyResult {
  word: string;
  won: boolean;
  attempts: number;
  date: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    maxStreak: 0,
    totalGames: 0,
    wins: 0,
    attempts: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0
    }
  });
  const [results, setResults] = useState<DailyResult[]>([]);

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('wordle_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Load daily results
    const allResults: DailyResult[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('wordle_daily_')) {
        try {
          const result = JSON.parse(localStorage.getItem(key) || '');
          if (result.word && result.date) {
            allResults.push(result);
          }
        } catch (e) {
          console.error('Error parsing result:', e);
        }
      }
    });

    // Sort by date, most recent first
    allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setResults(allResults);
  }, []);

  // Check if there are any games played
  const hasGames = stats.totalGames > 0;

  return (
    <div className="flex-1 flex items-center justify-center relative">
      <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#2980b9] dark:text-white">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Current Streak
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#2980b9] dark:text-white">
                {stats.maxStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Max Streak
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#2980b9] dark:text-white">
                {stats.totalGames}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Games
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#2980b9] dark:text-white">
                {stats.wins}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Wins
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[#2980b9] dark:text-white">
              Guess Distribution
            </h2>
            
            {!hasGames ? (
              <p className="text-center text-gray-500 dark:text-gray-400 italic">
                Play some games to see your guess distribution!
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.attempts).map(([attempt, count]) => (
                  <div key={attempt} className="flex items-center gap-4">
                    <div className="w-8 text-right font-bold text-gray-700 dark:text-gray-300">
                      {attempt}
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      {count > 0 && (
                        <motion.div 
                          className="bg-[#3498db] dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-right rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / stats.totalGames * 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          style={{ 
                            minWidth: '2rem'
                          }}
                        >
                          {count}
                        </motion.div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 dark:text-white">
                    {result.word}
                  </span>
                  <span className={`text-sm font-medium ${
                    result.won ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {result.won ? `Solved in ${result.attempts} tries` : 'Failed'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(result.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 