import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { TodoItem, Priority } from '@/models/TodoItem';
import type { UpdateTodoItemData } from '@/types';

// Zod schema for ObjectId validation
const objectIdSchema = z
  .string()
  .refine(id => mongoose.Types.ObjectId.isValid(id), {
    message: 'The provided ID is not a valid ObjectId format',
  });

// Zod schema for update validation
const updateTodoItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform(val => (val ? new Date(val) : undefined))
    .or(z.null().transform(() => undefined)),
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to update a todo item',
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

    // Parse and validate request body
    let body: UpdateTodoItemData;
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
    const validationResult = updateTodoItemSchema.safeParse(body);
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
          message:
            'You do not have permission to update items in this todo list',
        },
        { status: 403 }
      );
    }

    // Check if todo item exists and belongs to the todolist
    const existingTodoItem = await TodoItem.findOne({
      _id: itemId,
      todoListId: id,
    });

    if (!existingTodoItem) {
      return NextResponse.json(
        {
          error: 'TodoItem not found',
          message: 'No todo item found with the provided ID in this todo list',
        },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    const validatedData = validationResult.data;

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.isCompleted !== undefined) {
      updateData.isCompleted = validatedData.isCompleted;
    }
    if (validatedData.priority !== undefined) {
      updateData.priority = validatedData.priority;
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate;
    }

    // Update the todo item
    const updatedTodoItem = await TodoItem.findOneAndUpdate(
      { _id: itemId, todoListId: id },
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        data: updatedTodoItem,
        message: 'TodoItem updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating todo item:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the todo item',
      },
      { status: 500 }
    );
  }
}
