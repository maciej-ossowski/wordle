import { GameResult } from '@/types/game';

interface ResultsPanelProps {
  results: GameResult[];
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  return (
    <div className="lg:w-80 space-y-4 max-h-[400px] lg:max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      {results.map((result, index) => (
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

      {results.length === 0 && (
        <div className="text-center text-white/80 italic">
          Play some games to see your history
        </div>
      )}
    </div>
  );
} 