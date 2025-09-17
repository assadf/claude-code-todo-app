import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem } from '@/models/TodoItem';

// Zod schema for ObjectId validation
const objectIdSchema = z
  .string()
  .refine(id => mongoose.Types.ObjectId.isValid(id), {
    message: 'The provided ID is not a valid ObjectId format',
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
          message: 'You must be logged in to fetch a todo list',
        },
        { status: 401 }
      );
    }

    // Validate ObjectId format
    const validationResult = objectIdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid ID',
          message: 'The provided ID is not a valid ObjectId format',
        },
        { status: 400 }
      );
    }

    const todoListId = validationResult.data;

    // Fetch todo list from database
    const todoList = await TodoList.findById(todoListId);

    if (!todoList) {
      return NextResponse.json(
        {
          error: 'TodoList not found',
          message: 'No todo list found with the provided ID',
        },
        { status: 404 }
      );
    }

    // Check if user owns the todo list
    if (todoList.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: 'You do not have permission to access this todo list',
        },
        { status: 403 }
      );
    }

    // Fetch associated todo items
    const todoItems = await TodoItem.find({ todoListId: todoListId });

    // Prepare response data
    const responseData = {
      ...todoList.toJSON(),
      todoItems: todoItems.map(item => item.toJSON()),
      _count: {
        todoItems: todoItems.length,
      },
    };

    return NextResponse.json(
      {
        data: responseData,
        message: 'TodoList with items fetched successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching todo list:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching the todo list',
      },
      { status: 500 }
    );
  }
}
