'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WordleGame } from '@/components/WordleGame';
import { DailyResultDisplay } from '@/components/DailyResultDisplay';
import { GameConfetti } from '@/components/GameConfetti';
import { HowToPlay } from '@/components/HowToPlay';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayKey } from '@/lib/utils';
import { DailyResult, Stats } from '@/types/game';
import { HintButton } from '@/components/HintButton';

export default function WordlePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState({
    targetWord: '',
    hasWon: false,
    gameOver: false,
    isLoading: true,
    showConfetti: false,
    showingWinAnimation: false,
    showAbout: false
  });

  const [guesses, setGuesses] = useState<string[]>([]);
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    maxStreak: 0,
    totalGames: 0,
    wins: 0,
    attempts: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0
    }
  });

  // Check username and redirect if needed
  useEffect(() => {
    const username = localStorage.getItem('wordle_username');
    if (!username) {
      router.push('/');
    }
  }, [router]);

  // Load initial game state
  useEffect(() => {
    const loadGameState = async () => {
      const todayKey = getTodayKey();
      
      // Check for existing daily result first
      const savedResult = localStorage.getItem('daily_result');
      if (savedResult) {
        try {
          const parsedResult = JSON.parse(savedResult);
          // Only use the result if it's from today
          if (parsedResult.date === todayKey) {
            setDailyResult(parsedResult);
            setGuesses(parsedResult.guesses);
            setGameState(prev => ({
              ...prev,
              isLoading: false,
              targetWord: parsedResult.word,
              hasWon: parsedResult.won,
              gameOver: true
            }));
            return;
          }
        } catch (error) {
          console.error("Error parsing saved result", error);
        }
      }

      // If no valid result for today, load new word
      try {
        const response = await fetch('/api/word');
        const data = await response.json();
        setGameState(prev => ({ 
          ...prev, 
          targetWord: data.word, 
          isLoading: false,
          gameOver: false,
          hasWon: false,
          showConfetti: false,
          showingWinAnimation: false
        }));
      } catch (error) {
        console.error('Failed to fetch word:', error);
        setGameState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadGameState();
  }, []);

  // Load stats
  useEffect(() => {
    const savedStats = localStorage.getItem('wordle_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleGameComplete = (won: boolean, attempts: number, gameGuesses: string[]) => {
    if (dailyResult) return;

    const result: DailyResult = {
      word: gameState.targetWord,
      won,
      attempts,
      date: getTodayKey(),
      guesses: gameGuesses
    };

    // Update stats
    const savedStats = localStorage.getItem('stats');
    const stats: Stats = savedStats ? JSON.parse(savedStats) : {
      currentStreak: 0,
      maxStreak: 0,
      totalGames: 0,
      wins: 0,
      attempts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 }
    };

    stats.totalGames += 1;
    
    if (won) {
      stats.wins += 1;
      stats.currentStreak += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.attempts[attempts as keyof typeof stats.attempts] += 1;
      
      // Show confetti and set showingWinAnimation
      setGameState(prev => ({ 
        ...prev, 
        hasWon: true, 
        showConfetti: true,
        showingWinAnimation: true 
      }));

      // After 5 seconds, hide confetti and show results
      setTimeout(() => {
        setGameState(prev => ({ 
          ...prev, 
          showConfetti: false,
          showingWinAnimation: false 
        }));
        // Save result after animation
        localStorage.setItem('daily_result', JSON.stringify(result));
        setDailyResult(result);
      }, 5000);
    } else {
      // For losses, show results immediately
      localStorage.setItem('daily_result', JSON.stringify(result));
      setDailyResult(result);
      stats.currentStreak = 0;
      stats.attempts.fail += 1;
    }

    localStorage.setItem('stats', JSON.stringify(stats));
    setStats(stats);
  };

  // Reset guesses when handleReset is called
  const handleReset = () => {
    const todayKey = getTodayKey();
    localStorage.removeItem(`wordle_daily_${todayKey}`);
    
    setGameState(prev => ({
      ...prev,
      hasWon: false,
      gameOver: false,
      showConfetti: false,
      showingWinAnimation: false
    }));
    
    setDailyResult(null);
    setGuesses([]); // Reset guesses

    // Remove from stats if exists
    const newStats = { ...stats };
    if (newStats.totalGames > 0) {
      newStats.totalGames -= 1;
      // If it was a win, adjust win stats
      if (dailyResult?.won) {
        newStats.wins -= 1;
        newStats.currentStreak -= 1;
        if (dailyResult.attempts) {
          newStats.attempts[dailyResult.attempts as keyof typeof newStats.attempts] -= 1;
        }
      } else {
        newStats.attempts.fail -= 1;
      }
      localStorage.setItem('wordle_stats', JSON.stringify(newStats));
      setStats(newStats);
    }
  };

  // Show loading state only when loading and no word is available
  if (gameState.isLoading && !gameState.targetWord) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Show results if we have them and not showing win animation
  if (dailyResult && !gameState.showingWinAnimation) {
    return (
      <div className="flex-1 flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-6 p-8 bg-white/10 rounded-xl backdrop-blur-sm">
          <DailyResultDisplay result={dailyResult} />
          
          <div className="flex flex-col items-center gap-4">
            <a
              href="/practice"
              className="text-white/80 dark:text-white dark:hover:text-white hover:text-white underline underline-offset-4 
                transition-colors duration-200 text-sm cursor-pointer"
            >
              Try Practice Mode
            </a>

            <a
              onClick={handleReset}
              className="text-white/60 dark:text-white dark:hover:text-white hover:text-white/80 underline underline-offset-4 
                transition-colors duration-200 text-xs cursor-pointer"
            >
              Reset Today&apos;s Game
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show game if we have a word and not showing results
  if (gameState.targetWord) {
    return (
      <div className="flex-1 flex items-center justify-center relative">
        <div className="flex flex-col items-center w-full">
          <motion.div 
            className="z-10 flex flex-col items-center gap-8 my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WordleGame 
              targetWord={gameState.targetWord}
              onGameComplete={handleGameComplete}
              guesses={guesses}
              onGuessesChange={setGuesses}
            />

            <HintButton 
              targetWord={gameState.targetWord}
              guesses={guesses}
              gameOver={gameState.gameOver}
            />
          </motion.div>

          <GameConfetti show={gameState.showConfetti} />

          <AnimatePresence>
            {gameState.showAbout && (
              <HowToPlay onClose={() => setGameState(prev => ({ ...prev, showAbout: false }))} />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );
} 