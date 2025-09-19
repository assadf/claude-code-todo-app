'use client';

import { useState, useRef, useEffect } from 'react';
import type { FilterOption, SearchAndFilterState } from '@/types/filtering';
import { FILTER_OPTIONS } from '@/types/filtering';

interface SearchAndFilterControlsProps {
  filters: SearchAndFilterState;
  onChange: (filters: SearchAndFilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchAndFilterControls({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: SearchAndFilterControlsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    onChange({
      ...filters,
      searchQuery: value,
    });
  };

  const handleFilterChange = (statusFilter: FilterOption) => {
    onChange({
      ...filters,
      statusFilter,
    });
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    onChange({
      searchQuery: '',
      statusFilter: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery.length > 0 || filters.statusFilter !== 'all';
  const selectedFilter = FILTER_OPTIONS.find(
    option => option.value === filters.statusFilter
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search todo lists..."
            value={filters.searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="block w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-3 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                filters.statusFilter !== 'all'
                  ? 'border-purple-500 bg-purple-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isFilterOpen}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{selectedFilter?.label || 'Filter'}</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  isFilterOpen ? 'rotate-180' : ''
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

            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                <div
                  className="py-1"
                  role="listbox"
                  aria-label="Status filter options"
                >
                  {FILTER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-700 focus:bg-gray-700 focus:outline-none ${
                        filters.statusFilter === option.value
                          ? 'bg-gray-700 text-purple-400'
                          : 'text-gray-300'
                      }`}
                      role="option"
                      aria-selected={filters.statusFilter === option.value}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {option.description}
                        </span>
                      </div>
                      {filters.statusFilter === option.value && (
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

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        {hasActiveFilters ? (
          <>
            Showing {filteredCount} of {totalCount} todo list
            {totalCount !== 1 ? 's' : ''}
            {filters.searchQuery && (
              <span> matching &quot;{filters.searchQuery}&quot;</span>
            )}
            {filters.statusFilter !== 'all' && (
              <span>
                {filters.searchQuery ? ' and ' : ' '}
                {filters.statusFilter === 'completed'
                  ? 'completed'
                  : 'in progress'}
              </span>
            )}
          </>
        ) : (
          <>
            Showing {totalCount} todo list{totalCount !== 1 ? 's' : ''}
          </>
        )}
      </div>
    </div>
  );
}
