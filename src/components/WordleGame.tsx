'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { KEYBOARD_ROWS, WORD_LENGTH, MAX_GUESSES } from '@/lib/constants';
import { tileVariants, keyVariants } from '@/lib/animations';

interface WordleGameProps {
  targetWord: string;
  onGameComplete?: (won: boolean, attempts: number) => void;
  showConfetti?: boolean;
}

export function WordleGame({ targetWord, onGameComplete, showConfetti = true }: WordleGameProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

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

  // Handle keyboard input
  const handleKeyInput = (key: string) => {
    if (gameOver) return;
    
    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      } else {
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

    const won = currentGuess === targetWord;
    if (won || newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      if (onGameComplete) {
        onGameComplete(won, newGuesses.length);
      }
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

  // Function to determine tile color
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

  const hasWon = guesses.includes(targetWord);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Letters Grid Panel */}
      <div className="flex justify-center">
        {/* Confetti effect */}
        {showConfetti && hasWon && gameOver && (
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

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md
                text-center"
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
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                  <p className="text-xl mb-4">
                    The word was <span className="font-bold text-red-500">{targetWord}</span>
                  </p>
                  <p className="text-gray-600 mb-6">Better luck next time!</p>
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
    </div>
  );
} 