import { renderHook, act } from '@testing-library/react';
import { useTodoLists } from './use-todo-lists';

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock localStorage utilities
jest.mock('@/utils/localStorage', () => ({
  getSortPreference: jest.fn(() => 'updated-desc'),
  setSortPreference: jest.fn(),
  getFilterPreference: jest.fn(() => ({
    searchQuery: '',
    statusFilter: 'all',
  })),
  setFilterPreference: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

import useSWR from 'swr';
import {
  getSortPreference,
  setSortPreference,
  getFilterPreference,
  setFilterPreference,
} from '@/utils/localStorage';

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockGetSortPreference = getSortPreference as jest.MockedFunction<
  typeof getSortPreference
>;
const mockSetSortPreference = setSortPreference as jest.MockedFunction<
  typeof setSortPreference
>;
const mockGetFilterPreference = getFilterPreference as jest.MockedFunction<
  typeof getFilterPreference
>;
const mockSetFilterPreference = setFilterPreference as jest.MockedFunction<
  typeof setFilterPreference
>;

describe('useTodoLists', () => {
  const mockTodoLists = [
    {
      _id: '1',
      name: 'Zebra Project',
      description: 'Description 1',
      isCompleted: false,
      userId: 'user-123',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      _count: { todoItems: 5 },
    },
    {
      _id: '2',
      name: 'Alpha Project',
      description: 'Description 2',
      isCompleted: true,
      userId: 'user-123',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      _count: { todoItems: 3 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSortPreference.mockReturnValue('updated-desc');
    mockSetSortPreference.mockReturnValue(true);
    mockGetFilterPreference.mockReturnValue({
      searchQuery: '',
      statusFilter: 'all',
    });
    mockSetFilterPreference.mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        message: 'TodoList deleted successfully',
      }),
    });
  });

  it('should return sorted data from SWR', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockTodoLists,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    // Should be sorted by updated date descending by default
    // Since Alpha Project has a later updatedAt (2024-01-02), it should come first
    const expectedOrder = [mockTodoLists[1], mockTodoLists[0]]; // Alpha Project, then Zebra Project
    expect(result.current.todoLists).toEqual(expectedOrder);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mutate).toBe(mockMutate);
    expect(result.current.sortOption).toBe('updated-desc');
    expect(result.current.setSortOption).toBeDefined();
  });

  it('should return loading state', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    expect(result.current.todoLists).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should return error state', () => {
    const mockError = new Error('Failed to fetch');
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    expect(result.current.todoLists).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError);
  });

  it('should sort data when sortOption changes', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockTodoLists,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    act(() => {
      result.current.setSortOption('name-asc');
    });

    // Should be sorted alphabetically
    expect(result.current.todoLists?.map(list => list.name)).toEqual([
      'Alpha Project',
      'Zebra Project',
    ]);
    expect(result.current.sortOption).toBe('name-asc');
  });

  it('should handle empty data when sorting', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    expect(result.current.todoLists).toEqual([]);

    act(() => {
      result.current.setSortOption('name-asc');
    });

    expect(result.current.todoLists).toEqual([]);
  });

  it('should handle undefined data when sorting', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    expect(result.current.todoLists).toBeUndefined();

    act(() => {
      result.current.setSortOption('name-asc');
    });

    expect(result.current.todoLists).toBeUndefined();
  });

  it('should delete todo list successfully', async () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockTodoLists,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useTodoLists());

    await act(async () => {
      await result.current.deleteTodoList('1');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/todolists/1', {
      method: 'DELETE',
    });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockTodoLists,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Not found',
        message: 'TodoList not found',
      }),
    });

    const { result } = renderHook(() => useTodoLists());

    await expect(
      act(async () => {
        await result.current.deleteTodoList('999');
      })
    ).rejects.toThrow('TodoList not found');

    expect(mockMutate).not.toHaveBeenCalled();
  });

  describe('localStorage persistence', () => {
    it('should load saved sort preference on mount', () => {
      mockGetSortPreference.mockReturnValue('name-asc');
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      expect(mockGetSortPreference).toHaveBeenCalled();
      expect(result.current.sortOption).toBe('name-asc');
    });

    it('should save sort preference when it changes', async () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Clear the mock to ignore the initial load call
      mockSetSortPreference.mockClear();

      // Change sort option
      act(() => {
        result.current.setSortOption('created-desc');
      });

      expect(mockSetSortPreference).toHaveBeenCalledWith('created-desc');
    });

    it('should load preference from localStorage on mount', () => {
      mockGetSortPreference.mockReturnValue('name-desc');
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      // Should load preference from localStorage
      expect(mockGetSortPreference).toHaveBeenCalled();
      expect(result.current.sortOption).toBe('name-desc');
    });

    it('should use default preference if localStorage returns invalid value', () => {
      mockGetSortPreference.mockReturnValue('updated-desc'); // Default fallback
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      expect(result.current.sortOption).toBe('updated-desc');
    });
  });

  describe('filtering functionality', () => {
    it('should load saved filter preferences on mount', () => {
      const savedFilters = {
        searchQuery: 'test',
        statusFilter: 'completed' as const,
      };
      mockGetFilterPreference.mockReturnValue(savedFilters);
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      expect(mockGetFilterPreference).toHaveBeenCalled();
      expect(result.current.filters).toEqual(savedFilters);
    });

    it('should save filter preferences when they change', async () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Clear the mock to ignore the initial load call
      mockSetFilterPreference.mockClear();

      // Change filter preferences
      const newFilters = {
        searchQuery: 'work',
        statusFilter: 'in-progress' as const,
      };
      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(mockSetFilterPreference).toHaveBeenCalledWith(newFilters);
    });

    it('should filter todo lists by search query', () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      act(() => {
        result.current.setFilters({
          searchQuery: 'zebra',
          statusFilter: 'all',
        });
      });

      expect(result.current.todoLists?.map(list => list.name)).toEqual([
        'Zebra Project',
      ]);
      expect(result.current.totalCount).toBe(2);
      expect(result.current.filteredCount).toBe(1);
    });

    it('should filter todo lists by status', () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      act(() => {
        result.current.setFilters({
          searchQuery: '',
          statusFilter: 'completed',
        });
      });

      expect(result.current.todoLists?.map(list => list.name)).toEqual([
        'Alpha Project',
      ]);
      expect(result.current.totalCount).toBe(2);
      expect(result.current.filteredCount).toBe(1);
    });

    it('should combine search and status filters', () => {
      const extendedMockLists = [
        ...mockTodoLists,
        {
          _id: '3',
          name: 'Alpha Testing',
          description: 'Test the alpha features',
          isCompleted: false,
          userId: 'user-123',
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
          _count: { todoItems: 2 },
        },
      ];

      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: extendedMockLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      act(() => {
        result.current.setFilters({
          searchQuery: 'alpha',
          statusFilter: 'completed',
        });
      });

      expect(result.current.todoLists?.map(list => list.name)).toEqual([
        'Alpha Project',
      ]);
      expect(result.current.totalCount).toBe(3);
      expect(result.current.filteredCount).toBe(1);
    });

    it('should maintain sort order after filtering', () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      // Set name ascending sort
      act(() => {
        result.current.setSortOption('name-asc');
      });

      // Apply filter that should return both items
      act(() => {
        result.current.setFilters({
          searchQuery: 'project',
          statusFilter: 'all',
        });
      });

      // Should be filtered and sorted alphabetically
      expect(result.current.todoLists?.map(list => list.name)).toEqual([
        'Alpha Project',
        'Zebra Project',
      ]);
    });

    it('should handle empty filter results', () => {
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: mockTodoLists,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      const { result } = renderHook(() => useTodoLists());

      act(() => {
        result.current.setFilters({
          searchQuery: 'nonexistent',
          statusFilter: 'all',
        });
      });

      expect(result.current.todoLists).toEqual([]);
      expect(result.current.totalCount).toBe(2);
      expect(result.current.filteredCount).toBe(0);
    });
  });
});
