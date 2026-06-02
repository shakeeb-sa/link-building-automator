/**
 * Unused Backlinks message types for the extension's messaging system.
 *
 * Defines all messages related to unused backlinks:
 * - Getting a fresh batch of unused backlinks (with history tracking)
 * - Shuffling backlinks, optionally filtered by sheet names
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { BacklinkBatch } from '../unusedBacklinks';

// ----------------------------------------------------------------------------
// GET_UNUSED_BACKLINKS – retrieve a batch of unused backlinks
// ----------------------------------------------------------------------------
export type GetUnusedBacklinksMessage = BaseMessage<'GET_UNUSED_BACKLINKS'>;
export type GetUnusedBacklinksResponse = { batch: BacklinkBatch | null };

// ----------------------------------------------------------------------------
// SHUFFLE_BACKLINKS – generate a new shuffled batch, optionally from specific sheets
// ----------------------------------------------------------------------------
export type ShuffleBacklinksMessage = BaseMessage<'SHUFFLE_BACKLINKS'> & {
  payload: { sheetNames?: string[] };
};
export type ShuffleBacklinksResponse = { batch: BacklinkBatch };