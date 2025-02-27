import { motion } from 'framer-motion';
import { WORD_LENGTH, MAX_GUESSES } from '@/lib/constants';
import { tileVariants } from '@/lib/animations';

interface GameBoardProps {
  guesses: string[];
  targetWord: string;
}

export function GameBoard({ guesses, targetWord }: GameBoardProps) {
  // Function to determine tile color
  const getTileColor = (letter: string, index: number) => {
    if (!letter) return 'bg-white';
    if (letter === targetWord[index]) return 'bg-green-500'; // Correct position
    if (targetWord.includes(letter)) return 'bg-yellow-500'; // Wrong position but in word
    return 'bg-gray-500'; // Not in word
  };

  return (
    <div className="inline-grid grid-rows-6 gap-[6px] bg-[#3498db] p-[6px]">
      {[...Array(MAX_GUESSES)].map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="grid grid-cols-5 gap-[6px]"
          variants={tileVariants}
        >
          {[...Array(WORD_LENGTH)].map((_, colIndex) => {
            const guess = guesses[rowIndex] || '';
            const letter = guess[colIndex] || '';
            const isRevealed = guess !== '';

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                variants={tileVariants}
                initial="initial"
                animate={isRevealed ? "flip" : ""}
                className={`w-[62px] h-[62px] flex items-center justify-center text-[2rem] font-bold 
                  rounded-md border border-[#d3d6da]/30
                  ${getTileColor(letter, colIndex)}
                  ${isRevealed ? 'text-white' : 'text-black'}`}
              >
                {letter}
              </motion.div>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
} 