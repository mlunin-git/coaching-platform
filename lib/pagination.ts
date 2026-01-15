/**
 * Pagination utilities for managing large datasets
 */

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginate an array of items
 * @param items - The array of items to paginate
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated data with metadata
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedData<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure page is within valid range
  const validPage = Math.max(1, Math.min(page, totalPages || 1));

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    page: validPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}

/**
 * Get pagination controls for rendering
 * @param totalPages - Total number of pages
 * @param currentPage - Current page number
 * @param maxVisible - Maximum number of page buttons to show
 * @returns Array of page numbers to display
 */
export function getPaginationPages(
  totalPages: number,
  currentPage: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    end = maxVisible;
    start = 1;
  } else if (end > totalPages) {
    start = totalPages - maxVisible + 1;
    end = totalPages;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
