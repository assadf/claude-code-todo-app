import { sortTodoLists } from './sorting';
import type { MongoTodoList } from '@/types';

// Mock data for testing
const mockTodoLists: MongoTodoList[] = [
  {
    _id: '1',
    name: 'Zebra Project',
    description: 'Last project',
    isCompleted: false,
    userId: 'user1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-05T15:00:00Z',
    _count: { todoItems: 5 },
  },
  {
    _id: '2',
    name: 'Alpha Project',
    description: 'First project',
    isCompleted: true,
    userId: 'user1',
    createdAt: '2024-01-03T12:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z',
    _count: { todoItems: 3 },
  },
  {
    _id: '3',
    name: 'Beta Project',
    description: 'Middle project',
    isCompleted: false,
    userId: 'user1',
    createdAt: '2024-01-02T14:00:00Z',
    updatedAt: '2024-01-06T09:00:00Z',
    _count: { todoItems: 8 },
  },
];

describe('sortTodoLists', () => {
  it('should handle empty array', () => {
    const result = sortTodoLists([], 'name-asc');
    expect(result).toEqual([]);
  });

  it('should handle null/undefined input', () => {
    expect(sortTodoLists(null as any, 'name-asc')).toBeNull();
    expect(sortTodoLists(undefined as any, 'name-asc')).toBeUndefined();
  });

  describe('name sorting', () => {
    it('should sort by name ascending (A-Z)', () => {
      const result = sortTodoLists(mockTodoLists, 'name-asc');
      expect(result.map(list => list.name)).toEqual([
        'Alpha Project',
        'Beta Project',
        'Zebra Project',
      ]);
    });

    it('should sort by name descending (Z-A)', () => {
      const result = sortTodoLists(mockTodoLists, 'name-desc');
      expect(result.map(list => list.name)).toEqual([
        'Zebra Project',
        'Beta Project',
        'Alpha Project',
      ]);
    });
  });

  describe('created date sorting', () => {
    it('should sort by created date descending (most recent first)', () => {
      const result = sortTodoLists(mockTodoLists, 'created-desc');
      expect(result.map(list => list.name)).toEqual([
        'Alpha Project', // 2024-01-03
        'Beta Project', // 2024-01-02
        'Zebra Project', // 2024-01-01
      ]);
    });

    it('should sort by created date ascending (oldest first)', () => {
      const result = sortTodoLists(mockTodoLists, 'created-asc');
      expect(result.map(list => list.name)).toEqual([
        'Zebra Project', // 2024-01-01
        'Beta Project', // 2024-01-02
        'Alpha Project', // 2024-01-03
      ]);
    });
  });

  describe('updated date sorting', () => {
    it('should sort by updated date descending (most recently updated first)', () => {
      const result = sortTodoLists(mockTodoLists, 'updated-desc');
      expect(result.map(list => list.name)).toEqual([
        'Beta Project', // 2024-01-06
        'Zebra Project', // 2024-01-05
        'Alpha Project', // 2024-01-04
      ]);
    });

    it('should sort by updated date ascending (least recently updated first)', () => {
      const result = sortTodoLists(mockTodoLists, 'updated-asc');
      expect(result.map(list => list.name)).toEqual([
        'Alpha Project', // 2024-01-04
        'Zebra Project', // 2024-01-05
        'Beta Project', // 2024-01-06
      ]);
    });
  });

  it('should not mutate the original array', () => {
    const originalArray = [...mockTodoLists];
    const result = sortTodoLists(mockTodoLists, 'name-asc');

    expect(mockTodoLists).toEqual(originalArray);
    expect(result).not.toBe(mockTodoLists);
  });

  it('should handle unknown sort option by returning original array', () => {
    const result = sortTodoLists(mockTodoLists, 'unknown-option' as any);
    expect(result).toEqual(mockTodoLists);
  });
});
