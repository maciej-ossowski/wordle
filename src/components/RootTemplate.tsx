'use client';
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AnimatePresence, motion } from "framer-motion";

export function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-[#3498db] dark:bg-[#313233]">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 transition-none bg-[#3498db] dark:bg-[#313233]"
        style={{
          backgroundImage: 'linear-gradient(135deg, var(--layout-bg) 25%, var(--layout-bg-secondary) 25%)',
          backgroundSize: '100% 100%',
          opacity: 0.8
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navigation showAbout={showAbout} setShowAbout={setShowAbout} />
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#3498db] dark:bg-black z-40"
              onClick={() => setShowAbout(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white dark:bg-white rounded-xl p-8 shadow-2xl z-50 w-[90%] max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#2980b9] dark:text-white">How to Play</h2>
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
                className="mt-6 w-full bg-[#3498db] text-white dark:text-white px-6 py-3 rounded-lg 
                  font-bold shadow-lg hover:bg-[#2980b9] 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-white">Got it!</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
} 