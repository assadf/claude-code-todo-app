import { renderHook } from '@testing-library/react';
import { useTodoItems } from './use-todo-items';
import { Priority } from '@/types';

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useTodoItems', () => {
  const mockTodoItems = [
    {
      _id: '1',
      title: 'Test Item 1',
      description: 'Test description',
      isCompleted: false,
      priority: Priority.MEDIUM,
      todoListId: 'list-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '2',
      title: 'Test Item 2',
      isCompleted: true,
      priority: Priority.HIGH,
      todoListId: 'list-1',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default SWR mock
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: mockTodoItems,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
  });

  it('returns todo items from SWR', () => {
    const { result } = renderHook(() => useTodoItems('list-1'));

    expect(result.current.todoItems).toEqual(mockTodoItems);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array when no data', () => {
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    expect(result.current.todoItems).toEqual([]);
  });

  it('handles loading state', () => {
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', () => {
    const mockError = new Error('Failed to fetch');
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    expect(result.current.error).toBe(mockError);
  });

  it('successfully adds a todo item', async () => {
    const mockMutate = jest.fn();
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: mockTodoItems,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    const newTodoItem = {
      _id: '3',
      title: 'New Task',
      description: 'New description',
      isCompleted: false,
      priority: Priority.LOW,
      todoListId: 'list-1',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: newTodoItem,
        message: 'Todo item created successfully',
      }),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    const todoData = {
      title: 'New Task',
      description: 'New description',
      priority: Priority.LOW,
    };

    const addedItem = await result.current.addTodoItem(todoData);

    expect(mockFetch).toHaveBeenCalledWith('/api/todolists/list-1/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(addedItem).toEqual(newTodoItem);
    expect(mockMutate).toHaveBeenCalled();
  });

  it('handles add todo item error', async () => {
    const mockMutate = jest.fn();
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: mockTodoItems,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Validation error',
        message: 'Title is required',
      }),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    const todoData = {
      title: '',
      priority: Priority.MEDIUM,
    };

    await expect(result.current.addTodoItem(todoData)).rejects.toThrow(
      'Title is required'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('throws error when adding item without todoListId', async () => {
    const { result } = renderHook(() => useTodoItems(undefined));

    const todoData = {
      title: 'Test',
      priority: Priority.MEDIUM,
    };

    await expect(result.current.addTodoItem(todoData)).rejects.toThrow(
      'Todo list ID is required'
    );
  });

  it('does not fetch when todoListId is undefined', () => {
    const useSWR = require('swr').default;

    renderHook(() => useTodoItems(undefined));

    expect(useSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('constructs correct API URL when todoListId is provided', () => {
    const useSWR = require('swr').default;

    renderHook(() => useTodoItems('test-list-id'));

    expect(useSWR).toHaveBeenCalledWith(
      '/api/todolists/test-list-id/items',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('successfully deletes a todo item', async () => {
    const mockMutate = jest.fn();
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: mockTodoItems,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    const deletedTodoItem = {
      _id: '1',
      title: 'Test Item 1',
      description: 'Test description',
      isCompleted: false,
      priority: Priority.MEDIUM,
      todoListId: 'list-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: deletedTodoItem,
        message: 'TodoItem deleted successfully',
      }),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    const deletedItem = await result.current.deleteTodoItem('1');

    expect(mockFetch).toHaveBeenCalledWith('/api/todolists/list-1/items/1', {
      method: 'DELETE',
    });

    expect(deletedItem).toEqual(deletedTodoItem);
    expect(mockMutate).toHaveBeenCalled();
  });

  it('handles delete todo item error', async () => {
    const mockMutate = jest.fn();
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: mockTodoItems,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'TodoItem not found',
        message: 'No todo item found with the provided ID in this todo list',
      }),
    });

    const { result } = renderHook(() => useTodoItems('list-1'));

    await expect(
      result.current.deleteTodoItem('nonexistent-id')
    ).rejects.toThrow(
      'No todo item found with the provided ID in this todo list'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('throws error when deleting item without todoListId', async () => {
    const { result } = renderHook(() => useTodoItems(undefined));

    await expect(result.current.deleteTodoItem('item-id')).rejects.toThrow(
      'Todo list ID is required'
    );
  });
});
