import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';

// Store the original tab ID for the Converter ping‑pong logic
let converterReturnTabId: number | null = null;

/**
 * Finds an existing tab matching a given URL pattern.
 * @param urlPattern – substring to match in the URL
 * @returns tab object or null
 */
async function findTabByUrlPattern(urlPattern: string): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ url: `*://*/*` });
  return tabs.find((tab) => tab.url?.includes(urlPattern)) || null;
}

/**
 * Switches to an existing tab or creates a new one, then focuses it.
 * @param url – full URL to open
 * @param refresh – whether to reload the tab if it already exists
 * @returns the tab ID
 */
async function switchToOrCreateTab(url: string, refresh: boolean = false): Promise<number> {
  const existing = await findTabByUrlPattern(new URL(url).hostname);
  if (existing && existing.id) {
    await chrome.windows.update(existing.windowId, { focused: true });
    await chrome.tabs.update(existing.id, { active: true });
    if (refresh) {
      await chrome.tabs.reload(existing.id);
    }
    return existing.id;
  }
  const newTab = await chrome.tabs.create({ url });
  return newTab.id ?? 0;
}

/**
 * Handles the ACTIVATE_FAKEMAIL message.
 * Opens/refreshes fakemail.net.
 */
async function handleActivateFakeMail(): Promise<void> {
  try {
    await switchToOrCreateTab('https://www.fakemail.net/', true);
  } catch (err) {
    handleError('Navigation.handleActivateFakeMail', err, 'Failed to open FakeMail');
  }
}

/**
 * Handles the ACTIVATE_CONVERTER message (ping‑pong toggle).
 * @param returnTabId – ID of the tab that sent the message (current tab)
 */
async function handleActivateConverter(returnTabId?: number): Promise<void> {
  try {
    const converterUrl = 'https://shakeeb-sa.github.io/multi-format-link-converter/';
    const existing = await findTabByUrlPattern('shakeeb-sa.github.io/multi-format-link-converter');

    // If we are already on the converter tab and we have a stored return tab, switch back
    if (existing && existing.active && converterReturnTabId !== null) {
      const returnTab = await chrome.tabs.get(converterReturnTabId).catch(() => null);
      if (returnTab && returnTab.id) {
        await chrome.windows.update(returnTab.windowId, { focused: true });
        await chrome.tabs.update(returnTab.id, { active: true });
        converterReturnTabId = null;
        return;
      }
    }

    // Store the original tab ID for later return (only if provided)
    if (returnTabId && converterReturnTabId === null) {
      converterReturnTabId = returnTabId;
    }

    // Switch to (or create) the converter tab
    await switchToOrCreateTab(converterUrl, false);
  } catch (err) {
    handleError('Navigation.handleActivateConverter', err, 'Failed to open Link Converter');
  }
}

/**
 * Sets up message listeners for navigation-related messages.
 * Called from background/index.ts during initialisation.
 */
export function setupNavigationListeners(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      // Handle asynchronously; sendResponse is optional
      if (message.type === 'ACTIVATE_FAKEMAIL') {
        handleActivateFakeMail().catch(() => {});
        sendResponse({ success: true });
        return true; // Keep channel open for async response
      }

      if (message.type === 'ACTIVATE_CONVERTER') {
        const returnTabId = message.payload?.returnTabId ?? sender.tab?.id;
        handleActivateConverter(returnTabId).catch(() => {});
        sendResponse({ success: true });
        return true;
      }

      return false; // Not handled here
    }
  );
}