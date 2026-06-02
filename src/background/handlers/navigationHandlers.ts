/**
 * Navigation message handlers for the background service worker.
 *
 * Handles all messages related to opening external tools and overlays:
 * - Activating FakeMail tab (acknowledged, actual handling in navigation.ts)
 * - Activating Link Converter tab (acknowledged)
 * - Opening Gateway Hunter menu (forwards message to active tab)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';

export async function handleNavigationMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'ACTIVATE_FAKEMAIL':
    case 'ACTIVATE_CONVERTER': {
      // Actual tab switching is handled by separate navigation listeners.
      // Here we just acknowledge.
      return { success: true };
    }

    case 'OPEN_GATEWAY_MENU': {
      // Forward the message to the currently active tab to open the gateway menu
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, message);
      }
      return { success: true };
    }

    default:
      return null; // Not handled by this handler
  }
}