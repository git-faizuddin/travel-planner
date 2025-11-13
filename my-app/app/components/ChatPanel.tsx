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
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your ideal hotel (e.g., 'Luxury hotel in Tokyo with spa')"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
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
            className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            style={{
              backgroundColor: 'var(--button-bg)',
              color: 'var(--button-text)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputValue.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--button-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--button-bg)';
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Prompts */}
      <div>
        <p 
          className="text-sm mb-3 transition-colors"
          style={{ color: 'var(--card-text-secondary)' }}
        >
          Try these suggestions:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(prompt)}
              disabled={isLoading}
              className="px-4 py-3 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                borderColor: 'var(--card-border)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-bg)';
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

