'use client';

import { useRouter } from 'next/navigation';
import { useTodoLists } from '@/hooks/use-todo-lists';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { SearchAndFilterControls } from '@/components/ui/SearchAndFilterControls';
import type { MongoTodoList } from '@/types';

interface TodoListCardProps {
  todoList: MongoTodoList;
}

function TodoListCard({ todoList }: TodoListCardProps) {
  const router = useRouter();

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewDetails = () => {
    router.push(`/todo-lists/${todoList._id}`);
  };

  const getStatusBadge = (isCompleted: boolean) => {
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
  };

  return (
    <div className="card p-6 transition-all duration-200 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{todoList.name}</h3>
          {todoList.description && (
            <p className="mt-1 text-sm text-gray-400">{todoList.description}</p>
          )}
        </div>
        {getStatusBadge(todoList.isCompleted)}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg
              className="mr-1 h-4 w-4"
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
              className="mr-1 h-4 w-4"
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

        <button
          onClick={handleViewDetails}
          className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
        >
          View Details
        </button>
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
        No TODO lists yet
      </h3>
      <p className="mb-6 text-gray-400">
        Create your first TODO list to get started with organizing your tasks
      </p>
      <button
        className="btn-primary create-list-button"
        data-testid="create-first-list-button"
      >
        Create Your First List
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="card p-6">
          <div className="mb-4 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TodoListsDisplayProps {
  showControls?: boolean;
}

export function TodoListsDisplay({
  showControls = true,
}: TodoListsDisplayProps) {
  const {
    todoLists,
    totalCount,
    filteredCount,
    isLoading,
    error,
    sortOption,
    setSortOption,
    filters,
    setFilters,
  } = useTodoLists();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
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
          Failed to load todo lists
        </h3>
        <p className="text-sm text-gray-400">{error.message}</p>
      </div>
    );
  }

  // Show empty state only if no data at all (not filtered results)
  if (!todoLists && totalCount === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter and Sort Controls */}
      {showControls && totalCount > 0 && (
        <div className="space-y-4">
          <SearchAndFilterControls
            filters={filters}
            onChange={setFilters}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
          <div className="flex justify-end">
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </div>
      )}

      {/* Results */}
      {todoLists && todoLists.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {todoLists.map(todoList => (
            <TodoListCard key={todoList._id} todoList={todoList} />
          ))}
        </div>
      ) : totalCount > 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            No matching todo lists
          </h3>
          <p className="text-sm text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
