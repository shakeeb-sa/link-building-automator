// src/background/messaging.ts
import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';
import { routeMessage } from './handlers';

export function setupMessageRouter(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      routeMessage(message, sender)
        .then((response) => sendResponse(response))
        .catch((err) => {
          handleError('Messaging.routeMessage', err, 'Message handling failed');
          sendResponse({ success: false, error: 'Internal error' });
        });
      return true; // Keep channel open for async response
    }
  );
}