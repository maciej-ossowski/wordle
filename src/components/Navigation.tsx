'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  showAbout?: boolean;
  setShowAbout?: (show: boolean) => void;
}

export function Navigation({ setShowAbout }: NavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path === '/wordle' && pathname === '/');
    return `text-white font-semibold hover:opacity-80 transition-opacity px-4 py-2 rounded-full
      ${isActive ? 'bg-white/20' : ''}`;
  };

  return (
    <nav className="w-full px-8 py-4 flex justify-between items-center bg-transparent">
      <div 
        onClick={() => {
          window.location.href = '/';
        }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image
          src="/images/carry1st.svg"
          alt="Carry1st Games"
          width={174}
          height={44}
          priority
        />
      </div>
      <div className="flex gap-8">
        {!isHomePage && (
          <>
            <a 
              href="/wordle"
              className={getLinkClass('/wordle')}
            >
              GAME OF THE DAY
            </a>
            <a 
              href="/stats"
              className={getLinkClass('/stats')}
            >
              STATS
            </a>
            <a 
              href="/practice"
              className={getLinkClass('/practice')}
            >
              PRACTICE
            </a>
            <a 
              href="/leaderboard"
              className={getLinkClass('/leaderboard')}
            >
              LEADERBOARD
            </a>
          </>
        )}

        {setShowAbout && (
          <button 
            onClick={() => setShowAbout(true)}
            className="text-white font-semibold hover:opacity-80 transition-opacity px-4 py-2"
          >
            ABOUT
          </button>
        )}

        <a 
          href="https://www.carry1st.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white font-semibold hover:opacity-80 transition-opacity px-4 py-2"
        >
          CARRY1ST
        </a>
      </div>
    </nav>
  );
} 