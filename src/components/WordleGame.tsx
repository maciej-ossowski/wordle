'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WORD_LENGTH, MAX_GUESSES } from '@/lib/constants';
import { tileVariants, keyVariants } from '@/lib/animations';
import React from 'react';

const KEYBOARD_ROWS = {
  desktop: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ],
  mobile: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
    ['ENTER', 'O', 'P', '⌫']
  ]
} as const;

interface WordleGameProps {
  targetWord: string;
  onGameComplete: (won: boolean, attempts: number, guesses: string[]) => void;
  guesses: string[];
  onGuessesChange: (guesses: string[]) => void;
}

export function WordleGame({ 
  targetWord, 
  onGameComplete,
  guesses,
  onGuessesChange
}: WordleGameProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [shakingRow, setShakingRow] = useState<number | null>(null);

  // 1. Define handleGameComplete first
  const handleGameComplete = useCallback((won: boolean, attempts: number, guesses: string[]) => {
    onGameComplete(won, attempts, guesses);
  }, [onGameComplete]);

  // 2. Define submitGuess with fixed dependencies
  const submitGuess = useCallback(() => {
    const newGuesses = [...guesses, currentGuess];
    onGuessesChange(newGuesses);
    setCurrentGuess('');
    
    const won = currentGuess.toUpperCase() === targetWord.toUpperCase();

    if (won || newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      handleGameComplete(won, newGuesses.length, newGuesses);
    }
  }, [currentGuess, guesses, targetWord, onGuessesChange, handleGameComplete]);

  // 3. Define handleKeyClick with fixed dependencies
  const handleKeyClick = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      } else {
        setShakingRow(guesses.length);
        setTimeout(() => setShakingRow(null), 400);
      }
    } else if (key === '⌫' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameOver, submitGuess, guesses.length]);

  // 4. Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyClick]);

  // Reset game state when target word changes
  useEffect(() => {
    setGameOver(false);
  }, [targetWord]);

  // Helper functions for tile and key colors
  const getTileColor = (letter: string, index: number, word: string) => {
    if (!letter) return 'bg-white';
    if (word !== currentGuess && word) {
      if (letter === targetWord[index]) return 'bg-green-500';
      if (targetWord.includes(letter)) return 'bg-yellow-500';
      return 'bg-gray-500';
    }
    return 'bg-white border-2 border-gray-300';
  };

  const getKeyColor = (key: string) => {
    if (guesses.some(guess => 
      guess.split('').some((letter, i) => 
        letter === key && targetWord[i] === letter
      )
    )) return 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700';
    
    if (guesses.some(guess => 
      guess.includes(key) && targetWord.includes(key)
    )) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700';
    
    if (guesses.some(guess => guess.includes(key))) 
      return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700';
    
    return 'bg-gradient-to-br from-blue-100 to-gray-200 text-gray-700 hover:from-blue-200 hover:to-gray-300';
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Game Board */}
      <div className="flex justify-center">
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
                    key={`${rowIndex}-${colIndex}`}
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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-2 sm:p-4 md:p-8 w-full max-w-[600px]">
        {/* Desktop Keyboard */}
        <div className="hidden sm:block">
          {KEYBOARD_ROWS.desktop.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5 mb-2">
              {row.map((key) => (
                <motion.button
                  key={key}
                  variants={keyVariants}
                  whileTap="tap"
                  onClick={() => {
                    console.log('On-screen keyboard click:', key);
                    handleKeyClick(key);
                  }}
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

        {/* Mobile Keyboard */}
        <div className="block sm:hidden">
          {KEYBOARD_ROWS.mobile.map((row, rowIndex) => (
            <div key={rowIndex} 
              className={`flex justify-center gap-[2px] mb-1 ${
                rowIndex === 3 ? 'px-2' : ''
              }`}
            >
              {row.map((key) => (
                <motion.button
                  key={key}
                  variants={keyVariants}
                  whileTap="tap"
                  onClick={() => handleKeyClick(key)}
                  className={`${
                    key.length > 1 ? 'px-2 text-xs min-w-[3rem]' : 'w-[2.5rem]'
                  } h-10 rounded-lg flex items-center justify-center font-bold 
                  transition-all duration-200
                  ${getKeyColor(key)}
                  active:scale-95`}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 