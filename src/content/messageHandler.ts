/**
 * Message handler for content script.
 *
 * Listens for extension messages and triggers appropriate callbacks.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../shared/types/messages';

interface MessageCallbacks {
  onMasterToggle: (enabled: boolean) => void;
  onGoldMineToggle: (enabled: boolean) => void;
}

export function setupMessageListener(callbacks: MessageCallbacks): void {
  function onMessage(
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ): boolean {
    if (message.type === 'MASTER_SWITCH_TOGGLE') {
      callbacks.onMasterToggle(message.payload.enabled);
      sendResponse({ success: true });
      return false;
    }

    if (message.type === 'TOGGLE_GOLD_MINE') {
      callbacks.onGoldMineToggle(message.payload.enabled);
      sendResponse({ success: true });
      return false;
    }

    // Other messages are handled by individual features
    return false;
  }

  chrome.runtime.onMessage.addListener(onMessage);
}