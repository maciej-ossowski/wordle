'use client';
import { useState, useEffect } from 'react';
import { HintModal } from './HintModal';

interface HintButtonProps {
  targetWord: string;
  guesses: string[];
  gameOver: boolean;
}

const MAX_HINTS = 3;

export function HintButton({ targetWord, guesses, gameOver }: HintButtonProps) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintLetter, setHintLetter] = useState<{letter: string, position: number} | null>(null);
  const [usedPositions] = useState(new Set<number>());

  // Reset hint state when targetWord changes
  useEffect(() => {
    setHintsUsed(0);
    setShowHintModal(false);
    setHintLetter(null);
    usedPositions.clear();
  }, [targetWord, usedPositions]);

  const getHint = () => {
    console.log('Getting hint for:', { targetWord, guesses, gameOver, hintsUsed });
    
    if (hintsUsed >= MAX_HINTS) return;

    const correctLetters = new Set();
    guesses.forEach((guess) => {
      guess.split('').forEach((letter, index) => {
        if (letter === targetWord[index]) {
          correctLetters.add(index);
        }
      });
    });

    console.log('Correct letters:', correctLetters);

    const availableIndices = [];
    for (let i = 0; i < targetWord.length; i++) {
      if (!correctLetters.has(i) && !usedPositions.has(i)) {
        availableIndices.push(i);
      }
    }

    console.log('Available indices:', availableIndices);

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const hint = {
        letter: targetWord[randomIndex],
        position: randomIndex + 1
      };
      console.log('Setting hint:', hint);
      setHintLetter(hint);
      setShowHintModal(true);
      setHintsUsed(prev => prev + 1);
      usedPositions.add(randomIndex);
    }
  };

  console.log('HintButton render:', { showHintModal, hintLetter, hintsUsed });

  return (
    <>
      {!gameOver && hintsUsed < MAX_HINTS && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={getHint}
            className="text-white/80 hover:text-white underline underline-offset-4 
              transition-colors duration-200 text-sm mt-4"
          >
            Get a hint (reveals one letter)
          </button>
          <span className="text-white/60 text-xs">
            {MAX_HINTS - hintsUsed} hints remaining
          </span>
        </div>
      )}

      <HintModal 
        isOpen={showHintModal}
        onClose={() => {
          console.log('Closing hint modal');
          setShowHintModal(false);
        }}
        hintLetter={hintLetter}
        hintsRemaining={MAX_HINTS - hintsUsed}
      />
    </>
  );
} 