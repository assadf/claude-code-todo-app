/**
 * @jest-environment node
 */
import { POST } from '../todolists/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    todoList: {
      create: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockPrismaCreate = prisma.todoList.create as jest.MockedFunction<
  typeof prisma.todoList.create
>;

describe('/api/todolists', () => {
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

    const mockCreatedTodoList = {
      id: 'todolist-123',
      name: 'Test TodoList',
      description: 'Test Description',
      isCompleted: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      userId: 'user-123',
    };

    const mockCreatedTodoListResponse = {
      id: 'todolist-123',
      name: 'Test TodoList',
      description: 'Test Description',
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      userId: 'user-123',
    };

    it('should create a new todo list with valid data and authentication', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrismaCreate.mockResolvedValue(mockCreatedTodoList);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test TodoList',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        data: mockCreatedTodoListResponse,
        message: 'TodoList created successfully',
      });

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          name: 'Test TodoList',
          description: 'Test Description',
          userId: 'user-123',
        },
      });
    });

    it('should create a todo list without description', async () => {
      const todoListWithoutDescription = {
        ...mockCreatedTodoList,
        description: null,
      };

      const todoListWithoutDescriptionResponse = {
        ...mockCreatedTodoListResponse,
        description: null,
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrismaCreate.mockResolvedValue(todoListWithoutDescription);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test TodoList',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        data: todoListWithoutDescriptionResponse,
        message: 'TodoList created successfully',
      });

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          name: 'Test TodoList',
          userId: 'user-123',
        },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test TodoList',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Authentication required',
        message: 'You must be logged in to create a todo list',
      });

      expect(mockPrismaCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty('error', 'Validation failed');
      expect(responseData).toHaveProperty('details');

      expect(mockPrismaCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty string', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty('error', 'Validation failed');
      expect(responseData).toHaveProperty('details');

      expect(mockPrismaCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when request body is invalid JSON', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
      });

      expect(mockPrismaCreate).not.toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrismaCreate.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test TodoList',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the todo list',
      });
    });

    it('should return 400 when name exceeds maximum length', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const longName = 'a'.repeat(256); // Assuming 255 character limit

      const request = new NextRequest('http://localhost:3000/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: longName,
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty('error', 'Validation failed');
      expect(responseData).toHaveProperty('details');

      expect(mockPrismaCreate).not.toHaveBeenCalled();
    });
  });
});
