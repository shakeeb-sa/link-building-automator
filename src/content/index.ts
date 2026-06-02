// src/content/index.ts
import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';

// Feature initialisers (each returns a cleanup function)
import { init as initFormFiller } from '../content/features/formFiller';
import { init as initWatchtower } from '../content/features/watchtower';
import { init as initGatewayHunter } from '../content/features/gatewayHunter';
import { init as initEmailHunter } from '../content/features/emailHunter';
import { init as initUnusedBacklinks } from '../content/features/unusedBacklinks';
import { init as initGoldMine } from '../content/features/goldMine';
import { init as initUrlSwapper } from '../content/features/urlSwapper';
import { init as initContextMenu } from '../content/features/contextMenu';

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

// Helper to initialise all features (handles both sync and async inits)
async function initAllFeatures(): Promise<void> {
  if (!isMasterEnabled) return;

  const features: Array<() => CleanupFunction | Promise<CleanupFunction>> = [
    initFormFiller,
    initWatchtower,
    initGatewayHunter,
    initEmailHunter,
    initUnusedBacklinks,
    initGoldMine,      // async – returns Promise<CleanupFunction>
    initUrlSwapper,
    initContextMenu,
  ];

  for (const init of features) {
    try {
      const result = init();
      const cleanup = result instanceof Promise ? await result : result;
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
    initAllFeatures().catch((err) => {
      handleError('Content.initAllFeatures', err, 'Failed to re-initialise features');
    });
    console.log('[Lightning LinkBuilder] Master switch enabled – features initialised');
  }
}

// Handle gold mine toggle message
function handleGoldMineToggle(enabled: boolean): void {
  // The gold mine feature listens to its own messages via chrome.runtime.onMessage.
  // This function is a placeholder for any additional logic if needed.
  console.log('[Lightning LinkBuilder] Gold mine toggle received:', enabled);
}

// Message router
function onMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
): boolean {
  if (message.type === 'MASTER_SWITCH_TOGGLE') {
    handleMasterSwitchToggle(message.payload.enabled);
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'TOGGLE_GOLD_MINE') {
    handleGoldMineToggle(message.payload.enabled);
    sendResponse({ success: true });
    return false;
  }

  // Other messages are handled by individual features
  return false;
}

// Load master switch state from storage
async function loadMasterSwitchState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['masterSwitchEnabled'], (result) => {
      if (chrome.runtime.lastError) {
        handleError(
          'Content.loadMasterSwitchState',
          chrome.runtime.lastError,
          'Failed to load master switch state'
        );
        isMasterEnabled = true;
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
    await initAllFeatures();
  }
  console.log('[Lightning LinkBuilder] Content script initialised, master enabled:', isMasterEnabled);
}

init().catch((err) => {
  handleError('Content.init', err, 'Failed to initialise content script');
});