'use client';
import { useState, useEffect } from 'react';
import { WordleGame } from '@/components/WordleGame';
import { motion, AnimatePresence } from 'framer-motion';
import { GameResult } from '@/types/game';
import { ResultsPanel } from '@/components/ResultsPanel';
import { HintButton } from '@/components/HintButton';
import { GameConfetti } from '@/components/GameConfetti';
import { PracticeGameOverModal } from '@/components/PracticeGameOverModal';

export default function PracticePage() {
  const [gameState, setGameState] = useState({
    currentWord: '',
    gameStatus: 'playing' as 'playing' | 'won' | 'lost',
    showConfetti: false,
    showWinModal: false
  });

  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);

  const getRandomWord = async () => {
    const response = await fetch('/api/random-word');
    const data = await response.json();
    setGameState(prev => ({ ...prev, currentWord: data.word }));
  };

  useEffect(() => {
    getRandomWord();
    const saved = localStorage.getItem('practice_results');
    if (saved) {
      setGameResults(JSON.parse(saved));
    }
  }, []);

  const handleGameComplete = (won: boolean, attempts: number, gameGuesses: string[]) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const newResult: GameResult = {
      word: gameState.currentWord,
      attempts,
      won,
      timestamp: Date.now(),
      guesses: gameGuesses
    };
    
    const updatedResults = [newResult, ...gameResults];
    setGameResults(updatedResults);
    localStorage.setItem('practice_results', JSON.stringify(updatedResults));
    
    if (won) {
      // Show confetti first
      setGameState(prev => ({ ...prev, gameStatus: 'won', showConfetti: true }));
      
      // After 5 seconds, hide confetti and show win modal
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showConfetti: false, showWinModal: true }));
      }, 5000);
    } else {
      // Immediately show game over modal for losses
      setGameState(prev => ({ 
        ...prev, 
        gameStatus: 'lost',
        showWinModal: true 
      }));
    }
  };

  const handleRestart = async () => {
    // First reset the game state
    setGameState(prev => ({ 
      ...prev, 
      gameStatus: 'playing',
      showConfetti: false,
      showWinModal: false 
    }));
    
    // Clear guesses
    setGuesses([]);
    
    // Then fetch a new word
    try {
      const response = await fetch('/api/random-word');
      const data = await response.json();
      
      // Update the word after resetting the state
      setGameState(prev => ({ 
        ...prev, 
        currentWord: data.word,
      }));
    } catch (error) {
      console.error('Failed to fetch new word:', error);
    }
  };

  return (
    <div className="flex-1 flex justify-center relative">
      <motion.div 
        className="flex flex-col lg:flex-row gap-8 p-4 sm:p-8 w-full max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1">
          {gameState.currentWord && (
            <>
              <WordleGame 
                targetWord={gameState.currentWord}
                onGameComplete={handleGameComplete}
                guesses={guesses}
                onGuessesChange={setGuesses}
              />

              <HintButton 
                targetWord={gameState.currentWord}
                guesses={guesses}
                gameOver={gameState.gameStatus !== 'playing'}
              />
            </>
          )}
        </div>

        <ResultsPanel results={gameResults} />
      </motion.div>

      <GameConfetti show={gameState.showConfetti} />

      <AnimatePresence mode="wait">
        {gameState.showWinModal && (
          <PracticeGameOverModal
            onClose={handleRestart}
            word={gameState.currentWord}
            hasWon={gameState.gameStatus === 'won'}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 