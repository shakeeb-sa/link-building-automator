/**
 * Format Memory message types for the extension's messaging system.
 *
 * Defines all messages related to per‑domain format preferences:
 * - Getting the saved format for a domain
 * - Setting/saving a format for a domain
 * - Retrieving all saved formats
 * - Deleting a single format entry
 * - Clearing all format memory
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { FormatType } from '../storage';

// ----------------------------------------------------------------------------
// GET_FORMAT_MEMORY – retrieve the saved format for a domain
// ----------------------------------------------------------------------------
export type GetFormatMemoryMessage = BaseMessage<'GET_FORMAT_MEMORY'> & {
  payload: { domain: string };
};
export type GetFormatMemoryResponse = { format: FormatType | null };

// ----------------------------------------------------------------------------
// SET_FORMAT_MEMORY – save a format preference for a domain
// ----------------------------------------------------------------------------
export type SetFormatMemoryMessage = BaseMessage<'SET_FORMAT_MEMORY'> & {
  payload: { domain: string; format: FormatType };
};
export type SetFormatMemoryResponse = { success: boolean };

// ----------------------------------------------------------------------------
// GET_ALL_FORMATS – retrieve the complete format memory object
// ----------------------------------------------------------------------------
export type GetAllFormatsMessage = BaseMessage<'GET_ALL_FORMATS'>;
export type GetAllFormatsResponse = { formats: Record<string, FormatType> };

// ----------------------------------------------------------------------------
// DELETE_FORMAT – remove the saved format for a specific domain
// ----------------------------------------------------------------------------
export type DeleteFormatMessage = BaseMessage<'DELETE_FORMAT'> & {
  payload: { domain: string };
};
export type DeleteFormatResponse = { success: boolean };

// ----------------------------------------------------------------------------
// CLEAR_ALL_FORMATS – delete all saved format preferences
// ----------------------------------------------------------------------------
export type ClearAllFormatsMessage = BaseMessage<'CLEAR_ALL_FORMATS'>;
export type ClearAllFormatsResponse = { success: boolean };