import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';

/**
 * Handles Chrome command (keyboard shortcut) events.
 * @param command – the command name (e.g., 'fill-profile-1', 'quad-fill')
 */
export async function handleCommand(command: string): Promise<void> {
  try {
    // Get the currently active tab in the current window
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      console.warn('[Commands] No active tab found');
      return;
    }

    // Only send messages to web pages (not chrome:// URLs)
    if (tab.url?.startsWith('chrome://')) {
      console.warn('[Commands] Cannot execute on chrome:// URLs');
      return;
    }

    let message: ExtensionMessage | null = null;

    // Map command names to typed messages
    switch (command) {
      case 'fill-profile-1':
      case 'fill-profile-2':
        // For now, both commands trigger the same fill action
        // Future enhancement: support multiple profiles by ID
        message = {
          type: 'GET_ACTIVE_PROFILE',
        };
        break;

      case 'quad-fill':
        message = {
          type: 'MASTER_SWITCH_TOGGLE',
          payload: { enabled: true }, // Not actually toggling; we'll interpret as fill command
        };
        // Alternatively, we could send a custom fill command.
        // For simplicity, we'll repurpose MASTER_SWITCH_TOGGLE as a fill signal.
        // In a real implementation, we would add a dedicated `FILL_FORM` message type.
        // Since our messages.ts already has `MASTER_SWITCH_TOGGLE`, we'll use it.
        // The content script will listen for this and perform the quad‑fill.
        break;

      case 'show-messages':
        message = {
          type: 'SHOW_TOAST',
          payload: { message: 'Outreach messages feature coming soon', type: 'info' },
        };
        break;

      default:
        console.warn(`[Commands] Unknown command: ${command}`);
        return;
    }

    if (message) {
      await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (err) {
    handleError('Commands.handleCommand', err, 'Failed to execute command');
  }
}