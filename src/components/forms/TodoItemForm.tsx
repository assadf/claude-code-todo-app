'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateTodoItemData } from '@/types';
import { Priority } from '@/types';

// Zod schema for form validation
const todoItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  priority: z
    .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT])
    .optional()
    .default(Priority.MEDIUM),
  dueDate: z.string().optional(),
});

interface TodoItemFormData {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

interface TodoItemFormProps {
  onSubmit: (data: CreateTodoItemData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
  className?: string;
}

const priorityOptions = [
  { value: Priority.LOW, label: 'Low', color: 'text-green-400' },
  { value: Priority.MEDIUM, label: 'Medium', color: 'text-yellow-400' },
  { value: Priority.HIGH, label: 'High', color: 'text-orange-400' },
  { value: Priority.URGENT, label: 'Urgent', color: 'text-red-400' },
];

export default function TodoItemForm({
  onSubmit,
  isLoading = false,
  error,
  onCancel,
  className = '',
}: TodoItemFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<TodoItemFormData>({
    resolver: zodResolver(todoItemSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      dueDate: undefined,
    },
    mode: 'onChange',
  });

  const watchedTitle = watch('title');

  const handleFormSubmit = async (data: TodoItemFormData) => {
    try {
      await onSubmit({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });

      // Reset form on successful submission
      reset();
      setIsExpanded(false);
    } catch (error) {
      // Error is handled by parent component
      console.error('Failed to submit todo item:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsExpanded(false);
    onCancel?.();
  };

  return (
    <div className={`card p-6 ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title Field - Always visible */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Task Title *
          </label>
          <div className="relative">
            <input
              {...register('title')}
              id="title"
              type="text"
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-gray-600 bg-dark-800 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
              onFocus={() => setIsExpanded(true)}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>
        </div>

        {/* Expandable section */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-700 pt-4">
            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                placeholder="Add more details..."
                className="w-full resize-none rounded-lg border border-gray-600 bg-dark-800 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Priority and Due Date Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Priority Field */}
              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Priority
                </label>
                <select
                  {...register('priority')}
                  id="priority"
                  className="w-full rounded-lg border border-gray-600 bg-dark-800 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Due Date Field */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  id="dueDate"
                  type="date"
                  className="w-full rounded-lg border border-gray-600 bg-dark-800 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500 bg-red-900/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {(isExpanded || watchedTitle.length > 0) && (
          <div className="flex items-center justify-end space-x-3 border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="btn-primary inline-flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Task
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
