import {
  getSortPreference,
  setSortPreference,
  clearSortPreference,
} from './localStorage';
import type { SortOption } from '@/types/sorting';

// Mock localStorage
const localStorageMock: {
  store: Record<string, string>;
  getItem: jest.MockedFunction<(key: string) => string | null>;
  setItem: jest.MockedFunction<(key: string, value: string) => void>;
  removeItem: jest.MockedFunction<(key: string) => void>;
  clear: jest.MockedFunction<() => void>;
} = {
  store: {} as Record<string, string>,
  getItem: jest.fn(
    (key: string): string | null => localStorageMock.store[key] || null
  ),
  setItem: jest.fn((key: string, value: string): void => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key: string): void => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn((): void => {
    localStorageMock.store = {};
  }),
};

// Mock console.warn to suppress expected warnings in tests
const consoleMock = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage mock state and call history
    localStorageMock.clear();
    jest.clearAllMocks();

    // Set up localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  describe('getSortPreference', () => {
    it('should return default sort option when no preference is saved', () => {
      const result = getSortPreference();
      expect(result).toBe('updated-desc');
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'todoListSortPreference'
      );
    });

    it('should return saved valid sort option', () => {
      localStorageMock.setItem('todoListSortPreference', 'name-asc');
      const result = getSortPreference();
      expect(result).toBe('name-asc');
    });

    it('should return default option for invalid saved value', () => {
      localStorageMock.setItem('todoListSortPreference', 'invalid-option');
      const result = getSortPreference();
      expect(result).toBe('updated-desc');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = getSortPreference();
      expect(result).toBe('updated-desc');
      expect(console.warn).toHaveBeenCalledWith(
        'Error reading from localStorage for key "todoListSortPreference":',
        expect.any(Error)
      );
    });

    it('should return default when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = getSortPreference();
      expect(result).toBe('updated-desc');

      global.window = originalWindow;
    });
  });

  describe('setSortPreference', () => {
    it('should save valid sort option to localStorage', () => {
      const result = setSortPreference('name-desc');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todoListSortPreference',
        'name-desc'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = setSortPreference('created-asc');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Error writing to localStorage for key "todoListSortPreference":',
        expect.any(Error)
      );
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = setSortPreference('name-asc');
      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('clearSortPreference', () => {
    it('should remove sort preference from localStorage', () => {
      // First set an item
      setSortPreference('name-asc');

      // Then clear it
      const result = clearSortPreference();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'todoListSortPreference'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = clearSortPreference();
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Error clearing sort preference from localStorage:',
        expect.any(Error)
      );
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = clearSortPreference();
      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('all sort options validation', () => {
    const validSortOptions: SortOption[] = [
      'name-asc',
      'name-desc',
      'created-desc',
      'created-asc',
      'updated-desc',
      'updated-asc',
    ];

    it.each(validSortOptions)(
      'should handle %s sort option correctly',
      sortOption => {
        // Directly set in mock store and verify retrieval
        localStorageMock.store['todoListSortPreference'] = sortOption;
        const retrieved = getSortPreference();
        expect(retrieved).toBe(sortOption);
      }
    );
  });
});
