import type { MongoTodoList } from '@/types';
import type { FilterOption, SearchAndFilterState } from '@/types/filtering';

/**
 * Filter todo lists by search query and status
 */
export function filterTodoLists(
  todoLists: MongoTodoList[],
  filters: SearchAndFilterState
): MongoTodoList[] {
  const { searchQuery, statusFilter } = filters;

  return todoLists.filter(todoList => {
    // Apply search query filter
    const matchesSearch =
      searchQuery.length === 0 ||
      todoList.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todoList.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);

    // Apply status filter
    const matchesStatus = (() => {
      switch (statusFilter) {
        case 'completed':
          return todoList.isCompleted;
        case 'in-progress':
          return !todoList.isCompleted;
        case 'all':
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus;
  });
}

/**
 * Check if any filters are active (non-default)
 */
export function hasActiveFilters(filters: SearchAndFilterState): boolean {
  return filters.searchQuery.length > 0 || filters.statusFilter !== 'all';
}

/**
 * Get a human-readable description of active filters
 */
export function getFilterDescription(
  filters: SearchAndFilterState,
  totalCount: number,
  filteredCount: number
): string {
  const parts: string[] = [];

  if (filters.searchQuery.length > 0) {
    parts.push(`matching "${filters.searchQuery}"`);
  }

  if (filters.statusFilter !== 'all') {
    const statusLabel =
      filters.statusFilter === 'completed' ? 'completed' : 'in progress';
    parts.push(statusLabel);
  }

  if (parts.length === 0) {
    return `Showing ${totalCount} todo list${totalCount !== 1 ? 's' : ''}`;
  }

  const filterDesc = parts.join(' and ');
  return `Showing ${filteredCount} of ${totalCount} todo list${totalCount !== 1 ? 's' : ''} ${filterDesc}`;
}
