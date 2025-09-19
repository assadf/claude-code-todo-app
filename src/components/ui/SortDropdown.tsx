'use client';

import { useState, useRef, useEffect } from 'react';
import type { SortOption, SortConfig } from '@/types/sorting';
import { SORT_OPTIONS } from '@/types/sorting';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  label?: string;
}

export function SortDropdown({
  value: currentValue,
  onChange,
  label = 'Sort by',
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedOption = SORT_OPTIONS.find(
    option => option.value === currentValue
  );

  const handleOptionSelect = (option: SortConfig) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">{label}:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="flex items-center space-x-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedOption?.label || 'Select option'}</span>
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
          <div className="py-1" role="listbox" aria-label="Sort options">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-700 focus:bg-gray-700 focus:outline-none ${
                  currentValue === option.value
                    ? 'bg-gray-700 text-purple-400'
                    : 'text-gray-300'
                }`}
                role="option"
                aria-selected={currentValue === option.value}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-gray-400">
                    {option.description}
                  </span>
                </div>
                {currentValue === option.value && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
