import type { MongoTodoList } from '@/types';
import type { SortOption } from '@/types/sorting';

export function sortTodoLists(
  todoLists: MongoTodoList[],
  sortOption: SortOption
): MongoTodoList[] {
  if (!todoLists || todoLists.length === 0) {
    return todoLists;
  }

  const sortedLists = [...todoLists];

  switch (sortOption) {
    case 'name-asc':
      return sortedLists.sort((a, b) => a.name.localeCompare(b.name));

    case 'name-desc':
      return sortedLists.sort((a, b) => b.name.localeCompare(a.name));

    case 'created-desc':
      return sortedLists.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Most recent first
      });

    case 'created-asc':
      return sortedLists.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Oldest first
      });

    case 'updated-desc':
      return sortedLists.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA; // Most recently updated first
      });

    case 'updated-asc':
      return sortedLists.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateA - dateB; // Least recently updated first
      });

    default:
      return sortedLists;
  }
}
