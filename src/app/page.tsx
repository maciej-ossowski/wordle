'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState<string | null>(null);

  // Check for existing username on component mount
  useEffect(() => {
    const stored = localStorage.getItem('wordle_username');
    if (stored) {
      setSavedUsername(stored);
      // Remove auto-redirect
      // router.push('/wordle');
      
      // Check if the username was stored more than 24 hours ago
      const timestamp = localStorage.getItem('wordle_username_timestamp');
      if (timestamp) {
        const storedTime = parseInt(timestamp);
        const now = Date.now();
        if (now - storedTime > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('wordle_username');
          localStorage.removeItem('wordle_username_timestamp');
          setSavedUsername(null);
        }
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('wordle_username', username);
      localStorage.setItem('wordle_username_timestamp', new Date().getTime().toString());
      // Use window.location for a full page navigation
      window.location.href = '/wordle';
    }
  };

  const handleContinue = () => {
    // Use window.location for a full page navigation
    window.location.href = '/wordle';
  };

  const handleNewPlayer = () => {
    localStorage.removeItem('wordle_username');
    localStorage.removeItem('wordle_username_timestamp');
    setSavedUsername(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-6xl font-bold mb-2 text-[#2980b9]"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            WORDLE
          </motion.h1>
          <p className="text-[#34495e] dark:text-gray-300 text-lg">Challenge your word-guessing skills!</p>
        </div>

        {savedUsername ? (
          // Welcome back screen
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-[#2980b9] dark:text-white">
              Welcome back, {savedUsername}!
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleContinue}
                className="w-full bg-[#3498db] dark:bg-[#2980b9] text-white px-6 py-3 rounded-lg 
                  font-bold shadow-lg hover:bg-[#2980b9] dark:hover:bg-[#3498db]
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-white">Continue Playing</span>
              </button>
              <button
                onClick={handleNewPlayer}
                className="w-full bg-white dark:bg-transparent text-[#2980b9] dark:text-white border-2 border-[#3498db] 
                  px-6 py-3 rounded-lg font-bold hover:bg-[#f8f9fa] dark:hover:bg-white/10
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-[#2980b9] dark:text-white">New Player</span>
              </button>
            </div>
          </motion.div>
        ) : (
          // New player form
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <label htmlFor="username" className="block text-lg font-semibold text-[#2980b9] dark:text-white mb-2">
                Enter your name to start playing
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#3498db] 
                  focus:ring-2 focus:ring-[#2980b9] focus:border-[#2980b9] 
                  transition-all duration-200 text-[#34495e] dark:text-white
                  dark:bg-[#1a1a1a] dark:border-[#3498db]"
                placeholder="Your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3498db] dark:bg-[#2980b9] text-white px-6 py-3 rounded-lg 
                font-bold shadow-lg hover:bg-[#2980b9] dark:hover:bg-[#3498db]
                transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-white">Start Playing</span>
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
