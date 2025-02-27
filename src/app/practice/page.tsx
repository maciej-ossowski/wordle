'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WordleGame } from '@/components/WordleGame';

interface GameResult {
  word: string;
  attempts: number;
  won: boolean;
  timestamp: number;
}

export default function PracticePage() {
  const [currentWord, setCurrentWord] = useState('');
  const [gameResults, setGameResults] = useState<GameResult[]>([]);

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
    const newResult: GameResult = {
      word: currentWord,
      attempts,
      won,
      timestamp: Date.now()
    };
    
    const updatedResults = [newResult, ...gameResults];
    setGameResults(updatedResults);
    localStorage.setItem('practice_results', JSON.stringify(updatedResults));
    
    // Start a new game after a short delay
    setTimeout(() => {
      getRandomWord();
    }, 2000);
  };

  return (
    <div className="flex-1 flex justify-center relative">
      <div className="flex gap-8 p-8 w-full max-w-7xl my-8">
        {/* Game Area */}
        <div className="flex-1">
          {currentWord && (
            <WordleGame 
              targetWord={currentWord}
              onGameComplete={handleGameComplete}
              showConfetti={false}
            />
          )}
        </div>

        {/* Results Panel - Redesigned */}
        <div className="w-80 space-y-3 h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          {gameResults.map((result, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-lg text-[#2980b9]">{result.word}</span>
                <span className={`text-sm font-medium ${
                  result.won ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {result.won 
                    ? `${result.attempts} ${result.attempts === 1 ? 'try' : 'tries'}`
                    : 'Failed'
                  }
                </span>
              </div>
              <div className="text-xs text-gray-500">
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
      </div>
    </div>
  );
} 