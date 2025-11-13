'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const cycleTheme = () => {
    // Only toggle between light and dark
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--button-text)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    } else {
      // dark theme
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--button-text)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full transition-colors"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderBottomColor: 'var(--header-border)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span 
              className="text-xl font-semibold transition-colors"
              style={{ color: 'var(--header-text)' }}
            >
              Hotel Recommendations
            </span>
          </Link>

          {/* Navigation and Theme Toggle Group */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link
                href="/home"
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: pathname === '/' || pathname === '/home' ? 'var(--button-bg)' : 'transparent',
                  color: pathname === '/' || pathname === '/home' ? 'var(--button-text)' : 'var(--header-text)'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/' && pathname !== '/home') {
                    e.currentTarget.style.backgroundColor = 'var(--button-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/' && pathname !== '/home') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: pathname === '/blog' ? 'var(--button-bg)' : 'transparent',
                  color: pathname === '/blog' ? 'var(--button-text)' : 'var(--header-text)'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/blog') {
                    e.currentTarget.style.backgroundColor = 'var(--button-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/blog') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Blog
              </Link>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-bg)';
              }}
              aria-label={`Current theme: ${theme}. Click to toggle theme`}
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
