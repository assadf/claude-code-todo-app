import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import type { CreateTodoListData } from '@/types';

// Zod schema for input validation
const createTodoListSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to create a todo list',
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: CreateTodoListData;
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
    const validationResult = createTodoListSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    // Create todo list in database
    const todoList = await TodoList.create({
      name,
      description: description || undefined,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        data: todoList,
        message: 'TodoList created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating todo list:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the todo list',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to fetch todo lists',
        },
        { status: 401 }
      );
    }

    // Fetch todo lists for the user
    const todoLists = await TodoList.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    // Add todo item count to each todo list
    const todoListsWithCount = await Promise.all(
      todoLists.map(async todoList => {
        const { TodoItem } = await import('@/models/TodoItem');
        const itemCount = await TodoItem.countDocuments({
          todoListId: todoList._id.toString(),
        });

        return {
          ...todoList.toJSON(),
          _count: {
            todoItems: itemCount,
          },
        };
      })
    );

    return NextResponse.json(
      {
        data: todoListsWithCount,
        message: 'TodoLists fetched successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching todo lists:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching todo lists',
      },
      { status: 500 }
    );
  }
}
