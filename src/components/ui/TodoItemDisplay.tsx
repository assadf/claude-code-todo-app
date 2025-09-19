'use client';

import { useState } from 'react';
import type { Priority } from '@/types';

interface TodoItem {
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

interface TodoItemDisplayProps {
  todoItems: TodoItem[];
  isLoading?: boolean;
  onDeleteItem?: (itemId: string) => Promise<void>;
}

const priorityConfig = {
  LOW: {
    label: 'Low',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  MEDIUM: {
    label: 'Medium',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  HIGH: {
    label: 'High',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-500',
  },
  URGENT: {
    label: 'Urgent',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span className={`mr-1 h-2 w-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function TodoItemCard({
  item,
  onDeleteItem,
}: {
  item: TodoItem;
  onDeleteItem?: (itemId: string) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const isOverdue =
    item.dueDate && new Date(item.dueDate) < new Date() && !item.isCompleted;

  const handleDelete = async () => {
    if (!onDeleteItem || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteItem(item._id);
    } catch (error) {
      console.error('Failed to delete todo item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card p-4 transition-colors hover:border-purple-500">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {/* Title and completion status */}
          <div className="flex items-center space-x-3">
            <button
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                item.isCompleted
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-400 hover:border-purple-500'
              }`}
            >
              {item.isCompleted && (
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <h3
              className={`text-lg font-medium ${item.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}
            >
              {item.title}
            </h3>
          </div>

          {/* Description */}
          {item.description && (
            <p className="ml-8 mt-2 text-sm text-gray-400">
              {item.description}
            </p>
          )}

          {/* Metadata */}
          <div className="ml-8 mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <span>Created {formatDate(item.createdAt)}</span>
            {item.dueDate && (
              <span className={isOverdue ? 'font-medium text-red-400' : ''}>
                Due {formatDate(item.dueDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>

        {/* Priority badge and actions */}
        <div className="flex flex-shrink-0 items-center space-x-3">
          <PriorityBadge priority={item.priority} />
          {onDeleteItem && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isDeleting
                  ? 'cursor-not-allowed text-gray-600'
                  : 'text-gray-400 hover:bg-red-50/10 hover:text-red-400'
              }`}
              title={isDeleting ? 'Deleting...' : 'Delete todo item'}
            >
              {isDeleting ? (
                <svg
                  className="h-4 w-4 animate-spin"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
        <svg
          className="h-8 w-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">No tasks yet</h3>
      <p className="text-gray-400">Add your first task using the form above</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="card p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 animate-pulse rounded bg-gray-700" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-700" />
              </div>
              <div className="ml-8 h-4 w-1/2 animate-pulse rounded bg-gray-800" />
              <div className="ml-8 h-3 w-1/3 animate-pulse rounded bg-gray-800" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TodoItemDisplay({
  todoItems,
  isLoading = false,
  onDeleteItem,
}: TodoItemDisplayProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (todoItems.length === 0) {
    return <EmptyState />;
  }

  // Sort items: incomplete first, then by priority, then by due date
  const sortedItems = [...todoItems].sort((a, b) => {
    // First, sort by completion status (incomplete first)
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    // Then by priority (URGENT > HIGH > MEDIUM > LOW)
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Then by due date (soonest first, null dates last)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedItems.map(item => (
        <TodoItemCard key={item._id} item={item} onDeleteItem={onDeleteItem} />
      ))}
    </div>
  );
}
