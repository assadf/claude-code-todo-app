/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { DELETE } from './route';
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
const mockTodoItemFindOne = TodoItem.findOne as jest.MockedFunction<
  typeof TodoItem.findOne
>;
const mockTodoItemFindOneAndDelete =
  TodoItem.findOneAndDelete as jest.MockedFunction<
    typeof TodoItem.findOneAndDelete
  >;

interface RouteParams {
  params: {
    id: string;
    itemId: string;
  };
}

describe('/api/todolists/[id]/items/[itemId]', () => {
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

  const mockTodoItem = {
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Todo Item',
    description: 'Test description',
    isCompleted: false,
    priority: 'MEDIUM',
    todoListId: '507f1f77bcf86cd799439011',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE', () => {
    const routeParams: RouteParams = {
      params: {
        id: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012',
      },
    };

    it('should successfully delete a todo item', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemFindOne.mockResolvedValue(mockTodoItem);
      mockTodoItemFindOneAndDelete.mockResolvedValue(mockTodoItem);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        data: mockTodoItem,
        message: 'TodoItem deleted successfully',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFindOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439012',
        todoListId: '507f1f77bcf86cd799439011',
      });
      expect(mockTodoItemFindOneAndDelete).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439012',
        todoListId: '507f1f77bcf86cd799439011',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Authentication required',
        message: 'You must be logged in to delete a todo item',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid todolist ID format', async () => {
      const invalidParams: RouteParams = {
        params: {
          id: 'invalid-id',
          itemId: '507f1f77bcf86cd799439012',
        },
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/invalid-id/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, invalidParams);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid ID',
        message: 'The provided todolist ID is not a valid ObjectId format',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid todo item ID format', async () => {
      const invalidParams: RouteParams = {
        params: {
          id: '507f1f77bcf86cd799439011',
          itemId: 'invalid-item-id',
        },
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/invalid-item-id',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, invalidParams);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid ID',
        message: 'The provided todo item ID is not a valid ObjectId format',
      });

      expect(mockTodoListFindById).not.toHaveBeenCalled();
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 404 when todo list does not exist', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        error: 'TodoList not found',
        message: 'No todo list found with the provided ID',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not own the todo list', async () => {
      const todoListOwnedByOtherUser = {
        ...mockTodoList,
        userId: 'other-user-456',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(todoListOwnedByOtherUser);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData).toEqual({
        error: 'Access denied',
        message:
          'You do not have permission to delete items from this todo list',
      });

      expect(mockTodoListFindById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 404 when todo item does not exist', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockResolvedValue(mockTodoList);
      mockTodoItemFindOne.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        error: 'TodoItem not found',
        message: 'No todo item found with the provided ID in this todo list',
      });

      expect(mockTodoItemFindOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439012',
        todoListId: '507f1f77bcf86cd799439011',
      });
      expect(mockTodoItemFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockGetServerSession.mockResolvedValue(mockSession);
      mockTodoListFindById.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/todolists/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, routeParams);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the todo item',
      });
    });
  });
});
