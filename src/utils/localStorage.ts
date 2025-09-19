import type { SortOption } from '@/types/sorting';
import type { SearchAndFilterState } from '@/types/filtering';
import { DEFAULT_SORT_OPTION } from '@/types/sorting';
import { DEFAULT_SEARCH_AND_FILTER_STATE } from '@/types/filtering';

const STORAGE_KEYS = {
  SORT_PREFERENCE: 'todoListSortPreference',
  FILTER_PREFERENCE: 'todoListFilterPreference',
} as const;

/**
 * Safely get a value from localStorage with error handling
 */
function getFromStorage(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set a value in localStorage with error handling
 */
function setInStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage for key "${key}":`, error);
    return false;
  }
}

/**
 * Get the user's saved sort preference from localStorage
 */
export function getSortPreference(): SortOption {
  const saved = getFromStorage(
    STORAGE_KEYS.SORT_PREFERENCE,
    DEFAULT_SORT_OPTION
  );

  // Validate that the saved value is a valid SortOption
  const validOptions: SortOption[] = [
    'name-asc',
    'name-desc',
    'created-desc',
    'created-asc',
    'updated-desc',
    'updated-asc',
  ];

  return validOptions.includes(saved as SortOption)
    ? (saved as SortOption)
    : DEFAULT_SORT_OPTION;
}

/**
 * Save the user's sort preference to localStorage
 */
export function setSortPreference(sortOption: SortOption): boolean {
  return setInStorage(STORAGE_KEYS.SORT_PREFERENCE, sortOption);
}

/**
 * Clear the user's sort preference from localStorage
 */
export function clearSortPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.SORT_PREFERENCE);
    return true;
  } catch (error) {
    console.warn('Error clearing sort preference from localStorage:', error);
    return false;
  }
}

/**
 * Get the user's saved filter preferences from localStorage
 */
export function getFilterPreference(): SearchAndFilterState {
  const saved = getFromStorage(STORAGE_KEYS.FILTER_PREFERENCE, '');

  if (!saved) {
    return DEFAULT_SEARCH_AND_FILTER_STATE;
  }

  try {
    const parsed = JSON.parse(saved) as SearchAndFilterState;

    // Validate the parsed object structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.searchQuery === 'string' &&
      typeof parsed.statusFilter === 'string' &&
      ['all', 'completed', 'in-progress'].includes(parsed.statusFilter)
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn('Error parsing saved filter preference:', error);
  }

  return DEFAULT_SEARCH_AND_FILTER_STATE;
}

/**
 * Save the user's filter preferences to localStorage
 */
export function setFilterPreference(filters: SearchAndFilterState): boolean {
  try {
    const serialized = JSON.stringify(filters);
    return setInStorage(STORAGE_KEYS.FILTER_PREFERENCE, serialized);
  } catch (error) {
    console.warn('Error serializing filter preference:', error);
    return false;
  }
}

/**
 * Clear the user's filter preferences from localStorage
 */
export function clearFilterPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.FILTER_PREFERENCE);
    return true;
  } catch (error) {
    console.warn('Error clearing filter preference from localStorage:', error);
    return false;
  }
}
