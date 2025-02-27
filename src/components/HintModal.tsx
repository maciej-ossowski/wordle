'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintLetter: {
    letter: string;
    position: number;
  } | null;
}

export function HintModal({ isOpen, onClose, hintLetter }: HintModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md text-center"
          >
            <div className="text-2xl font-bold mb-6 text-[#2980b9]">Here&apos;s Your Hint!</div>
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
              onClick={onClose}
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
  );
} 