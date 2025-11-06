// Shared UI constants
export const DEFAULT_PAGE_SIZE = 10;
export const SKELETON_ROWS = 8;

// Helper to compute pagination display range
export function getPaginationRange(page, total, pageSize = DEFAULT_PAGE_SIZE) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}
