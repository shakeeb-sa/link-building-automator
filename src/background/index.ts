import { migrateStorage } from '../shared/services/storage';
import { handleCommand } from './commands';
import { setupNavigationListeners } from './navigation';
import { setupMessageRouter } from './messaging';

/**
 * Initialises the background service worker.
 * - Runs storage migration on install/update.
 * - Sets up keyboard command listeners.
 * - Initialises navigation (FakeMail, Converter) handlers.
 * - Starts the message router for inter‑process communication.
 */
async function init(): Promise<void> {
  // Migrate storage to latest version on startup
  await migrateStorage();

  // Chrome commands (keyboard shortcuts)
  chrome.commands.onCommand.addListener(handleCommand);

  // Navigation listeners (e.g., opening FakeMail / Converter)
  setupNavigationListeners();

  // Central message router for all extension contexts
  setupMessageRouter();

  console.log('[Lightning LinkBuilder] Background service worker initialized');
}

// Run initialisation
init().catch((err) => {
  console.error('[Lightning LinkBuilder] Background initialisation failed', err);
});