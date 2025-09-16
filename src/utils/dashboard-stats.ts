import type { MongoTodoList, DashboardStats } from '@/types';

/**
 * Calculate dashboard statistics from todo lists
 */
export function calculateDashboardStats(
  todoLists: MongoTodoList[]
): DashboardStats {
  if (!todoLists || todoLists.length === 0) {
    return {
      totalTodoLists: 0,
      activeTodoLists: 0,
      completedTodoLists: 0,
      totalTodoItems: 0,
      completedTodoItems: 0,
    };
  }

  const stats = todoLists.reduce(
    (acc, list) => {
      // Count total lists
      acc.totalTodoLists += 1;

      // Count completed vs active lists
      if (list.isCompleted) {
        acc.completedTodoLists += 1;
      } else {
        acc.activeTodoLists += 1;
      }

      // Count total todo items
      const itemCount = list._count?.todoItems || 0;
      acc.totalTodoItems += itemCount;

      // For now, we don't have completed item data in the API response
      // This would need to be added to the API if we want to track completed items
      // acc.completedTodoItems += list.todoItems?.filter(item => item.isCompleted).length || 0;

      return acc;
    },
    {
      totalTodoLists: 0,
      activeTodoLists: 0,
      completedTodoLists: 0,
      totalTodoItems: 0,
      completedTodoItems: 0,
    }
  );

  return stats;
}

/**
 * Get dashboard stat cards configuration
 */
export interface StatCard {
  id: string;
  label: string;
  value: number;
  icon: string;
  bgColor: string;
}

export function getDashboardStatCards(stats: DashboardStats): StatCard[] {
  return [
    {
      id: 'total-lists',
      label: 'Total Lists',
      value: stats.totalTodoLists,
      icon: 'clipboard',
      bgColor: 'bg-blue-600',
    },
    {
      id: 'completed-lists',
      label: 'Completed',
      value: stats.completedTodoLists,
      icon: 'check-circle',
      bgColor: 'bg-green-600',
    },
    {
      id: 'active-lists',
      label: 'In Progress',
      value: stats.activeTodoLists,
      icon: 'clock',
      bgColor: 'bg-orange-600',
    },
    {
      id: 'total-tasks',
      label: 'Total Tasks',
      value: stats.totalTodoItems,
      icon: 'lightning',
      bgColor: 'bg-purple-600',
    },
  ];
}
