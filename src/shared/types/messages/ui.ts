/**
 * UI feedback message types for the extension's messaging system.
 *
 * Defines all messages related to user interface feedback:
 * - Showing toast notifications (success, error, info)
 * - Context menu paste operations (double right‑click pasting with format conversion)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { FormatType } from '../storage';

// ----------------------------------------------------------------------------
// SHOW_TOAST – display a temporary notification message
// ----------------------------------------------------------------------------
export type ShowToastMessage = BaseMessage<'SHOW_TOAST'> & {
  payload: { message: string; type: 'success' | 'error' | 'info' };
};
export type ShowToastResponse = { success: boolean };

// ----------------------------------------------------------------------------
// CONTEXT_MENU_PASTE – paste converted content into the active editable element
// ----------------------------------------------------------------------------
export type ContextMenuPasteMessage = BaseMessage<'CONTEXT_MENU_PASTE'> & {
  payload: { text: string; isRich: boolean; format?: FormatType };
};
export type ContextMenuPasteResponse = { success: boolean };