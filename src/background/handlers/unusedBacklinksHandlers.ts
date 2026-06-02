/**
 * Unused Backlinks message handlers for the background service worker.
 *
 * Handles all messages related to unused backlinks:
 * - Getting a fresh batch of unused backlinks (with history tracking)
 * - Shuffling backlinks, optionally filtered by sheet names
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';
import * as unusedBacklinksService from '../../shared/services/unusedBacklinksService';

export async function handleUnusedBacklinksMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'GET_UNUSED_BACKLINKS': {
      const categorized = await unusedBacklinksService.getCategorized();
      const allUrls: string[] = [];
      for (const urls of Object.values(categorized)) {
        allUrls.push(...urls);
      }
      const history = await unusedBacklinksService.getHistory();
      const available = allUrls.filter((url) => !history.includes(url));
      const batch = available.slice(0, 5);
      await unusedBacklinksService.addToHistory(batch);
      return {
        batch: {
          urls: batch,
          totalRemaining: available.length,
          activeSheetCount: Object.keys(categorized).length,
        },
      };
    }

    case 'SHUFFLE_BACKLINKS': {
      const categorized = await unusedBacklinksService.getCategorized();
      const activeSheets = message.payload.sheetNames ?? Object.keys(categorized);
      let allUrls: string[] = [];
      for (const sheet of activeSheets) {
        const urls = await unusedBacklinksService.getUniqueUrlsFromCategory(sheet);
        allUrls.push(...urls);
      }
      const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
      const batch = shuffled.slice(0, 5);
      await unusedBacklinksService.addToHistory(batch);
      return {
        batch: {
          urls: batch,
          totalRemaining: allUrls.length,
          activeSheetCount: activeSheets.length,
        },
      };
    }

    default:
      return null; // Not handled by this handler
  }
}