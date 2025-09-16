// Dynamic import for UUID to handle ESM/CommonJS compatibility
async function generateUUID(): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');
  return uuidv4();
}

export interface TestTodoList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestTodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  todoListId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database test utilities for E2E tests
 * Note: In a real implementation, these would connect to your test database
 * For this example, we're mocking the database interactions
 */
export class DatabaseTestUtils {
  private static instance: DatabaseTestUtils;
  private testData: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DatabaseTestUtils {
    if (!DatabaseTestUtils.instance) {
      DatabaseTestUtils.instance = new DatabaseTestUtils();
    }
    return DatabaseTestUtils.instance;
  }

  /**
   * Clean up all test data
   * Should be called before/after each test
   */
  async cleanup(): Promise<void> {
    this.testData.clear();

    // In a real implementation, you would:
    // - Connect to your test database
    // - Delete all test data
    // - Reset auto-increment counters
    // - Close database connections

    console.log('Database cleanup completed');
  }

  /**
   * Create a test user in the database
   */
  async createTestUser(userData: {
    id: string;
    name: string;
    email: string;
    image?: string;
  }): Promise<void> {
    // In a real implementation, you would insert the user into your database
    this.testData.set(`user:${userData.id}`, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Create a test todo list in the database
   */
  async createTestTodoList(listData: {
    name: string;
    description?: string;
    userId: string;
  }): Promise<TestTodoList> {
    const id = await generateUUID();

    const todoList: TestTodoList = {
      id,
      name: listData.name,
      description: listData.description,
      userId: listData.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, you would insert this into your database
    this.testData.set(`todoList:${todoList.id}`, todoList);

    return todoList;
  }

  /**
   * Create multiple test todo lists
   */
  async createMultipleTodoLists(
    userId: string,
    count: number
  ): Promise<TestTodoList[]> {
    const todoLists: TestTodoList[] = [];

    for (let i = 0; i < count; i++) {
      const todoList = await this.createTestTodoList({
        name: `Test List ${i + 1}`,
        description: `Description for test list ${i + 1}`,
        userId,
      });
      todoLists.push(todoList);
    }

    return todoLists;
  }

  /**
   * Create test todo items in a list
   */
  async createTestTodoItems(
    todoListId: string,
    count: number,
    completedCount = 0
  ): Promise<TestTodoItem[]> {
    const todoItems: TestTodoItem[] = [];

    for (let i = 0; i < count; i++) {
      const id = await generateUUID();

      const todoItem: TestTodoItem = {
        id,
        title: `Test Task ${i + 1}`,
        description: `Description for test task ${i + 1}`,
        completed: i < completedCount,
        todoListId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.testData.set(`todoItem:${todoItem.id}`, todoItem);
      todoItems.push(todoItem);
    }

    return todoItems;
  }

  /**
   * Get all todo lists for a user
   */
  async getTodoListsForUser(userId: string): Promise<TestTodoList[]> {
    const todoLists: TestTodoList[] = [];

    this.testData.forEach((value, key) => {
      if (key.startsWith('todoList:') && value.userId === userId) {
        todoLists.push(value);
      }
    });

    return todoLists.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Count todo items in a list
   */
  async countTodoItems(
    todoListId: string
  ): Promise<{ total: number; completed: number }> {
    let total = 0;
    let completed = 0;

    this.testData.forEach((value, key) => {
      if (key.startsWith('todoItem:') && value.todoListId === todoListId) {
        total++;
        if (value.completed) {
          completed++;
        }
      }
    });

    return { total, completed };
  }

  /**
   * Verify that a todo list exists in the database
   */
  async verifyTodoListExists(
    userId: string,
    name: string,
    description?: string
  ): Promise<TestTodoList | null> {
    let foundList: TestTodoList | null = null;

    this.testData.forEach((value, key) => {
      if (
        key.startsWith('todoList:') &&
        value.userId === userId &&
        value.name === name &&
        (description === undefined || value.description === description)
      ) {
        foundList = value;
      }
    });

    return foundList;
  }

  /**
   * Setup initial test data for scenarios
   */
  async setupUserWithLists(
    userId: string,
    listsCount = 3,
    itemsPerList = 5
  ): Promise<{
    todoLists: TestTodoList[];
    totalItems: number;
    completedItems: number;
  }> {
    const todoLists = await this.createMultipleTodoLists(userId, listsCount);
    let totalItems = 0;
    let completedItems = 0;

    for (const list of todoLists) {
      const items = await this.createTestTodoItems(
        list.id,
        itemsPerList,
        Math.floor(itemsPerList / 2)
      );
      totalItems += items.length;
      completedItems += items.filter(item => item.completed).length;
    }

    return { todoLists, totalItems, completedItems };
  }

  /**
   * Wait for database operations to complete (for async operations)
   */
  async waitForOperation(timeout = 5000): Promise<void> {
    // In a real implementation, you might wait for database transactions to complete
    return new Promise(resolve => {
      setTimeout(resolve, 100); // Small delay to simulate database operation
    });
  }
}

export const dbUtils = DatabaseTestUtils.getInstance();
