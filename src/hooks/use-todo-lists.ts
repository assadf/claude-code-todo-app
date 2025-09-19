'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import type { MongoTodoList } from '@/types';
import type { SortOption } from '@/types/sorting';
import { DEFAULT_SORT_OPTION } from '@/types/sorting';
import { sortTodoLists } from '@/utils/sorting';
import { getSortPreference, setSortPreference } from '@/utils/localStorage';

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved sort preference on mount
  useEffect(() => {
    const savedPreference = getSortPreference();
    setSortOption(savedPreference);
    setIsInitialized(true);
  }, []);

  // Save sort preference when it changes (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      setSortPreference(sortOption);
    }
  }, [sortOption, isInitialized]);

  const { data, error, isLoading, mutate } = useSWR<MongoTodoList[]>(
    '/api/todolists',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Apply sorting to the todo lists
  const sortedTodoLists = useMemo(() => {
    if (!data) return data;
    return sortTodoLists(data, sortOption);
  }, [data, sortOption]);

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
    todoLists: sortedTodoLists,
    isLoading,
    error,
    mutate, // For manual revalidation
    deleteTodoList,
    sortOption,
    setSortOption,
  };
}
