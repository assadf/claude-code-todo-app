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
    itemId: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to delete a todo item',
        },
        { status: 401 }
      );
    }

    const { id, itemId } = params;

    // Validate MongoDB ObjectId format for todolist ID
    const listIdValidation = objectIdSchema.safeParse(id);
    if (!listIdValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid ID',
          message: 'The provided todolist ID is not a valid ObjectId format',
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format for todo item ID
    const itemIdValidation = objectIdSchema.safeParse(itemId);
    if (!itemIdValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid ID',
          message: 'The provided todo item ID is not a valid ObjectId format',
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
          message:
            'You do not have permission to delete items from this todo list',
        },
        { status: 403 }
      );
    }

    // Check if todo item exists and belongs to the todolist
    const todoItem = await TodoItem.findOne({
      _id: itemId,
      todoListId: id,
    });

    if (!todoItem) {
      return NextResponse.json(
        {
          error: 'TodoItem not found',
          message: 'No todo item found with the provided ID in this todo list',
        },
        { status: 404 }
      );
    }

    // Delete the todo item
    const deletedTodoItem = await TodoItem.findOneAndDelete({
      _id: itemId,
      todoListId: id,
    });

    return NextResponse.json(
      {
        data: deletedTodoItem,
        message: 'TodoItem deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting todo item:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the todo item',
      },
      { status: 500 }
    );
  }
}
