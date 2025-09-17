/**
 * @jest-environment node
 */
import { GET } from '../todolists/[id]/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem } from '@/models/TodoItem';
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
const mockTodoItemFind = TodoItem.find as jest.MockedFunction<
  typeof TodoItem.find
>;

describe('/api/todolists/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
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
      toJSON: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Test TodoList',
        description: 'Test Description',
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        userId: 'user-123',
      }),
    };

    const mockTodoItems = [
      {
        _id: '507f1f77bcf86cd799439012',
        title: 'Test Todo Item 1',
        description: 'First item',
        isCompleted: false,
        priority: 'MEDIUM',
        todoListId: '507f1f77bcf86cd799439011',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        toJSON: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439012',
          title: 'Test Todo Item 1',
          description: 'First item',
          isCompleted: false,
          priority: 'MEDIUM',
          todoListId: '507f1f77bcf86cd799439011',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }),
      },
      {
        _id: '507f1f77bcf86cd799439013',
        title: 'Test Todo Item 2',
        description: 'Second item',
        isCompleted: true,
        priority: 'HIGH',
        todoListId: '507f1f77bcf86cd799439011',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        toJSON: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439013',
          title: 'Test Todo Item 2',
          description: 'Second item',
          isCompleted: true,
          priority: 'HIGH',
          todoListId: '507f1f77bcf86cd799439011',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }),
      },
    ];

    it('should fetch a todo list with its items when valid ID and authentication', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemFind.mockResolvedValue(mockTodoItems);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        data: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Test TodoList',
          description: 'Test Description',
          isCompleted: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          userId: 'user-123',
          todoItems: [
            {
              _id: '507f1f77bcf86cd799439012',
              title: 'Test Todo Item 1',
              description: 'First item',
              isCompleted: false,
              priority: 'MEDIUM',
              todoListId: '507f1f77bcf86cd799439011',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
            {
              _id: '507f1f77bcf86cd799439013',
              title: 'Test Todo Item 2',
              description: 'Second item',
              isCompleted: true,
              priority: 'HIGH',
              todoListId: '507f1f77bcf86cd799439011',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
          _count: {
            todoItems: 2,
          },
        },
        message: 'TodoList with items fetched successfully',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFind).toHaveBeenCalledWith({
        todoListId: '507f1f77bcf86cd799439011',
      });
    });

    it('should return empty items array when todo list has no items', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemFind.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.todoItems).toEqual([]);
      expect(responseData.data._count.todoItems).toBe(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Authentication required',
        message: 'You must be logged in to fetch a todo list',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemFind).not.toHaveBeenCalled();
    });

    it('should return 400 when ID is invalid ObjectId format', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/invalid-id'
      );
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid ID',
        message: 'The provided ID is not a valid ObjectId format',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemFind).not.toHaveBeenCalled();
    });

    it('should return 404 when todo list does not exist', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        error: 'TodoList not found',
        message: 'No todo list found with the provided ID',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFind).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to access todo list owned by another user', async () => {
      const todoListOwnedByOtherUser = {
        ...mockTodoList,
        userId: 'other-user-456',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(todoListOwnedByOtherUser);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData).toEqual({
        error: 'Access denied',
        message: 'You do not have permission to access this todo list',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFind).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching the todo list',
      });
    });
  });
});
