export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc';

export interface SortConfig {
  value: SortOption;
  label: string;
  description: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  {
    value: 'updated-desc',
    label: 'Recently Updated',
    description: 'Sort by most recently updated first',
  },
  {
    value: 'created-desc',
    label: 'Recently Created',
    description: 'Sort by most recently created first',
  },
  {
    value: 'name-asc',
    label: 'Name A-Z',
    description: 'Sort alphabetically A to Z',
  },
  {
    value: 'name-desc',
    label: 'Name Z-A',
    description: 'Sort alphabetically Z to A',
  },
  {
    value: 'created-asc',
    label: 'Oldest First',
    description: 'Sort by oldest created first',
  },
  {
    value: 'updated-asc',
    label: 'Least Recently Updated',
    description: 'Sort by least recently updated first',
  },
];

export const DEFAULT_SORT_OPTION: SortOption = 'updated-desc';
