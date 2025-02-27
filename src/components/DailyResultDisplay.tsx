import { DailyResult } from '@/types/game';
import { GameBoard } from './GameBoard';

interface DailyResultDisplayProps {
  result: DailyResult;
}

export function DailyResultDisplay({ result }: DailyResultDisplayProps) {
  return (
    <div className="z-10 flex flex-col items-center gap-8 my-8">
      {/* Result Banner */}
      <div className="w-full max-w-[600px] p-6 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg shadow-lg text-center">
        {result.won ? (
          // Success State
          <div className="text-emerald-500">
            <svg 
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-lg font-bold mb-1">
              Solved in {result.attempts} {result.attempts === 1 ? 'try' : 'tries'}!
            </p>
          </div>
        ) : (
          // Failure State
          <div className="text-red-500 flex items-center justify-center gap-3">
            <svg 
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-lg font-bold">
              Better luck next time!
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500">
          Come back tomorrow for a new word
        </p>
      </div>

      {/* Game Board with actual guesses */}
      <div className="opacity-50 pointer-events-none">
        <GameBoard guesses={result.guesses} targetWord={result.word} />
      </div>
    </div>
  );
} 