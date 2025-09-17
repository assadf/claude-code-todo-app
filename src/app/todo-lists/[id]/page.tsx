'use client';

import { useRouter } from 'next/navigation';
import { useTodoList } from '@/hooks/use-todo-list';
import type { MongoTodoList } from '@/types';

interface TodoListDetailPageProps {
  params: { id: string };
}

interface StatusBadgeProps {
  isCompleted: boolean;
}

function StatusBadge({ isCompleted }: StatusBadgeProps) {
  if (isCompleted) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      In Progress
    </span>
  );
}

interface TodoListHeaderProps {
  todoList: MongoTodoList;
}

function TodoListHeader({ todoList }: TodoListHeaderProps) {
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card p-8">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-white">
            {todoList.name}
          </h1>
          {todoList.description && (
            <p className="text-lg text-gray-400">{todoList.description}</p>
          )}
        </div>
        <StatusBadge isCompleted={todoList.isCompleted} />
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-400">
        <div className="flex items-center">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span>{todoList._count?.todoItems || 0} tasks</span>
        </div>
        <div className="flex items-center">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7"
            />
          </svg>
          <span>Created {formatDate(todoList.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
        <svg
          className="h-10 w-10 text-white"
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
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">
        No TODO items yet
      </h3>
      <p className="mb-6 text-gray-400">
        Add your first TODO item to get started
      </p>
      <button className="btn-primary">
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
        Add TODO Item
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="space-y-6">
      {/* Header skeleton */}
      <div className="card p-8">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-700" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="flex space-x-6">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-800" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="card p-12">
        <div className="mx-auto mb-6 h-20 w-20 animate-pulse rounded-full bg-gray-700" />
        <div className="space-y-3 text-center">
          <div className="mx-auto h-6 w-48 animate-pulse rounded bg-gray-700" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-gray-800" />
          <div className="mx-auto h-10 w-32 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">
        Failed to load todo list
      </h3>
      <p className="text-sm text-gray-400">{error.message}</p>
    </div>
  );
}

export default function TodoListDetailPage({
  params,
}: TodoListDetailPageProps) {
  const router = useRouter();
  const { todoList, isLoading, error } = useTodoList(params.id);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="mx-auto max-w-4xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="btn-secondary inline-flex items-center"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <ErrorState error={error} />
        </div>
      </div>
    );
  }

  if (!todoList) {
    return null;
  }

  const hasNoItems =
    !todoList._count?.todoItems || todoList._count.todoItems === 0;

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={handleBackToDashboard}
            className="btn-secondary inline-flex items-center"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Todo List Header */}
        <div className="mb-8">
          <TodoListHeader todoList={todoList} />
        </div>

        {/* Todo Items Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">TODO Items</h2>
            <button className="btn-primary">
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
              Add TODO Item
            </button>
          </div>

          {hasNoItems ? (
            <EmptyState />
          ) : (
            <div className="card p-6">
              <p className="text-center text-gray-400">
                TODO items will be displayed here once implemented
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
