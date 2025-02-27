'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintLetter: { letter: string; position: number } | null;
  hintsRemaining: number;
}

export function HintModal({ isOpen, onClose, hintLetter, hintsRemaining }: HintModalProps) {
  console.log('HintModal render:', { isOpen, hintLetter });
  
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl z-[10000] w-[90%] max-w-md text-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Here&apos;s Your Hint
              </h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
                The letter <span className="font-bold text-blue-500">{hintLetter?.letter}</span> is 
                in position <span className="font-bold text-blue-500">{hintLetter?.position}</span>
              </p>
              {hintsRemaining > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  You have {hintsRemaining} hint{hintsRemaining !== 1 ? 's' : ''} remaining
                </p>
              )}
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold 
                  hover:bg-blue-600 transition-colors duration-200"
              >
                Got it!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
} 