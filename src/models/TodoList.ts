import mongoose, { Document, Schema } from 'mongoose';

export interface ITodoList extends Document {
  name: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

const TodoListSchema = new Schema<ITodoList>(
  {
    name: {
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
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TodoList =
  mongoose.models.TodoList ||
  mongoose.model<ITodoList>('TodoList', TodoListSchema);
