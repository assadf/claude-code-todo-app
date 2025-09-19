import {
  filterTodoLists,
  hasActiveFilters,
  getFilterDescription,
} from './filtering';
import type { MongoTodoList } from '@/types';
import type { SearchAndFilterState } from '@/types/filtering';

describe('filtering utilities', () => {
  const mockTodoLists: MongoTodoList[] = [
    {
      _id: '1',
      name: 'Shopping List',
      description: 'Weekly grocery shopping',
      isCompleted: false,
      userId: 'user-123',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      _count: { todoItems: 5 },
    },
    {
      _id: '2',
      name: 'Work Tasks',
      description: 'Important work items',
      isCompleted: true,
      userId: 'user-123',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      _count: { todoItems: 3 },
    },
    {
      _id: '3',
      name: 'Vacation Planning',
      description: 'Plan summer vacation trip',
      isCompleted: false,
      userId: 'user-123',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
      _count: { todoItems: 8 },
    },
    {
      _id: '4',
      name: 'Home Improvement',
      description: undefined,
      isCompleted: true,
      userId: 'user-123',
      createdAt: '2024-01-04T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z',
      _count: { todoItems: 2 },
    },
  ];

  describe('filterTodoLists', () => {
    it('should return all lists when no filters are applied', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toEqual(mockTodoLists);
    });

    it('should filter by search query in name', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'work',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work Tasks');
    });

    it('should filter by search query in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'vacation',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Vacation Planning');
    });

    it('should handle case-insensitive search', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'SHOPPING',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shopping List');
    });

    it('should filter by completed status', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'completed',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(2);
      expect(result.every(list => list.isCompleted)).toBe(true);
    });

    it('should filter by in-progress status', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'in-progress',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(2);
      expect(result.every(list => !list.isCompleted)).toBe(true);
    });

    it('should combine search and status filters', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'work',
        statusFilter: 'completed',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work Tasks');
      expect(result[0].isCompleted).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'nonexistent',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(0);
    });

    it('should handle lists without descriptions', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'improvement',
        statusFilter: 'all',
      };

      const result = filterTodoLists(mockTodoLists, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Home Improvement');
    });

    it('should handle empty todo lists array', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'test',
        statusFilter: 'all',
      };

      const result = filterTodoLists([], filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'all',
      };

      expect(hasActiveFilters(filters)).toBe(false);
    });

    it('should return true when search query is active', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'test',
        statusFilter: 'all',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true when status filter is active', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'completed',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return true when both filters are active', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'test',
        statusFilter: 'in-progress',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });
  });

  describe('getFilterDescription', () => {
    it('should return basic count when no filters are active', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'all',
      };

      const description = getFilterDescription(filters, 5, 5);
      expect(description).toBe('Showing 5 todo lists');
    });

    it('should handle singular count', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'all',
      };

      const description = getFilterDescription(filters, 1, 1);
      expect(description).toBe('Showing 1 todo list');
    });

    it('should include search query in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'work',
        statusFilter: 'all',
      };

      const description = getFilterDescription(filters, 5, 2);
      expect(description).toBe('Showing 2 of 5 todo lists matching "work"');
    });

    it('should include status filter in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'completed',
      };

      const description = getFilterDescription(filters, 5, 3);
      expect(description).toBe('Showing 3 of 5 todo lists completed');
    });

    it('should include in-progress status in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: '',
        statusFilter: 'in-progress',
      };

      const description = getFilterDescription(filters, 5, 2);
      expect(description).toBe('Showing 2 of 5 todo lists in progress');
    });

    it('should combine search and status filters in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'work',
        statusFilter: 'completed',
      };

      const description = getFilterDescription(filters, 5, 1);
      expect(description).toBe(
        'Showing 1 of 5 todo lists matching "work" and completed'
      );
    });

    it('should combine search and in-progress status in description', () => {
      const filters: SearchAndFilterState = {
        searchQuery: 'project',
        statusFilter: 'in-progress',
      };

      const description = getFilterDescription(filters, 10, 3);
      expect(description).toBe(
        'Showing 3 of 10 todo lists matching "project" and in progress'
      );
    });
  });
});
