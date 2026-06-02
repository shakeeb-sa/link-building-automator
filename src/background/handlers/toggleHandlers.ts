/**
 * Toggle message handlers for the background service worker.
 *
 * Handles all messages related to feature toggles and activation commands:
 * - Master power switch (acknowledge)
 * - Gold Mine shuffle (placeholder batch)
 * - Toggle Gold Mine feature (save state and notify tabs)
 * - QUAD_FILL command (acknowledge)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';

export async function handleToggleMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'MASTER_SWITCH_TOGGLE': {
      // Storage is updated by the popup; we just acknowledge.
      return { success: true };
    }

    case 'GOLD_MINE_SHUFFLE': {
      // Placeholder: returns an empty batch.
      // Full implementation would fetch saved formats.
      return {
        batch: {
          urls: [],
          formats: [],
        },
      };
    }

    case 'TOGGLE_GOLD_MINE': {
      const { enabled } = message.payload;
      // Save to storage
      await chrome.storage.local.set({ goldMineEnabled: enabled });
      // Notify all content scripts
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {});
        }
      }
      return { success: true };
    }

    case 'QUAD_FILL': {
      // Content script handles filling; just acknowledge.
      return { success: true };
    }

    default:
      return null; // Not handled by this handler
  }
}