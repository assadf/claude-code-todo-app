'use client';

import useSWR from 'swr';
import type { MongoTodoList } from '@/types';

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
  const { data, error, isLoading, mutate } = useSWR<MongoTodoList[]>(
    '/api/todolists',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

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
    todoLists: data,
    isLoading,
    error,
    mutate, // For manual revalidation
    deleteTodoList,
  };
}
