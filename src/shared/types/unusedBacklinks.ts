import type { IUnusedBacklinks, IUnusedBacklinksCategorized } from './storage';

// Re-export for convenience
export type { IUnusedBacklinks, IUnusedBacklinksCategorized };

/**
 * Active filters – which sheet names are currently selected.
 */
export interface BacklinkFilter {
  activeSheets: Set<string>;
}

/**
 * A batch of shuffled backlinks (usually 5 at a time).
 */
export interface BacklinkBatch {
  urls: string[];
  totalRemaining: number;
  activeSheetCount: number;
}

/**
 * Complete runtime state for the Unused Backlinks feature.
 */
export interface IUnusedBacklinksState {
  categorized: IUnusedBacklinksCategorized;
  history: string[];           // URLs already used (from all sheets)
  activeFilters: BacklinkFilter;
  lastBatch: BacklinkBatch | null;
}

/**
 * Type guard to check if an object is a valid IUnusedBacklinks.
 * Useful after reading from storage.
 */
export function isUnusedBacklinks(obj: unknown): obj is IUnusedBacklinks {
  if (obj === null || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  
  // Check categorized property
  if (!candidate.categorized || typeof candidate.categorized !== 'object') return false;
  const categorized = candidate.categorized as Record<string, unknown>;
  for (const key in categorized) {
    if (!Array.isArray(categorized[key])) return false;
    if (!categorized[key].every((item: unknown) => typeof item === 'string')) return false;
  }
  
  // Check history array
  if (!Array.isArray(candidate.history)) return false;
  if (!candidate.history.every((item: unknown) => typeof item === 'string')) return false;
  
  return true;
}