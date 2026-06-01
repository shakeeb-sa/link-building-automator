import type { IWatchtowerLists } from './storage';

// Re-export for convenience
export type { IWatchtowerLists };

/**
 * Which list(s) contain the domain.
 */
export type WatchtowerSource = 'primary' | 'secondary' | 'pasted' | 'none';

/**
 * Result of checking a domain against the watchtower.
 */
export interface IWatchtowerStatus {
  domain: string;
  isBlocked: boolean;
  sources: WatchtowerSource[];
  totalBlockedDomains: number;
}

/**
 * Result of uploading/parsing a watchtower file or pasted URLs.
 */
export interface IWatchtowerUploadResult {
  success: boolean;
  source: Exclude<WatchtowerSource, 'none'>;
  addedCount: number;
  totalNow: number;
  error?: string;
}

/**
 * Type guard to check if a value is a valid IWatchtowerStatus.
 * This is useful after receiving data from storage or messaging.
 */
export function isWatchtowerStatus(obj: unknown): obj is IWatchtowerStatus {
  if (obj === null || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.domain === 'string' &&
    typeof candidate.isBlocked === 'boolean' &&
    Array.isArray(candidate.sources) &&
    candidate.sources.every((s: unknown) => s === 'primary' || s === 'secondary' || s === 'pasted' || s === 'none') &&
    typeof candidate.totalBlockedDomains === 'number'
  );
}