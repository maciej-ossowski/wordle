'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing username on component mount
  useEffect(() => {
    const stored = localStorage.getItem('wordle_username');
    if (stored) {
      setSavedUsername(stored);
      
      // Check if the username was stored more than 24 hours ago
      const timestamp = localStorage.getItem('wordle_username_timestamp');
      if (timestamp) {
        const storedTime = parseInt(timestamp);
        const now = new Date().getTime();
        if (now - storedTime > 24 * 60 * 60 * 1000) {
          // Clear if more than 24 hours old
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl"
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
          <p className="text-[#34495e] text-lg">Challenge your word-guessing skills!</p>
        </div>

        {savedUsername ? (
          // Welcome back screen
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-[#2980b9]">
              Welcome back, {savedUsername}!
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleContinue}
                className="w-full bg-[#3498db] text-white px-6 py-3 rounded-lg 
                  font-bold shadow-lg hover:bg-[#2980b9] 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Continue Playing
              </button>
              <button
                onClick={handleNewPlayer}
                className="w-full bg-white text-[#2980b9] border-2 border-[#3498db] 
                  px-6 py-3 rounded-lg font-bold hover:bg-[#f8f9fa] 
                  transform hover:-translate-y-0.5 transition-all duration-200"
              >
                New Player
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
              <label htmlFor="username" className="block text-lg font-semibold text-[#2980b9] mb-2">
                Enter your name to start playing
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#3498db] 
                  focus:ring-2 focus:ring-[#2980b9] focus:border-[#2980b9] 
                  transition-all duration-200 text-[#34495e]"
                placeholder="Your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3498db] text-white px-6 py-3 rounded-lg 
                font-bold shadow-lg hover:bg-[#2980b9] 
                transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Playing
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
