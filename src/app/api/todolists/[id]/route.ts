import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { TodoList } from '@/models/TodoList';
import { isValidObjectId } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'You must be logged in to fetch todo list details',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          error: 'Invalid ID format',
          message: 'The provided todo list ID is not valid',
        },
        { status: 400 }
      );
    }

    // Fetch todo list by ID, ensuring it belongs to the authenticated user
    const todoList = await TodoList.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!todoList) {
      return NextResponse.json(
        {
          error: 'Todo list not found',
          message:
            'The requested todo list does not exist or you do not have access to it',
        },
        { status: 404 }
      );
    }

    // Add todo item count to the todo list
    const { TodoItem } = await import('@/models/TodoItem');
    const itemCount = await TodoItem.countDocuments({
      todoListId: todoList._id.toString(),
    });

    const todoListWithCount = {
      ...todoList.toJSON(),
      _count: {
        todoItems: itemCount,
      },
    };

    return NextResponse.json(
      {
        data: todoListWithCount,
        message: 'TodoList fetched successfully',
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
