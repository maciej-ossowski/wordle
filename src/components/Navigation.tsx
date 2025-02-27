'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';

interface NavigationProps {
  showAbout?: boolean;
  setShowAbout?: (show: boolean) => void;
}

// Add these SVG icons at the top of the file
const SunIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
  </svg>
);

export function Navigation({ setShowAbout }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { isDark, toggleDarkMode } = useDarkMode();

  // Move these before they are used
  const navLinks = [
    { 
      path: '/wordle',
      text: { 
        desktop: 'GAME OF THE DAY',
        tablet: 'GAME',
        mobile: 'GAME'
      }
    },
    {
      path: '/stats',
      text: { 
        desktop: 'STATS',
        tablet: 'STATS',
        mobile: 'STATS'
      }
    },
    {
      path: '/practice',
      text: { 
        desktop: 'PRACTICE',
        tablet: 'PRACTICE',
        mobile: 'PRACTICE'
      }
    },
    {
      path: '/leaderboard',
      text: { 
        desktop: 'LEADERBOARD',
        tablet: 'LEADERS',
        mobile: 'LEADERS'
      }
    }
  ];

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path === '/wordle' && pathname === '/');
    return `text-white font-semibold hover:opacity-80 transition-opacity px-4 py-2 rounded-full
      ${isActive ? 'bg-white/20' : ''}`;
  };

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
    setIsMounted(true);
  }, []);

  // Don't render theme toggle until mounted
  if (!mounted) {
    return (
      <nav className="w-full px-4 sm:px-8 py-4 flex items-center bg-transparent relative z-50">
        {/* Logo */}
        <div 
          onClick={() => {
            window.location.href = '/';
          }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/carry1st.svg"
            alt="Carry1st Games"
            width={120}
            height={30}
            className="sm:w-[174px] sm:h-[44px]"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          {!isHomePage && (
            <>
              {navLinks.map(link => (
                <a 
                  key={link.path}
                  href={link.path} 
                  className={getLinkClass(link.path)}
                >
                  {link.text.desktop}
                </a>
              ))}
            </>
          )}
          {setShowAbout && (
            <button 
              onClick={() => setShowAbout(true)}
              className="text-white font-semibold hover:opacity-80 transition-opacity"
            >
              ABOUT
            </button>
          )}
          <a 
            href="https://www.carry1st.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-semibold hover:opacity-80 transition-opacity"
          >
            CARRY1ST
          </a>
        </div>

        {/* Mobile Menu Button */}
        {isMounted && (
          <div className="md:hidden ml-auto flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 z-40 lg:hidden dark:bg-black/40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full w-48 py-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl z-50">
                  {!isHomePage && (
                    <>
                      {navLinks.map(link => (
                        <a 
                          key={link.path}
                          href={link.path} 
                          className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {link.text.mobile}
                        </a>
                      ))}
                    </>
                  )}
                  {setShowAbout && (
                    <button 
                      onClick={() => {
                        setShowAbout(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      ABOUT
                    </button>
                  )}
                  <a 
                    href="https://www.carry1st.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    CARRY1ST
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="w-full px-4 sm:px-8 py-4 flex items-center bg-transparent relative z-50">
      {/* Logo */}
      <div 
        onClick={() => {
          window.location.href = '/';
        }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image
          src="/images/carry1st.svg"
          alt="Carry1st Games"
          width={120}
          height={30}
          className="sm:w-[174px] sm:h-[44px]"
          priority
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        {!isHomePage && (
          <>
            {navLinks.map(link => (
              <a 
                key={link.path}
                href={link.path} 
                className={getLinkClass(link.path)}
              >
                {link.text.desktop}
              </a>
            ))}
          </>
        )}
        {setShowAbout && (
          <button 
            onClick={() => setShowAbout(true)}
            className="text-white font-semibold hover:opacity-80 transition-opacity"
          >
            ABOUT
          </button>
        )}
        <a 
          href="https://www.carry1st.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white font-semibold hover:opacity-80 transition-opacity"
        >
          CARRY1ST
        </a>
        
        {/* Dark Mode Toggle - Desktop */}
        {mounted && (
          <button
            onClick={toggleDarkMode}
            className="font-semibold hover:opacity-80 transition-opacity text-white"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      {isMounted && (
        <div className="md:hidden ml-auto flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-40 lg:hidden dark:bg-black/40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full w-48 py-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl z-50">
                {!isHomePage && (
                  <>
                    {navLinks.map(link => (
                      <a 
                        key={link.path}
                        href={link.path} 
                        className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {link.text.mobile}
                      </a>
                    ))}
                  </>
                )}
                {setShowAbout && (
                  <button 
                    onClick={() => {
                      setShowAbout(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    ABOUT
                  </button>
                )}
                <a 
                  href="https://www.carry1st.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  CARRY1ST
                </a>
                
                {/* Dark Mode Toggle - Mobile Menu */}
                {mounted && (
                  <button
                    onClick={toggleDarkMode}
                    className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{isDark ? 'LIGHT MODE' : 'DARK MODE'}</span>
                      <span className="text-gray-800 dark:text-white">
                        {isDark ? <SunIcon /> : <MoonIcon />}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 