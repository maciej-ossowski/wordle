'use client';
import { useState, useEffect } from 'react';
import { WordleGame } from '@/components/WordleGame';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';

interface GameResult {
  word: string;
  attempts: number;
  won: boolean;
  timestamp: number;
}

type GameStatus = 'playing' | 'won' | 'lost';

export default function PracticePage() {
  const [currentWord, setCurrentWord] = useState('');
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');

  const getRandomWord = async () => {
    // Get a random word from the list
    const response = await fetch('/api/random-word');
    const data = await response.json();
    setCurrentWord(data.word);
  };

  useEffect(() => {
    getRandomWord();
    // Load previous results from localStorage
    const saved = localStorage.getItem('practice_results');
    if (saved) {
      setGameResults(JSON.parse(saved));
    }
  }, []);

  const handleGameComplete = (won: boolean, attempts: number) => {
    if (gameStatus !== 'playing') return;
    setGameStatus(won ? 'won' : 'lost');

    const newResult: GameResult = {
      word: currentWord,
      attempts,
      won,
      timestamp: Date.now()
    };
    
    const updatedResults = [newResult, ...gameResults];
    setGameResults(updatedResults);
    localStorage.setItem('practice_results', JSON.stringify(updatedResults));
    
    if (won) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  };

  // Add handler for when game is restarted
  const handleRestart = async () => {
    await getRandomWord(); // Get new word first
    setGameStatus('playing'); // Reset game status
    setShowConfetti(false); // Ensure confetti is off
  };

  return (
    <div className="flex-1 flex justify-center relative">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      <motion.div 
        className="flex flex-col lg:flex-row gap-8 p-4 sm:p-8 w-full max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Game Area */}
        <div className="flex-1">
          {currentWord && (
            <WordleGame 
              targetWord={currentWord}
              onGameComplete={handleGameComplete}
              showConfetti={showConfetti}
              isPractice={true}
              onRestart={handleRestart}
            />
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:w-80 space-y-4 max-h-[400px] lg:max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          {gameResults.map((result, index) => (
            <div 
              key={index}
              className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg shadow-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-lg text-[#2980b9] dark:text-white">
                  {result.word}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  result.won 
                    ? 'bg-[#3498db] dark:bg-gray-800 text-white'
                    : 'bg-[#e74c3c] dark:bg-gray-800 text-white'
                }`}>
                  {result.won 
                    ? `${result.attempts} ${result.attempts === 1 ? 'try' : 'tries'}`
                    : 'Failed'
                  }
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(result.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}

          {gameResults.length === 0 && (
            <div className="text-center text-white/80 italic">
              Play some games to see your history
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 