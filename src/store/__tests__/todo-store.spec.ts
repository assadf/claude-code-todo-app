import { act, renderHook } from '@testing-library/react';
import { useTodoStore, useTodoSelectors } from '../todo-store';
import type { TodoListWithItems } from '@/types';

// Mock Zustand's persist middleware
jest.mock('zustand/middleware', () => ({
  devtools: (fn: any) => fn,
  persist: (fn: any) => fn,
}));

const mockTodoList: TodoListWithItems = {
  id: '1',
  name: 'Test List',
  description: 'Test Description',
  isCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  todoItems: [
    {
      id: 'item-1',
      title: 'Test Item',
      description: 'Test Item Description',
      isCompleted: false,
      priority: 'MEDIUM',
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      todoListId: '1',
    },
  ],
};

describe('TodoStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useTodoStore());
    act(() => {
      result.current.setTodoLists([]);
      result.current.setCurrentListId(null);
      result.current.setError(null);
      result.current.setLoading(false);
    });
  });

  describe('setTodoLists', () => {
    it('should set todo lists', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setTodoLists([mockTodoList]);
      });

      expect(result.current.todoLists).toHaveLength(1);
      expect(result.current.todoLists[0]).toEqual(mockTodoList);
    });
  });

  describe('addTodoList', () => {
    it('should add a new todo list', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodoList(mockTodoList);
      });

      expect(result.current.todoLists).toHaveLength(1);
      expect(result.current.todoLists[0]).toEqual(mockTodoList);
    });
  });

  describe('updateTodoList', () => {
    it('should update an existing todo list', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setTodoLists([mockTodoList]);
        result.current.updateTodoList('1', { name: 'Updated List' });
      });

      expect(result.current.todoLists[0].name).toBe('Updated List');
    });
  });

  describe('deleteTodoList', () => {
    it('should delete a todo list', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setTodoLists([mockTodoList]);
        result.current.deleteTodoList('1');
      });

      expect(result.current.todoLists).toHaveLength(0);
    });

    it('should clear currentListId if deleting current list', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setTodoLists([mockTodoList]);
        result.current.setCurrentListId('1');
        result.current.deleteTodoList('1');
      });

      expect(result.current.currentListId).toBeNull();
    });
  });

  describe('setCurrentListId', () => {
    it('should set current list id', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setCurrentListId('1');
      });

      expect(result.current.currentListId).toBe('1');
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

describe('useTodoSelectors', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTodoStore());
    act(() => {
      result.current.setTodoLists([]);
    });
  });

  it('should return active lists', () => {
    const activeList = { ...mockTodoList, isCompleted: false };
    const completedList = { ...mockTodoList, id: '2', isCompleted: true };

    const { result: storeResult } = renderHook(() => useTodoStore());
    const { result: selectorsResult } = renderHook(() => useTodoSelectors());

    act(() => {
      storeResult.current.setTodoLists([activeList, completedList]);
    });

    expect(selectorsResult.current.activeLists).toHaveLength(1);
    expect(selectorsResult.current.activeLists[0].isCompleted).toBe(false);
  });

  it('should return completed lists', () => {
    const activeList = { ...mockTodoList, isCompleted: false };
    const completedList = { ...mockTodoList, id: '2', isCompleted: true };

    const { result: storeResult } = renderHook(() => useTodoStore());
    const { result: selectorsResult } = renderHook(() => useTodoSelectors());

    act(() => {
      storeResult.current.setTodoLists([activeList, completedList]);
    });

    expect(selectorsResult.current.completedLists).toHaveLength(1);
    expect(selectorsResult.current.completedLists[0].isCompleted).toBe(true);
  });

  it('should return total and completed task counts', () => {
    const listWithTasks = {
      ...mockTodoList,
      todoItems: [
        { ...mockTodoList.todoItems[0], isCompleted: true },
        { ...mockTodoList.todoItems[0], id: 'item-2', isCompleted: false },
      ],
    };

    const { result: storeResult } = renderHook(() => useTodoStore());
    const { result: selectorsResult } = renderHook(() => useTodoSelectors());

    act(() => {
      storeResult.current.setTodoLists([listWithTasks]);
    });

    expect(selectorsResult.current.totalTasks).toBe(2);
    expect(selectorsResult.current.completedTasks).toBe(1);
  });
});
