/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem, Priority } from '@/models/TodoItem';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/mongoose');
jest.mock('@/models/TodoList');
jest.mock('@/models/TodoItem');

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockTodoList = TodoList as jest.MockedFunction<any>;
const mockTodoItem = TodoItem as jest.MockedFunction<any>;

describe('/api/todolists/[id]/items', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockTodoListData = {
    _id: 'list-123',
    name: 'Test List',
    userId: 'user-123',
    isCompleted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  describe('POST /api/todolists/[id]/items', () => {
    const validTodoItemData = {
      title: 'Test Todo Item',
      description: 'Test description',
      priority: Priority.MEDIUM,
      dueDate: '2024-12-31T00:00:00.000Z',
    };

    it('successfully creates a todo item', async () => {
      const mockSavedTodoItem = {
        _id: 'item-123',
        ...validTodoItemData,
        todoListId: 'list-123',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({
          _id: 'item-123',
          ...validTodoItemData,
          todoListId: 'list-123',
          isCompleted: false,
        }),
      };

      mockTodoList.findById.mockResolvedValue(mockTodoListData);
      mockTodoItem.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedTodoItem),
        toJSON: mockSavedTodoItem.toJSON,
      }));

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items',
        {
          method: 'POST',
          body: JSON.stringify(validTodoItemData),
        }
      );

      const response = await POST(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.data._id).toBe('item-123');
      expect(responseData.data.title).toBe(validTodoItemData.title);
      expect(responseData.message).toBe('Todo item created successfully');
    });

    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items',
        {
          method: 'POST',
          body: JSON.stringify(validTodoItemData),
        }
      );

      const response = await POST(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });

    it('returns 400 for invalid ObjectId format', async () => {
      const request = new NextRequest(
        'http://localhost/api/todolists/invalid-id/items',
        {
          method: 'POST',
          body: JSON.stringify(validTodoItemData),
        }
      );

      const response = await POST(request, { params: { id: 'invalid-id' } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid ID');
    });

    it('returns 400 for invalid todo item data', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        priority: 'INVALID_PRIORITY',
      };

      const request = new NextRequest(
        'http://localhost/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation error');
    });

    it('returns 404 when todo list does not exist', async () => {
      mockTodoList.findById.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(validTodoItemData),
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('TodoList not found');
    });

    it('returns 403 when user does not own the todo list', async () => {
      const otherUserTodoList = {
        ...mockTodoListData,
        userId: 'other-user-123',
      };

      mockTodoList.findById.mockResolvedValue(otherUserTodoList);

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items',
        {
          method: 'POST',
          body: JSON.stringify(validTodoItemData),
        }
      );

      const response = await POST(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Access denied');
    });
  });

  describe('GET /api/todolists/[id]/items', () => {
    const mockTodoItems = [
      {
        _id: 'item-1',
        title: 'Item 1',
        isCompleted: false,
        priority: Priority.MEDIUM,
        todoListId: 'list-123',
        toJSON: () => ({ _id: 'item-1', title: 'Item 1' }),
      },
      {
        _id: 'item-2',
        title: 'Item 2',
        isCompleted: true,
        priority: Priority.HIGH,
        todoListId: 'list-123',
        toJSON: () => ({ _id: 'item-2', title: 'Item 2' }),
      },
    ];

    it('successfully fetches todo items', async () => {
      mockTodoList.findById.mockResolvedValue(mockTodoListData);
      mockTodoItem.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTodoItems),
      });

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items'
      );

      const response = await GET(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toHaveLength(2);
      expect(responseData.message).toBe('Todo items fetched successfully');
    });

    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items'
      );

      const response = await GET(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });

    it('returns 404 when todo list does not exist', async () => {
      mockTodoList.findById.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/todolists/507f1f77bcf86cd799439011/items'
      );

      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('TodoList not found');
    });

    it('returns 403 when user does not own the todo list', async () => {
      const otherUserTodoList = {
        ...mockTodoListData,
        userId: 'other-user-123',
      };

      mockTodoList.findById.mockResolvedValue(otherUserTodoList);

      const request = new NextRequest(
        'http://localhost/api/todolists/list-123/items'
      );

      const response = await GET(request, { params: { id: 'list-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Access denied');
    });
  });
});
