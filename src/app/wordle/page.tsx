'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { getTodayKey } from '@/lib/utils';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

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

// Animation variants for keyboard keys
const keyVariants = {
  pressed: { scale: 0.9 },
  tap: { scale: 0.9 }
};

interface DailyResult {
  word: string;
  won: boolean;
  attempts: number;
  date: string;
  guesses: string[];
}

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
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [targetWord, setTargetWord] = useState('XXXXX');
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usedHint, setUsedHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintLetter, setHintLetter] = useState<{letter: string, position: number} | null>(null);

  // Add username check
  useEffect(() => {
    const username = localStorage.getItem('wordle_username');
    if (!username) {
      router.push('/');
    }
  }, [router]);

  // Initialize window size after mount
  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Window size effect for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for existing result and fetch word
  useEffect(() => {
    const checkDailyResult = async () => {
      const todayKey = getTodayKey();
      const savedResult = localStorage.getItem(`wordle_daily_${todayKey}`);
      
      if (savedResult) {
        setDailyResult(JSON.parse(savedResult));
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

  // Handle keyboard input
  const handleKeyInput = (key: string) => {
    if (gameOver) return;
    
    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      } else {
        // Shake the current row if word is incomplete
        setShakingRow(guesses.length);
        setTimeout(() => setShakingRow(null), 400);
      }
    } else if (key === '⌫') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  };

  // Submit guess
  const submitGuess = () => {
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    const hasWon = currentGuess === targetWord;
    if (hasWon || newGuesses.length >= MAX_GUESSES) {
      const result: DailyResult = {
        word: targetWord,
        won: hasWon,
        attempts: newGuesses.length,
        date: getTodayKey(),
        guesses: newGuesses
      };
      
      localStorage.setItem(`wordle_daily_${getTodayKey()}`, JSON.stringify(result));
      setDailyResult(result);
      setGameOver(true);
      
      // Update statistics
      const savedStats = localStorage.getItem('wordle_stats');
      const stats: Stats = savedStats ? JSON.parse(savedStats) : {
        currentStreak: 0,
        maxStreak: 0,
        totalGames: 0,
        wins: 0,
        attempts: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0
        }
      };

      // Update stats
      stats.totalGames += 1;
      
      if (hasWon) {
        stats.wins += 1;
        stats.currentStreak += 1;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.attempts[newGuesses.length as keyof typeof stats.attempts] += 1;
      } else {
        stats.currentStreak = 0;
        stats.attempts.fail += 1;
      }

      // Save updated stats
      localStorage.setItem('wordle_stats', JSON.stringify(stats));

      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }
  };

  // Handle physical keyboard input
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
  }, [currentGuess, gameOver]);

  // Function to determine tile color based on letter status
  const getTileColor = (letter: string, index: number, word: string) => {
    if (!letter) return 'bg-white';
    if (word !== currentGuess && word) {
      if (letter === targetWord[index]) return 'bg-[#818384]';
      if (targetWord.includes(letter)) return 'bg-[#818384]';
      if (letter === 'E') return 'bg-[#b59f3b]';
      return 'bg-[#818384]';
    }
    return 'bg-white';
  };

  // Function to determine keyboard key color
  const getKeyColor = (key: string) => {
    if (guesses.some(guess => 
      guess.split('').some((letter, i) => 
        letter === key && targetWord[i] === letter
      )
    )) return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700 shadow-emerald-200 shadow-inner';
    
    if (guesses.some(guess => 
      guess.includes(key) && targetWord.includes(key)
    )) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 shadow-amber-200 shadow-inner';
    
    if (guesses.some(guess => guess.includes(key))) 
      return 'bg-gradient-to-br from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 shadow-gray-200 shadow-inner';
    
    return 'bg-gradient-to-br from-blue-100 to-gray-200 text-gray-700 hover:from-blue-200 hover:to-gray-300 shadow-sm';
  };

  // Update the getHint function
  const getHint = () => {
    const correctLetters = new Set();
    guesses.forEach((guess) => {
      guess.split('').forEach((letter, index) => {
        if (letter === targetWord[index]) {
          correctLetters.add(index);
        }
      });
    });

    const availableIndices = [];
    for (let i = 0; i < targetWord.length; i++) {
      if (!correctLetters.has(i)) {
        availableIndices.push(i);
      }
    }

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setHintLetter({
        letter: targetWord[randomIndex],
        position: randomIndex + 1
      });
      setShowHintModal(true);
      setUsedHint(true);
    }
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
          {/* Result Banner - Updated Design */}
          <div className="w-full max-w-[600px] p-6 bg-white rounded-lg shadow-lg text-center">
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
      {/* Split Game Container - centered */}
      <div className="z-10 flex flex-col items-center gap-8 my-8">
        {/* Letters Grid Panel */}
        <div className="flex justify-center">
          {/* Confetti effect */}
          {dailyResult && dailyResult.won && gameOver && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
            />
          )}

          {/* Game Board */}
          <div className="inline-grid grid-rows-6 gap-[6px] bg-[#3498db] p-[6px]">
            {[...Array(MAX_GUESSES)].map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="grid grid-cols-5 gap-[6px]"
                animate={shakingRow === rowIndex ? "shake" : ""}
                variants={tileVariants}
              >
                {[...Array(WORD_LENGTH)].map((_, colIndex) => {
                  const isCurrentRow = rowIndex === guesses.length;
                  const guess = isCurrentRow ? currentGuess : guesses[rowIndex] || '';
                  const letter = guess[colIndex] || '';
                  const isRevealed = !isCurrentRow && guess;

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
            ))}
          </div>
        </div>

        {/* Keyboard Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-[600px] mb-8">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5 mb-2">
              {row.map((key) => (
                <motion.button
                  key={key}
                  variants={keyVariants}
                  whileTap="tap"
                  onClick={() => handleKeyInput(key)}
                  className={`${
                    key.length > 1 ? 'px-4 text-sm' : 'w-11'
                  } h-14 rounded-lg flex items-center justify-center font-bold 
                  transition-all duration-200
                  ${getKeyColor(key)}
                  active:scale-95 
                  hover:shadow-lg hover:-translate-y-0.5`}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        {/* Hint Button */}
        {!gameOver && !usedHint && (
          <button
            onClick={getHint}
            className="text-white/80 hover:text-white underline underline-offset-4 
              transition-colors duration-200 text-sm mt-4"
          >
            Get a hint (reveals one letter)
          </button>
        )}
      </div>

      {/* Game Over Modal Overlay */}
      <AnimatePresence>
        {gameOver && showModal && (
          <>
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
                bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md
                text-center"
            >
              {dailyResult ? (
                <>
                  <h2 className="text-4xl font-bold mb-4">🎉 Congratulations!</h2>
                  <p className="text-xl mb-4">
                    You found the word <span className="font-bold text-emerald-500">{targetWord}</span>!
                  </p>
                  <p className="text-gray-600 mb-6">
                    You solved it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}
                  </p>

                  {/* Animated Stats Section */}
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
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                  <p className="text-xl mb-4">
                    The word was <span className="font-bold text-red-500">{targetWord}</span>
                  </p>
                  <p className="text-gray-600 mb-6">Better luck next time!</p>

                  {/* Stats for lost game */}
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
                </>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                  px-6 py-3 rounded-lg font-bold shadow-lg
                  hover:from-emerald-600 hover:to-teal-600 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Play Again
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowAbout(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">How to Play</h2>
              <div className="space-y-4 text-gray-600">
                <p>Guess the word in 6 tries.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Each guess must be a valid 5-letter word.</li>
                  <li>The color of the tiles will change to show how close your guess was:</li>
                </ul>
                <div className="space-y-2 pl-5">
                  <p>🟩 Green: Letter is in the correct spot</p>
                  <p>🟨 Yellow: Letter is in the word but in the wrong spot</p>
                  <p>⬜ Gray: Letter is not in the word</p>
                </div>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="mt-6 w-full bg-[#3498db] text-white px-6 py-3 rounded-lg 
                  font-bold shadow-lg hover:bg-[#2980b9] 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Got it!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowHintModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md text-center"
            >
              <div className="text-2xl font-bold mb-6 text-[#2980b9]">Here's Your Hint!</div>
              {hintLetter && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-[#3498db] rounded-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{hintLetter.letter}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    The letter <span className="font-bold text-[#2980b9]">{hintLetter.letter}</span> is 
                    at position <span className="font-bold text-[#2980b9]">{hintLetter.position}</span>
                  </p>
                </div>
              )}
              <button
                onClick={() => setShowHintModal(false)}
                className="mt-6 w-full bg-[#3498db] text-white px-6 py-3 rounded-lg 
                  font-bold shadow-lg hover:bg-[#2980b9] 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Got it!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 