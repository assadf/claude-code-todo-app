import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTodoList } from '@/hooks/use-todo-list';
import TodoListDetailPage from './page';
import type { MongoTodoList } from '@/types';

// Mock the hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-todo-list');

const mockUseTodoList = useTodoList as jest.MockedFunction<typeof useTodoList>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock router functions
const mockPush = jest.fn();
const mockBack = jest.fn();

describe('TodoListDetailPage', () => {
  const mockTodoList: MongoTodoList = {
    _id: '123',
    name: 'Test Todo List',
    description: 'A test todo list description',
    isCompleted: false,
    userId: 'user123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    _count: {
      todoItems: 5,
    },
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseTodoList.mockReturnValue({
      todoList: undefined,
      isLoading: true,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const mockError = new Error('Failed to fetch todo list');
    mockUseTodoList.mockReturnValue({
      todoList: undefined,
      isLoading: false,
      error: mockError,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('Failed to load todo list')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch todo list')).toBeInTheDocument();
  });

  it('should render todo list details', () => {
    mockUseTodoList.mockReturnValue({
      todoList: mockTodoList,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('Test Todo List')).toBeInTheDocument();
    expect(
      screen.getByText('A test todo list description')
    ).toBeInTheDocument();
    expect(screen.getByText('5 tasks')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render completed status for completed todo list', () => {
    const completedTodoList = { ...mockTodoList, isCompleted: true };
    mockUseTodoList.mockReturnValue({
      todoList: completedTodoList,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render empty state when no todo items', () => {
    const emptyTodoList = { ...mockTodoList, _count: { todoItems: 0 } };
    mockUseTodoList.mockReturnValue({
      todoList: emptyTodoList,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('No TODO items yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first TODO item to get started')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Add TODO Item')).toHaveLength(2); // One in header, one in empty state
  });

  it('should have back button that navigates to dashboard', () => {
    mockUseTodoList.mockReturnValue({
      todoList: mockTodoList,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    const backButton = screen.getByText('Back to Dashboard');
    expect(backButton).toBeInTheDocument();
  });

  it('should display creation date', () => {
    mockUseTodoList.mockReturnValue({
      todoList: mockTodoList,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('Created Jan 1, 2023')).toBeInTheDocument();
  });

  it('should render without description when description is not provided', () => {
    const todoListWithoutDescription = {
      ...mockTodoList,
      description: undefined,
    };
    mockUseTodoList.mockReturnValue({
      todoList: todoListWithoutDescription,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<TodoListDetailPage params={{ id: '123' }} />);

    expect(screen.getByText('Test Todo List')).toBeInTheDocument();
    expect(
      screen.queryByText('A test todo list description')
    ).not.toBeInTheDocument();
  });
});
