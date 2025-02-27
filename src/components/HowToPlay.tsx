import { motion } from 'framer-motion';

interface HowToPlayProps {
  onClose: () => void;
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
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
          bg-[var(--modal-bg)] rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">How to Play</h2>
        <div className="space-y-4 text-[var(--foreground)]">
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
          onClick={onClose}
          className="mt-6 w-full bg-[#3498db] text-white px-6 py-3 rounded-lg 
            font-bold shadow-lg hover:bg-[#2980b9] 
            transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Got it!
        </button>
      </motion.div>
    </>
  );
} 