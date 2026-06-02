/**
 * UI message handlers for the background service worker.
 *
 * Handles all messages related to user interface feedback:
 * - Showing toast notifications (acknowledge)
 * - Context menu paste operations (acknowledge)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';

export async function handleUIMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'SHOW_TOAST':
    case 'CONTEXT_MENU_PASTE': {
      // These are handled by the receiving end (popup or content script).
      // Background simply acknowledges.
      return { success: true };
    }

    default:
      return null; // Not handled by this handler
  }
}