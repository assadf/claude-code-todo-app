import type { User, TodoList, TodoItem, Priority } from '@prisma/client';

export type { User, TodoList, TodoItem, Priority };

export interface TodoListWithItems extends TodoList {
  todoItems: TodoItem[];
  _count?: {
    todoItems: number;
  };
}

export interface UserWithTodoLists extends User {
  todoLists: TodoListWithItems[];
}

export interface CreateTodoListData {
  name: string;
  description?: string;
}

export interface CreateTodoItemData {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date | null;
}

export interface UpdateTodoItemData {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: Date | null;
}

export interface DashboardStats {
  totalTodoLists: number;
  activeTodoLists: number;
  completedTodoLists: number;
  totalTodoItems: number;
  completedTodoItems: number;
}
