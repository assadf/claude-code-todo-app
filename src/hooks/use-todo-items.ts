'use client';

import useSWR from 'swr';
import type { CreateTodoItemData, Priority } from '@/types';

interface TodoItemResponse {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string;
  todoListId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

interface ApiError {
  error: string;
  message: string;
  details?: any;
}

const fetcher = async (url: string): Promise<TodoItemResponse[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch todo items');
  }

  const result: ApiResponse<TodoItemResponse[]> = await response.json();
  return result.data;
};

export function useTodoItems(todoListId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<TodoItemResponse[]>(
    todoListId ? `/api/todolists/${todoListId}/items` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const addTodoItem = async (todoItem: CreateTodoItemData) => {
    if (!todoListId) {
      throw new Error('Todo list ID is required');
    }

    const response = await fetch(`/api/todolists/${todoListId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoItem),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'Failed to add todo item');
    }

    const result: ApiResponse<TodoItemResponse> = await response.json();

    // Optimistically update the cache
    mutate();

    return result.data;
  };

  return {
    todoItems: data || [],
    isLoading,
    error,
    mutate,
    addTodoItem,
  };
}
