import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TodoListWithItems,
  CreateTodoListData,
  CreateTodoItemData,
  UpdateTodoItemData,
} from '@/types';

interface TodoState {
  todoLists: TodoListWithItems[];
  isLoading: boolean;
  error: string | null;
  currentListId: string | null;
}

interface TodoActions {
  setTodoLists: (lists: TodoListWithItems[]) => void;
  addTodoList: (list: TodoListWithItems) => void;
  updateTodoList: (id: string, data: Partial<TodoListWithItems>) => void;
  deleteTodoList: (id: string) => void;
  addTodoItem: (listId: string, item: any) => void;
  updateTodoItem: (
    listId: string,
    itemId: string,
    data: UpdateTodoItemData
  ) => void;
  deleteTodoItem: (listId: string, itemId: string) => void;
  setCurrentListId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type TodoStore = TodoState & TodoActions;

export const useTodoStore = create<TodoStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        todoLists: [],
        isLoading: false,
        error: null,
        currentListId: null,

        // Actions
        setTodoLists: lists => set({ todoLists: lists }, false, 'setTodoLists'),

        addTodoList: list =>
          set(
            state => ({
              todoLists: [...state.todoLists, list],
            }),
            false,
            'addTodoList'
          ),

        updateTodoList: (id, data) =>
          // TODO: Fix type issues with Prisma vs MongoDB types
          set(
            state => ({
              todoLists: state.todoLists.map(list =>
                (list as any).id === id ? { ...list, ...data } : list
              ),
            }),
            false,
            'updateTodoList'
          ),

        deleteTodoList: id =>
          set(
            state => ({
              todoLists: state.todoLists.filter(
                list => (list as any).id !== id
              ),
              currentListId:
                state.currentListId === id ? null : state.currentListId,
            }),
            false,
            'deleteTodoList'
          ),

        addTodoItem: (listId, item) =>
          set(
            state => ({
              todoLists: state.todoLists.map(list =>
                (list as any).id === listId
                  ? { ...list, todoItems: [...list.todoItems, item] }
                  : list
              ),
            }),
            false,
            'addTodoItem'
          ),

        updateTodoItem: (listId, itemId, data) =>
          set(
            state => ({
              todoLists: state.todoLists.map(list =>
                list.id === listId
                  ? {
                      ...list,
                      todoItems: list.todoItems.map(item =>
                        item.id === itemId ? { ...item, ...data } : item
                      ),
                    }
                  : list
              ),
            }),
            false,
            'updateTodoItem'
          ),

        deleteTodoItem: (listId, itemId) =>
          set(
            state => ({
              todoLists: state.todoLists.map(list =>
                list.id === listId
                  ? {
                      ...list,
                      todoItems: list.todoItems.filter(
                        item => item.id !== itemId
                      ),
                    }
                  : list
              ),
            }),
            false,
            'deleteTodoItem'
          ),

        setCurrentListId: id =>
          set({ currentListId: id }, false, 'setCurrentListId'),

        setLoading: loading => set({ isLoading: loading }, false, 'setLoading'),

        setError: error => set({ error }, false, 'setError'),

        clearError: () => set({ error: null }, false, 'clearError'),
      }),
      {
        name: 'todo-storage',
        partialize: state => ({
          todoLists: state.todoLists,
          currentListId: state.currentListId,
        }),
      }
    ),
    { name: 'todo-store' }
  )
);

// Selectors for computed values
export const useTodoSelectors = () => {
  const todoLists = useTodoStore(state => state.todoLists);

  return {
    activeLists: todoLists.filter(list => !list.isCompleted),
    completedLists: todoLists.filter(list => list.isCompleted),
    totalTasks: todoLists.reduce((acc, list) => acc + list.todoItems.length, 0),
    completedTasks: todoLists.reduce(
      (acc, list) =>
        acc + list.todoItems.filter(item => item.isCompleted).length,
      0
    ),
    currentList: useTodoStore(state =>
      state.currentListId
        ? state.todoLists.find(list => list.id === state.currentListId)
        : null
    ),
  };
};
