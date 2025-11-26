'use client';

import { useState, useRef, useEffect } from 'react';

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
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSuggestionRef = useRef<string | null>(null);

  // Clear timeout if component unmounts or input changes
  useEffect(() => {
    return () => {
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      // Clear any pending auto-submit
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = null;
      }
      pendingSuggestionRef.current = null;
      
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      // Clear any existing timeout
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
      
      // Populate the input field with the suggestion so user can see what will be analyzed
      setInputValue(suggestion);
      pendingSuggestionRef.current = suggestion;
      
      // Focus the input field
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      // Auto-submit after a brief moment to analyze the suggestion
      // Only if the user hasn't edited the input
      autoSubmitTimeoutRef.current = setTimeout(() => {
        // Check if input value still matches the suggestion (user didn't edit it)
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        const currentValue = inputElement?.value || '';
        
        if (pendingSuggestionRef.current === suggestion && 
            currentValue === suggestion && 
            !isLoading) {
          onSendMessage(suggestion);
          setInputValue('');
          pendingSuggestionRef.current = null;
        }
        autoSubmitTimeoutRef.current = null;
      }, 500); // Small delay to allow user to see/edit the query
    }
  };

  // Track input changes to cancel auto-submit if user edits
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If user edits the input, cancel auto-submit
    if (pendingSuggestionRef.current && newValue !== pendingSuggestionRef.current) {
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = null;
      }
      pendingSuggestionRef.current = null;
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
            onChange={handleInputChange}
            placeholder="Describe your ideal hotel (e.g., 'Luxury hotel in Tokyo with spa')"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
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
            className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
          className="text-xs mb-3 transition-colors"
          style={{ color: 'var(--card-text-secondary)' }}
        >
          Try these suggestions:
        </p>
        <div className="grid grid-cols-3 gap-2">
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

