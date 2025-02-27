'use client';
import { motion } from 'framer-motion';

interface PracticeGameOverModalProps {
  onClose: () => void;
  word: string;
  hasWon: boolean;
}

export function PracticeGameOverModal({
  onClose,
  word,
  hasWon,
}: PracticeGameOverModalProps) {
  const handlePlayAgain = async () => {
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#3498db] dark:bg-black z-[9999]"
        onClick={handlePlayAgain}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl z-[10000] w-[90%] max-w-md text-center"
      >
        {hasWon ? (
          <>
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              🎉 Congratulations!
            </h2>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
              You found the word <span className="font-bold text-blue-500">{word}</span>!
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Game Over
            </h2>
            <p className="text-lg mb-2 text-gray-600 dark:text-gray-300">
              The word was <span className="font-bold text-red-500">{word}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Better luck next time!
            </p>
          </>
        )}
        
        <button
          onClick={handlePlayAgain}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg 
            font-bold shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 
            transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Play Again
        </button>
      </motion.div>
    </>
  );
} 