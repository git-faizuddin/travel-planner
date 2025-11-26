'use client';

import { useState } from 'react';

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const SUGGESTION_PROMPTS = [
  "Find me a luxury hotel in Paris",
  "Budget-friendly hotels near the beach",
  "Family-friendly hotels with pool",
  "Business hotels in downtown area",
  "Romantic hotels with ocean view",
  "Pet-friendly hotels in the city center"
];

export default function ChatPanel({ onSendMessage, isLoading = false }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="flex items-center gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your ideal hotel (e.g., 'Luxury hotel in Tokyo with spa')"
            disabled={isLoading}
            className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 text-sm sm:text-base"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--secondary-blue)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 194, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--card-text)',
              borderColor: 'var(--card-border)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 text-sm sm:text-base whitespace-nowrap flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--button-accent)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputValue.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--button-accent-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--button-accent)';
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">Search</span>
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Prompts */}
      <div>
        <p 
          className="text-xs mb-3 transition-colors"
          style={{ color: 'var(--card-text-secondary)' }}
        >
          Try these suggestions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SUGGESTION_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(prompt)}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 line-clamp-2 text-center"
              style={{
                backgroundColor: 'var(--secondary-blue)',
                color: '#ffffff',
                borderColor: 'var(--secondary-blue)',
                borderWidth: '1px',
                borderStyle: 'solid',
                minHeight: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-blue)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

