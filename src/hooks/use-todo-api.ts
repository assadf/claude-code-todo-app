import { useCallback } from 'react';
import { useTodoStore } from '@/store/todo-store';
import type {
  CreateTodoListData,
  CreateTodoItemData,
  UpdateTodoItemData,
  TodoListWithItems,
} from '@/types';

export const useTodoAPI = () => {
  const {
    setTodoLists,
    addTodoList,
    updateTodoList,
    deleteTodoList,
    addTodoItem,
    updateTodoItem,
    deleteTodoItem,
    setLoading,
    setError,
    clearError,
  } = useTodoStore();

  const fetchTodoLists = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/todo-lists');
      if (!response.ok) {
        throw new Error(`Failed to fetch todo lists: ${response.statusText}`);
      }

      const lists: TodoListWithItems[] = await response.json();
      setTodoLists(lists);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to fetch todo lists'
      );
    } finally {
      setLoading(false);
    }
  }, [setTodoLists, setLoading, setError, clearError]);

  const createTodoList = useCallback(
    async (data: CreateTodoListData) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch('/api/todo-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create todo list: ${response.statusText}`);
        }

        const newList: TodoListWithItems = await response.json();
        addTodoList(newList);
        return newList;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to create todo list'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addTodoList, setLoading, setError, clearError]
  );

  const updateTodoListAPI = useCallback(
    async (id: string, data: Partial<CreateTodoListData>) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(`/api/todo-lists/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update todo list: ${response.statusText}`);
        }

        const updatedList: TodoListWithItems = await response.json();
        updateTodoList(id, updatedList);
        return updatedList;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to update todo list'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateTodoList, setLoading, setError, clearError]
  );

  const deleteTodoListAPI = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(`/api/todo-lists/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete todo list: ${response.statusText}`);
        }

        deleteTodoList(id);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to delete todo list'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [deleteTodoList, setLoading, setError, clearError]
  );

  const createTodoItem = useCallback(
    async (listId: string, data: CreateTodoItemData) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(`/api/todo-lists/${listId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create todo item: ${response.statusText}`);
        }

        const newItem = await response.json();
        addTodoItem(listId, newItem);
        return newItem;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to create todo item'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addTodoItem, setLoading, setError, clearError]
  );

  const updateTodoItemAPI = useCallback(
    async (listId: string, itemId: string, data: UpdateTodoItemData) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(
          `/api/todo-lists/${listId}/items/${itemId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update todo item: ${response.statusText}`);
        }

        const updatedItem = await response.json();
        updateTodoItem(listId, itemId, updatedItem);
        return updatedItem;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to update todo item'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateTodoItem, setLoading, setError, clearError]
  );

  const deleteTodoItemAPI = useCallback(
    async (listId: string, itemId: string) => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(
          `/api/todo-lists/${listId}/items/${itemId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete todo item: ${response.statusText}`);
        }

        deleteTodoItem(listId, itemId);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to delete todo item'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [deleteTodoItem, setLoading, setError, clearError]
  );

  return {
    fetchTodoLists,
    createTodoList,
    updateTodoList: updateTodoListAPI,
    deleteTodoList: deleteTodoListAPI,
    createTodoItem,
    updateTodoItem: updateTodoItemAPI,
    deleteTodoItem: deleteTodoItemAPI,
  };
};
