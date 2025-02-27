'use client';
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
          <p className="text-center text-gray-600">Coming soon...</p>
        </div>
      </div>
    </motion.div>
  );
} 