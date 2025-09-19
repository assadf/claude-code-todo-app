/**
 * @jest-environment node
 */
import { POST } from '../todolists/[id]/items/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem } from '@/models/TodoItem';
import { Priority } from '@/types';
import type { Session } from 'next-auth';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/mongoose');
jest.mock('@/models/TodoList');
jest.mock('@/models/TodoItem');

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockTodoListFindById = TodoList.findById as jest.MockedFunction<
  typeof TodoList.findById
>;
const mockTodoItemCreate = TodoItem.create as jest.MockedFunction<
  typeof TodoItem.create
>;

describe('/api/todolists/[id]/items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const mockSession: Session = {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '2024-12-31',
    };

    const mockTodoList = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test TodoList',
      description: 'Test Description',
      isCompleted: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      userId: 'user-123',
    };

    it('should create a new todo item when valid data and authentication', async () => {
      const mockCreatedTodoItem = {
        _id: '507f1f77bcf86cd799439012',
        title: 'New Todo Item',
        description: 'Item description',
        isCompleted: false,
        priority: Priority.MEDIUM,
        dueDate: '2024-12-31T00:00:00.000Z',
        todoListId: '507f1f77bcf86cd799439011',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemCreate.mockResolvedValue(mockCreatedTodoItem as any);

      const requestBody = {
        title: 'New Todo Item',
        description: 'Item description',
        priority: Priority.MEDIUM,
        dueDate: '2024-12-31T00:00:00.000Z',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual({
        data: mockCreatedTodoItem,
        message: 'TodoItem created successfully',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemCreate).toHaveBeenCalledWith({
        title: 'New Todo Item',
        description: 'Item description',
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-12-31T00:00:00.000Z'),
        todoListId: '507f1f77bcf86cd799439011',
      });
    });

    it('should create todo item with minimal required data', async () => {
      const mockCreatedTodoItem = {
        _id: '507f1f77bcf86cd799439012',
        title: 'Minimal Todo Item',
        isCompleted: false,
        priority: Priority.MEDIUM,
        todoListId: '507f1f77bcf86cd799439011',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemCreate.mockResolvedValue(mockCreatedTodoItem as any);

      const requestBody = {
        title: 'Minimal Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(201);
      expect(mockTodoItemCreate).toHaveBeenCalledWith({
        title: 'Minimal Todo Item',
        todoListId: '507f1f77bcf86cd799439011',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(null);

      const requestBody = {
        title: 'New Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(401);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Authentication required',
        message: 'You must be logged in to create a todo item',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when todolist ID is invalid ObjectId format', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);

      const requestBody = {
        title: 'New Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/invalid-id/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, { params: { id: 'invalid-id' } });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Invalid ID',
        message: 'The provided ID is not a valid ObjectId format',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 404 when todo list does not exist', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(null);

      const requestBody = {
        title: 'New Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'TodoList not found',
        message: 'No todo list found with the provided ID',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to add item to todo list owned by another user', async () => {
      const todoListOwnedByOtherUser = {
        ...mockTodoList,
        userId: 'other-user-456',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(todoListOwnedByOtherUser);

      const requestBody = {
        title: 'New Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(403);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Access denied',
        message: 'You do not have permission to add items to this todo list',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when title is missing', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);

      const requestBody = {
        description: 'Item without title',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['title'],
            message: 'Required',
          }),
        ]),
      });

      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when title is too long', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);

      const requestBody = {
        title: 'a'.repeat(256), // Too long
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['title'],
            message: 'Title must be 255 characters or less',
          }),
        ]),
      });

      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when priority is invalid', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);

      const requestBody = {
        title: 'Todo Item',
        priority: 'INVALID_PRIORITY',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['priority'],
          }),
        ]),
      });

      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when request body is invalid JSON', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: 'invalid json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemCreate).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockRejectedValue(
        new Error('Database connection failed')
      );

      const requestBody = {
        title: 'New Todo Item',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the todo item',
      });
    });
  });
});
