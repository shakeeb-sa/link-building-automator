import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';

// Feature initialisers (each returns a cleanup function)
import { init as initFormFiller } from './features/formFiller';
import { init as initWatchtower } from './features/watchtower';
import { init as initGatewayHunter } from './features/gatewayHunter';
import { init as initEmailHunter } from './features/emailHunter';
import { init as initUnusedBacklinks } from './features/unusedBacklinks';
import { init as initGoldMine } from './features/goldMine';
import { init as initUrlSwapper } from './features/urlSwapper';
import { init as initContextMenu } from './features/contextMenu';

// Store active cleanup functions
type CleanupFunction = () => void;
let activeCleanups: CleanupFunction[] = [];
let isMasterEnabled = true;

// Helper to destroy all active features
function destroyAllFeatures(): void {
  for (const cleanup of activeCleanups) {
    try {
      cleanup();
    } catch (err) {
      handleError('Content.destroyFeature', err, 'Error destroying feature');
    }
  }
  activeCleanups = [];
}

// Helper to initialise all features
function initAllFeatures(): void {
  if (!isMasterEnabled) return;

  const features = [
    initFormFiller,
    initWatchtower,
    initGatewayHunter,
    initEmailHunter,
    initUnusedBacklinks,
    initGoldMine,
    initUrlSwapper,
    initContextMenu,
  ];

  for (const init of features) {
    try {
      const cleanup = init();
      activeCleanups.push(cleanup);
    } catch (err) {
      handleError(`Content.initFeature: ${init.name}`, err, 'Feature initialisation failed');
    }
  }
}

// Handle master switch toggle message
function handleMasterSwitchToggle(enabled: boolean): void {
  if (enabled === isMasterEnabled) return;
  isMasterEnabled = enabled;

  if (!enabled) {
    destroyAllFeatures();
    console.log('[Lightning LinkBuilder] Master switch disabled – features destroyed');
  } else {
    initAllFeatures();
    console.log('[Lightning LinkBuilder] Master switch enabled – features initialised');
  }
}

// Handle gold mine toggle message (forward to gold mine feature)
function handleGoldMineToggle(enabled: boolean): void {
  // Gold mine feature will listen to its own messages; we can also broadcast
  // but the feature module already listens. No need to duplicate.
  // However, to avoid multiple listeners, we can just pass the message.
  // The feature will handle it internally.
}

// Message router
function onMessage(message: ExtensionMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void): boolean {
  if (message.type === 'MASTER_SWITCH_TOGGLE') {
    handleMasterSwitchToggle(message.payload.enabled);
    sendResponse({ success: true });
    return false; // No async response needed
  }

  if (message.type === 'TOGGLE_GOLD_MINE') {
    handleGoldMineToggle(message.payload.enabled);
    sendResponse({ success: true });
    return false;
  }

  // Other messages are handled by individual features (e.g., context menu)
  // We don't need to handle them here.
  return false;
}

// Initialise master switch state from storage
async function loadMasterSwitchState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['masterSwitchEnabled'], (result) => {
      if (chrome.runtime.lastError) {
        handleError('Content.loadMasterSwitchState', chrome.runtime.lastError, 'Failed to load master switch state');
        isMasterEnabled = true; // Default to enabled
      } else {
        isMasterEnabled = result.masterSwitchEnabled !== false;
      }
      resolve();
    });
  });
}

// Set up message listener
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(onMessage);
}

// Main initialisation
async function init(): Promise<void> {
  await loadMasterSwitchState();
  setupMessageListener();
  if (isMasterEnabled) {
    initAllFeatures();
  }
  console.log('[Lightning LinkBuilder] Content script initialised, master enabled:', isMasterEnabled);
}

init().catch((err) => {
  handleError('Content.init', err, 'Failed to initialise content script');
});