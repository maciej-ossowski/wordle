'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Container animation variant
const containerVariants = {
  hidden: { 
    opacity: 0,
    rotate: -5,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Row animation variant for staggered entry
const rowVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: index * 0.1 // Stagger effect
    }
  })
};

export default function LeaderboardPage() {
  return (
    <motion.div 
      className="flex-1 flex justify-center p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#2980b9]">Leaderboard</h1>
        <div className="space-y-4">
          {/* Add leaderboard content here */}
          <p className="text-center text-gray-600">Coming soon...</p>
        </div>
      </div>
    </motion.div>
  );
} 