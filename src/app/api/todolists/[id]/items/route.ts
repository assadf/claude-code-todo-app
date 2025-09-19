import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem, Priority } from '@/models/TodoItem';
import type { CreateTodoItemData } from '@/types';

// Zod schema for ObjectId validation
const objectIdSchema = z
  .string()
  .refine(id => mongoose.Types.ObjectId.isValid(id), {
    message: 'The provided ID is not a valid ObjectId format',
  });

// Zod schema for input validation
const createTodoItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to view todo items',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate MongoDB ObjectId format using Zod
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid ID',
          message: 'The provided ID is not a valid ObjectId format',
        },
        { status: 400 }
      );
    }

    // Verify todo list exists and belongs to authenticated user
    const todoList = await TodoList.findById(id);

    if (!todoList) {
      return NextResponse.json(
        {
          error: 'TodoList not found',
          message: 'No todo list found with the provided ID',
        },
        { status: 404 }
      );
    }

    // Check if the todo list belongs to the authenticated user
    if (todoList.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: 'You do not have permission to view this todo list',
        },
        { status: 403 }
      );
    }

    // Fetch todo items for this list
    const todoItems = await TodoItem.find({ todoListId: id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      data: todoItems,
      message: 'TodoItems retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching todo items:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching todo items',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to create a todo item',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate MongoDB ObjectId format using Zod
    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid ID',
          message: 'The provided ID is not a valid ObjectId format',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body: CreateTodoItemData;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Validate input using Zod
    const validationResult = createTodoItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Verify todo list exists and belongs to authenticated user
    const todoList = await TodoList.findById(id);

    if (!todoList) {
      return NextResponse.json(
        {
          error: 'TodoList not found',
          message: 'No todo list found with the provided ID',
        },
        { status: 404 }
      );
    }

    // Check if the todo list belongs to the authenticated user
    if (todoList.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: 'You do not have permission to add items to this todo list',
        },
        { status: 403 }
      );
    }

    const { title, description, priority, dueDate } = validationResult.data;

    // Create todo item in database
    const todoItemData: any = {
      title,
      todoListId: id,
    };

    // Only add optional fields if they are provided
    if (description !== undefined) {
      todoItemData.description = description;
    }
    if (priority !== undefined) {
      todoItemData.priority = priority;
    }
    if (dueDate !== undefined) {
      todoItemData.dueDate = dueDate;
    }

    const todoItem = await TodoItem.create(todoItemData);

    // When a new item is added, the list should be marked as incomplete
    // (since new items are incomplete by default)
    if (todoList.isCompleted) {
      await TodoList.findByIdAndUpdate(id, { isCompleted: false });
    }

    return NextResponse.json(
      {
        data: todoItem,
        message: 'TodoItem created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating todo item:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the todo item',
      },
      { status: 500 }
    );
  }
}
