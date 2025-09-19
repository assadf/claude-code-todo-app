export type FilterOption = 'all' | 'completed' | 'in-progress';

export interface FilterConfig {
  value: FilterOption;
  label: string;
  description: string;
}

export interface SearchAndFilterState {
  searchQuery: string;
  statusFilter: FilterOption;
}

export const FILTER_OPTIONS: FilterConfig[] = [
  {
    value: 'all',
    label: 'All Lists',
    description: 'Show all todo lists regardless of status',
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Show only completed todo lists',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    description: 'Show only todo lists that are not completed',
  },
];

export const DEFAULT_FILTER_OPTION: FilterOption = 'all';
export const DEFAULT_SEARCH_QUERY = '';

export const DEFAULT_SEARCH_AND_FILTER_STATE: SearchAndFilterState = {
  searchQuery: DEFAULT_SEARCH_QUERY,
  statusFilter: DEFAULT_FILTER_OPTION,
};
