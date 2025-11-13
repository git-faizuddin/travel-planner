'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type UserTheme = 'light' | 'dark'; // Only light/dark can be explicitly selected
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: UserTheme; // Expose only light/dark to users
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: UserTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyResolvedTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [userTheme, setUserTheme] = useState<UserTheme>('light'); // Exposed theme (light/dark only)

  useEffect(() => {
    // Initialize from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
      // User has explicitly selected a theme
      setInternalTheme(savedTheme);
      setUserTheme(savedTheme);
      setResolvedTheme(savedTheme);
      applyResolvedTheme(savedTheme);
    } else {
      // No explicit selection, use system preference
      setInternalTheme('system');
      const systemResolved = getSystemTheme();
      setUserTheme(systemResolved); // Show current resolved theme
      setResolvedTheme(systemResolved);
      applyResolvedTheme(systemResolved);
    }
  }, []);

  useEffect(() => {
    // Listen for system preference changes when theme is 'system'
    if (internalTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newResolved = getSystemTheme();
      setResolvedTheme(newResolved);
      setUserTheme(newResolved); // Update displayed theme
      applyResolvedTheme(newResolved);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [internalTheme]);

  const setTheme = (newTheme: UserTheme) => {
    // User explicitly selects light or dark
    setInternalTheme(newTheme);
    setUserTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setResolvedTheme(newTheme);
    applyResolvedTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: userTheme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

