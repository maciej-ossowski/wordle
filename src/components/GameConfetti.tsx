import ReactConfetti from 'react-confetti';

interface GameConfettiProps {
  show: boolean;
}

export function GameConfetti({ show }: GameConfettiProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
        colors={['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0']}
        tweenDuration={15000}
      />
    </div>
  );
} 