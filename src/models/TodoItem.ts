import mongoose, { Document, Schema } from 'mongoose';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ITodoItem extends Document {
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  todoListId: string;
}

const TodoItemSchema = new Schema<ITodoItem>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    todoListId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TodoItem =
  mongoose.models.TodoItem ||
  mongoose.model<ITodoItem>('TodoItem', TodoItemSchema);
