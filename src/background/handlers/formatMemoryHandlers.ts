/**
 * Format Memory message handlers for the background service worker.
 *
 * Handles all messages related to per‑domain format preferences:
 * - Getting the saved format for a domain
 * - Setting/saving a format for a domain
 * - Retrieving all saved formats
 * - Deleting a single format entry
 * - Clearing all format memory
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';
import * as formatMemoryService from '../../shared/services/formatMemoryService';

export async function handleFormatMemoryMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'GET_FORMAT_MEMORY': {
      const format = await formatMemoryService.getFormat(message.payload.domain);
      return { format };
    }

    case 'SET_FORMAT_MEMORY': {
      const success = await formatMemoryService.setFormat(
        message.payload.domain,
        message.payload.format
      );
      return { success };
    }

    case 'GET_ALL_FORMATS': {
      const formats = await formatMemoryService.getAllFormats();
      return { formats };
    }

    case 'DELETE_FORMAT': {
      const success = await formatMemoryService.deleteFormat(message.payload.domain);
      return { success };
    }

    case 'CLEAR_ALL_FORMATS': {
      const success = await formatMemoryService.clearAllFormats();
      return { success };
    }

    default:
      return null; // Not handled by this handler
  }
}