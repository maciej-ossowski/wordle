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

// Container animation variant
const containerVariants = {
  hidden: { 
    opacity: 0,
    rotate: -5,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Bar animation variant
const barVariants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  })
};

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

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('wordle_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Check if there are any games played
  const hasGames = stats.totalGames > 0;

  return (
    <motion.div 
      className="flex-1 flex justify-center p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#2980b9]">Statistics</h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#2980b9]">{stats.currentStreak}</div>
            <div className="text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#2980b9]">{stats.maxStreak}</div>
            <div className="text-gray-600">Max Streak</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Guess Distribution</h2>
          {!hasGames ? (
            <p className="text-center text-gray-500 italic">
              Play some games to see your guess distribution!
            </p>
          ) : (
            Object.entries(stats.attempts).map(([attempt, count]) => (
              <div key={attempt} className="flex items-center gap-4">
                <div className="w-8 text-right font-bold">{attempt}</div>
                <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                  {count > 0 && (
                    <motion.div 
                      className="bg-[#2980b9] text-white px-4 py-2 text-right rounded-lg"
                      variants={barVariants}
                      initial="hidden"
                      animate="visible"
                      custom={(count / stats.totalGames * 100)}
                      style={{ 
                        minWidth: '2rem'
                      }}
                    >
                      {count}
                    </motion.div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
} 