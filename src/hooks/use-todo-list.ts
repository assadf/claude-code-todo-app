'use client';

import useSWR from 'swr';
import type { MongoTodoList } from '@/types';

interface ApiResponse {
  data: MongoTodoList;
  message: string;
}

interface ApiError {
  error: string;
  message: string;
}

const fetcher = async (url: string): Promise<MongoTodoList> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch todo list');
  }

  const result: ApiResponse = await response.json();
  return result.data;
};

export function useTodoList(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<MongoTodoList>(
    id ? `/api/todolists/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    todoList: data,
    isLoading,
    error,
    mutate, // For manual revalidation
  };
}
