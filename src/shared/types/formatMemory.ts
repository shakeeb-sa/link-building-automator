import type { FormatType, IFormatMemory } from './storage';

// Re-export for convenience
export type { FormatType, IFormatMemory };

/**
 * Payload for setting/updating a domain's format preference.
 */
export interface SetFormatPayload {
  domain: string;
  format: FormatType;
}

/**
 * Response when retrieving a domain's format preference.
 */
export interface GetFormatResponse {
  domain: string;
  format: FormatType | null;
}

/**
 * Type guard to check if an object is a valid IFormatMemory.
 * Useful after reading from storage or receiving via messaging.
 */
export function isFormatMemory(obj: unknown): obj is IFormatMemory {
  if (obj === null || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  
  const validFormats: FormatType[] = [
    'HTML Code (Clean)',
    'Plain Text',
    'Raw Text',
    'Markdown (Inline)',
    'BBCode',
    'Markdown (Reference)',
    'Rich Text',
  ];
  
  for (const key in candidate) {
    const value = candidate[key];
    if (typeof value !== 'string') return false;
    if (!validFormats.includes(value as FormatType)) return false;
  }
  return true;
}