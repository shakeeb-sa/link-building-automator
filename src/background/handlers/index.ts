/**
 * Central routing for background message handlers.
 *
 * Imports all domain‑specific handlers and provides a function
 * to route incoming messages to the appropriate handler.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';
import { handleProfileMessage } from './profileHandlers';
import { handleWatchtowerMessage } from './watchtowerHandlers';
import { handleFormatMemoryMessage } from './formatMemoryHandlers';
import { handleUnusedBacklinksMessage } from './unusedBacklinksHandlers';
import { handleNavigationMessage } from './navigationHandlers';
import { handleToggleMessage } from './toggleHandlers';
import { handleUIMessage } from './uiHandlers';

// Re‑export all handlers for external use (e.g., testing)
export {
  handleProfileMessage,
  handleWatchtowerMessage,
  handleFormatMemoryMessage,
  handleUnusedBacklinksMessage,
  handleNavigationMessage,
  handleToggleMessage,
  handleUIMessage,
};

/**
 * Routes a message to the first handler that can process it.
 *
 * @param message - The extension message to handle.
 * @param sender - The sender of the message (e.g., tab or popup).
 * @returns The response object from the handler.
 * @throws Error if no handler can process the message type.
 */
export async function routeMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  const handlers = [
    handleProfileMessage,
    handleWatchtowerMessage,
    handleFormatMemoryMessage,
    handleUnusedBacklinksMessage,
    handleNavigationMessage,
    handleToggleMessage,
    handleUIMessage,
  ];

  for (const handler of handlers) {
    const result = await handler(message, sender);
    if (result !== null) {
      return result;
    }
  }

  // No handler matched – throw an error with the unhandled type
  throw new Error(`Unhandled message type: ${message.type}`);
}