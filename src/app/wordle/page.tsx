'use client';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getTodayKey } from '@/lib/utils';
import { HowToPlay } from '@/components/HowToPlay';
import { WordleGame } from '@/components/WordleGame';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';

interface DailyResult {
  word: string;
  won: boolean;
  attempts: number;
  date: string;
  guesses: string[];
}


// Add this type before the isDailyResult function
type UnknownResult = {
  word?: unknown;
  won?: unknown;
  attempts?: unknown;
  date?: unknown;
  guesses?: unknown;
};

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

// Animation variants for tiles
const tileVariants = {
  initial: { rotateX: 0 },
  flip: { 
    rotateX: 360,
    transition: { duration: 0.6 }
  },
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

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

// Replace AnimatedNumber component with this simpler version
function AnimatedNumber({ value }: { value: number }) {
  const [prevValue, setPrevValue] = useState(0);
  
  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  return (
    <span className="inline-block transition-transform duration-500 ease-out" 
      style={{ transform: prevValue === value ? 'none' : 'translateY(-20px)' }}>
      {value}
    </span>
  );
}

export default function WordlePage() {
  const router = useRouter();
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [targetWord, setTargetWord] = useState('XXXXX');
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    maxStreak: 0,
    totalGames: 0,
    wins: 0,
    attempts: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0
    }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Update the username check effect
  useEffect(() => {
    const username = localStorage.getItem('wordle_username');
    const pathname = window.location.pathname;
    
    // Only redirect if we're on /wordle and there's no username
    if (!username && pathname === '/wordle') {
      router.push('/');
    }
  }, [router]);

  // Check for existing result and fetch word
  useEffect(() => {
    const checkDailyResult = async () => {
      const todayKey = getTodayKey();
      const savedResult = localStorage.getItem(`wordle_daily_${todayKey}`);
      
      if (savedResult) {

        try {
            const parsedResult = JSON.parse(savedResult);
            if (isDailyResult(parsedResult)) {
              setDailyResult(parsedResult);
            } else {
              console.error("Parsed result is not a valid DailyResult");
            }
          } catch (error) {
            console.error("Error parsing saved result", error);
          }
          
          // Update the function signature
          function isDailyResult(result: UnknownResult): result is DailyResult {
            return (
              typeof result === 'object' &&
              typeof result.word === 'string' &&
              typeof result.won === 'boolean' &&
              typeof result.attempts === 'number' &&
              typeof result.date === 'string' &&
              Array.isArray(result.guesses)
            );
          }
      }

      try {
        const response = await fetch('/api/word');
        const data = await response.json();
        setTargetWord(data.word);
      } catch (error) {
        console.error('Failed to fetch word:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDailyResult();
  }, []);

  // Load stats on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('wordle_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Memoize submitGuess function
  const submitGuess = React.useCallback(() => {
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    const hasWon = currentGuess === targetWord;
    if (hasWon || newGuesses.length >= MAX_GUESSES) {
      // Set these states for both daily and practice games
      setGameOver(true);
      setHasWon(hasWon);
      setShowConfetti(hasWon); // Set showConfetti when the game is won
      
      // Daily game specific logic
      if (window.location.pathname === '/wordle') {
        const result: DailyResult = {
          word: targetWord,
          won: hasWon,
          attempts: newGuesses.length,
          date: getTodayKey(),
          guesses: newGuesses
        };
        
        localStorage.setItem(`wordle_daily_${getTodayKey()}`, JSON.stringify(result));
        setDailyResult(result);
        
        // Update statistics
        const savedStats = localStorage.getItem('wordle_stats');
        const newStats: Stats = savedStats ? JSON.parse(savedStats) : {
          currentStreak: 0,
          maxStreak: 0,
          totalGames: 0,
          wins: 0,
          attempts: {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0
          }
        };

        newStats.totalGames += 1;
        
        if (hasWon) {
          newStats.wins += 1;
          newStats.currentStreak += 1;
          newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
          newStats.attempts[newGuesses.length as keyof typeof newStats.attempts] += 1;
        } else {
          newStats.currentStreak = 0;
          newStats.attempts.fail += 1;
        }

        // Save updated stats and update state
        localStorage.setItem('wordle_stats', JSON.stringify(newStats));
        setStats(newStats);
      }

      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }
  }, [currentGuess, guesses, targetWord]);

  // Memoize handleKeyInput with submitGuess dependency
  const handleKeyInput = useMemo(() => {
    return (key: string) => {
      if (gameOver) return;
      
      if (key === 'ENTER') {
        if (currentGuess.length === WORD_LENGTH) {
          submitGuess();
        }
      } else if (key === '⌫') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key);
      }
    };
  }, [currentGuess, gameOver, submitGuess]);

  // Use handleKeyInput directly without destructuring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyInput('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyInput('⌫');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Function to determine tile color based on letter status
  const getTileColor = (letter: string, index: number, word: string) => {
    if (!letter) return 'bg-[var(--tile-bg)] border-[var(--tile-border)]';
    if (word !== currentGuess && word) {
      if (letter === targetWord[index]) return 'bg-green-500 text-white';
      if (targetWord.includes(letter)) return 'bg-yellow-500 text-white';
      return 'bg-gray-500 text-white';
    }
    return 'bg-[var(--tile-bg)] border-[var(--tile-border)]';
  };

  // Add handleGameComplete function
  const handleGameComplete = (won: boolean, attempts: number) => {
    setHasWon(won);
    setShowConfetti(won);
    setGameOver(true);

    // Daily game specific logic
    const result: DailyResult = {
      word: targetWord,
      won,
      attempts,
      date: getTodayKey(),
      guesses: [...guesses, currentGuess]
    };
    
    localStorage.setItem(`wordle_daily_${getTodayKey()}`, JSON.stringify(result));
    setDailyResult(result);
    
    // Update statistics
    const newStats: Stats = { ...stats };
    newStats.totalGames += 1;
    
    if (won) {
      newStats.wins += 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.attempts[attempts as keyof typeof newStats.attempts] += 1;
    } else {
      newStats.currentStreak = 0;
      newStats.attempts.fail += 1;
    }

    // Save updated stats and update state
    localStorage.setItem('wordle_stats', JSON.stringify(newStats));
    setStats(newStats);

    setTimeout(() => {
      setShowModal(true);
    }, 2000);
  };

  // Add loading state to the render
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Show previous result if exists
  if (dailyResult) {
    return (
      <div className="flex-1 flex items-center justify-center relative">
        <div className="z-10 flex flex-col items-center gap-8 my-8">
          {/* Result Banner */}
          <div className="w-full max-w-[600px] p-6 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg shadow-lg text-center">
            {dailyResult.won ? (
              // Success State
              <div className="text-emerald-500">
                <svg 
                  className="w-12 h-12 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-lg font-bold mb-1">
                  Solved in {dailyResult.attempts} {dailyResult.attempts === 1 ? 'try' : 'tries'}!
                </p>
              </div>
            ) : (
              // Failure State
              <div className="text-red-500 flex items-center justify-center gap-3">
                <svg 
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-lg font-bold">
                  Better luck next time!
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Come back tomorrow for a new word
            </p>
          </div>

          {/* Game Board with actual guesses */}
          <div className="opacity-50 pointer-events-none">
            <div className="flex justify-center">
              <div className="inline-grid grid-rows-6 gap-[6px] bg-[#3498db] p-[6px]">
                {[...Array(MAX_GUESSES)].map((_, rowIndex) => {
                  const guess = dailyResult.guesses && dailyResult.guesses[rowIndex] ? dailyResult.guesses[rowIndex] : '';
                  
                  return (
                    <motion.div
                      key={rowIndex}
                      className="grid grid-cols-5 gap-[6px]"
                      variants={tileVariants}
                    >
                      {[...Array(WORD_LENGTH)].map((_, colIndex) => {
                        const letter = guess[colIndex] || '';
                        const isRevealed = guess !== '';

                        return (
                          <motion.div
                            key={colIndex}
                            variants={tileVariants}
                            initial="initial"
                            animate={isRevealed ? "flip" : ""}
                            className={`w-[62px] h-[62px] flex items-center justify-center text-[2rem] font-bold 
                              rounded-md border border-[#d3d6da]/30
                              ${getTileColor(letter, colIndex, guess)}
                              ${isRevealed ? 'text-white' : 'text-black'}`}
                          >
                            {letter}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reset Game Link */}
          <button
            onClick={() => {
              const todayKey = getTodayKey();
              localStorage.removeItem(`wordle_daily_${todayKey}`);
              window.location.reload();
            }}
            className="text-white/80 hover:text-white underline underline-offset-4 
              transition-colors duration-200 text-sm mt-4"
          >
            Remove daily game and play again
          </button>
        </div>
      </div>
    );
  }

  // Regular game render
  return (
    <div className="flex-1 flex items-center justify-center relative">
      <motion.div 
        className="z-10 flex flex-col items-center gap-8 my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WordleGame 
          targetWord={targetWord}
          onGameComplete={handleGameComplete}
          showConfetti={showConfetti}
        />
      </motion.div>

      {/* Game Over Modal Overlay */}
      <AnimatePresence>
        {gameOver && showModal && (
          <>
            {/* Add Confetti */}
            {showConfetti && hasWon && (
              <ReactConfetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
              />
            )}

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-[var(--modal-bg)] rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md text-center"
            >
              {hasWon ? (
                <>
                  <h2 className="text-4xl font-bold mb-4">🎉 Congratulations!</h2>
                  <p className="text-xl mb-4">
                    You found the word <span className="font-bold text-emerald-500">{targetWord}</span>!
                  </p>
                  <p className="text-gray-600 mb-6">
                    You solved it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}
                  </p>

                  {/* Show stats only for daily game */}
                  {dailyResult && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-500">
                          <AnimatedNumber value={stats.currentStreak} />
                        </div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">
                          <AnimatedNumber value={stats.maxStreak} />
                        </div>
                        <div className="text-sm text-gray-600">Max Streak</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-500">
                          <AnimatedNumber value={stats.totalGames} />
                        </div>
                        <div className="text-sm text-gray-600">Games Played</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-amber-500">
                          <AnimatedNumber value={Math.round((stats.wins / stats.totalGames) * 100)} />%
                        </div>
                        <div className="text-sm text-gray-600">Win Rate</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                  <p className="text-xl mb-4">
                    The word was <span className="font-bold text-red-500">{targetWord}</span>
                  </p>
                  <p className="text-gray-600 mb-6">
                    {dailyResult ? 
                      "Better luck next time! Come back tomorrow for a new word." :
                      "Better luck next time! Try another word."
                    }
                  </p>

                  {/* Show stats only for daily game */}
                  {dailyResult && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">
                          Streak Reset
                        </div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">
                          <AnimatedNumber value={stats.maxStreak} />
                        </div>
                        <div className="text-sm text-gray-600">Max Streak</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                  px-6 py-3 rounded-lg font-bold shadow-lg
                  hover:from-emerald-600 hover:to-teal-600 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {dailyResult ? "Play Tomorrow" : "Play Again"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && <HowToPlay onClose={() => setShowAbout(false)} />}
      </AnimatePresence>
    </div>
  );
} 