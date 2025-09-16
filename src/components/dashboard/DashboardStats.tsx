'use client';

import { useTodoLists } from '@/hooks/use-todo-lists';
import {
  calculateDashboardStats,
  getDashboardStatCards,
} from '@/utils/dashboard-stats';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  bgColor: string;
}

function StatCard({ label, value, icon, bgColor }: StatCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'clipboard':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        );
      case 'check-circle':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case 'clock':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case 'lightning':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgColor}`}
        >
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {renderIcon()}
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="card p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-700" />
            <div className="ml-4 space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-700" />
              <div className="h-6 w-8 animate-pulse rounded bg-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="card p-6 md:col-span-2 lg:col-span-4">
      <div className="text-center">
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
          Failed to load stats
        </h3>
        <p className="mb-4 text-sm text-gray-400">{error.message}</p>
        <button onClick={onRetry} className="btn-secondary">
          Try Again
        </button>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const { todoLists, isLoading, error, mutate } = useTodoLists();

  if (error) {
    return <ErrorState error={error} onRetry={() => mutate()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const stats = calculateDashboardStats(todoLists || []);
  const statCards = getDashboardStatCards(stats);

  return (
    <>
      {statCards.map(card => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          icon={card.icon}
          bgColor={card.bgColor}
        />
      ))}
    </>
  );
}
