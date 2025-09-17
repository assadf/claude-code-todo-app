'use client';

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

function TodoItemCard({ item }: { item: TodoItem }) {
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

        {/* Priority badge */}
        <div className="flex-shrink-0">
          <PriorityBadge priority={item.priority} />
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
        <TodoItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}
