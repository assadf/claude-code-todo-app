// Since we're using MongoDB directly, we'll define these types manually
// instead of importing from Prisma
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: Date;
  todoListId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TodoListWithItems extends TodoList {
  todoItems: TodoItem[];
  _count?: {
    todoItems: number;
  };
}

// MongoDB Response Type for API
export interface MongoTodoList {
  _id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  dueDate?: Date;
}

export interface UpdateTodoItemData {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: Date;
}

export interface DashboardStats {
  totalTodoLists: number;
  activeTodoLists: number;
  completedTodoLists: number;
  totalTodoItems: number;
  completedTodoItems: number;
}

// Response type for GET /api/todolists/[id]
export interface TodoListWithItemsResponse {
  _id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  todoItems: {
    _id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    priority: Priority;
    dueDate?: string;
    todoListId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  _count: {
    todoItems: number;
  };
}
