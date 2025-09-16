'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mutate } from 'swr';
import type { CreateTodoListData } from '@/types';

const todoListSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

type TodoListFormData = z.infer<typeof todoListSchema>;

interface TodoListFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TodoListForm({ onSuccess, onCancel }: TodoListFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TodoListFormData>({
    resolver: zodResolver(todoListSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: TodoListFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const createData: CreateTodoListData = {
        name: data.name,
        description: data.description || undefined,
      };

      const response = await fetch('/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create list');
      }

      // Invalidate SWR cache for todo lists
      mutate('/api/todolists');

      // Reset form
      reset();

      // Call success callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div
          className="rounded-lg border border-red-600 bg-red-900/20 p-4"
          data-testid="form-error-message"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            type="text"
            {...register('name')}
            className="block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            placeholder="Enter list name"
            data-testid="todo-list-name-input"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300"
        >
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            placeholder="Enter list description (optional)"
            data-testid="todo-list-description-input"
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary w-full sm:w-auto"
          disabled={isLoading}
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
          disabled={isLoading}
          data-testid="create-list-submit-button"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
              Creating...
            </>
          ) : (
            'Create List'
          )}
        </button>
      </div>
    </form>
  );
}
