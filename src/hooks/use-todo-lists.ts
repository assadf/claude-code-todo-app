'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import type { MongoTodoList } from '@/types';
import type { SortOption } from '@/types/sorting';
import type { SearchAndFilterState } from '@/types/filtering';
import { DEFAULT_SORT_OPTION } from '@/types/sorting';
import { DEFAULT_SEARCH_AND_FILTER_STATE } from '@/types/filtering';
import { sortTodoLists } from '@/utils/sorting';
import { filterTodoLists } from '@/utils/filtering';
import {
  getSortPreference,
  setSortPreference,
  getFilterPreference,
  setFilterPreference,
} from '@/utils/localStorage';

interface ApiResponse {
  data: MongoTodoList[];
  message: string;
}

interface ApiError {
  error: string;
  message: string;
}

const fetcher = async (url: string): Promise<MongoTodoList[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch todo lists');
  }

  const result: ApiResponse = await response.json();
  return result.data;
};

export function useTodoLists() {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION);
  const [filters, setFilters] = useState<SearchAndFilterState>(
    DEFAULT_SEARCH_AND_FILTER_STATE
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedSortPreference = getSortPreference();
    const savedFilterPreference = getFilterPreference();
    setSortOption(savedSortPreference);
    setFilters(savedFilterPreference);
    setIsInitialized(true);
  }, []);

  // Save preferences when they change (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      setSortPreference(sortOption);
    }
  }, [sortOption, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setFilterPreference(filters);
    }
  }, [filters, isInitialized]);

  const { data, error, isLoading, mutate } = useSWR<MongoTodoList[]>(
    '/api/todolists',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Apply filtering and sorting to the todo lists
  const processedTodoLists = useMemo(() => {
    if (!data) return data;

    // First filter, then sort
    const filteredLists = filterTodoLists(data, filters);
    return sortTodoLists(filteredLists, sortOption);
  }, [data, filters, sortOption]);

  // Get counts for display
  const totalCount = data?.length || 0;
  const filteredCount = processedTodoLists?.length || 0;

  const deleteTodoList = async (todoListId: string): Promise<void> => {
    const response = await fetch(`/api/todolists/${todoListId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'Failed to delete todo list');
    }

    // Revalidate the cache after successful deletion
    await mutate();
  };

  return {
    todoLists: processedTodoLists,
    totalCount,
    filteredCount,
    isLoading,
    error,
    mutate, // For manual revalidation
    deleteTodoList,
    sortOption,
    setSortOption,
    filters,
    setFilters,
  };
}
