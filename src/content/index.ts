/**
 * Content script orchestrator.
 *
 * Loads master switch state, sets up message handling,
 * and manages feature lifecycle.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { handleError } from '../shared/utils/errorHandler';
import { loadMasterState, isMasterEnabled, setMasterEnabled } from './state';
import { initAllFeatures, destroyAllFeatures } from './featureManager';
import { setupMessageListener } from './messageHandler';

let currentCleanups: (() => void)[] = [];

async function handleMasterToggle(enabled: boolean): Promise<void> {
  if (enabled === isMasterEnabled()) return;
  setMasterEnabled(enabled);

  if (!enabled) {
    destroyAllFeatures(currentCleanups);
    currentCleanups = [];
    console.log('[Lightning LinkBuilder] Master switch disabled – features destroyed');
  } else {
    currentCleanups = await initAllFeatures();
    console.log('[Lightning LinkBuilder] Master switch enabled – features initialised');
  }
}

function handleGoldMineToggle(enabled: boolean): void {
  // Gold Mine feature listens to its own messages; this is just for logging.
  console.log('[Lightning LinkBuilder] Gold mine toggle received:', enabled);
}

async function init(): Promise<void> {
  await loadMasterState();
  setupMessageListener({
    onMasterToggle: (enabled) => {
      handleMasterToggle(enabled).catch((err) => {
        handleError('Content.handleMasterToggle', err, 'Failed to toggle master switch');
      });
    },
    onGoldMineToggle: handleGoldMineToggle,
  });

  if (isMasterEnabled()) {
    currentCleanups = await initAllFeatures();
  }
  console.log('[Lightning LinkBuilder] Content script initialised, master enabled:', isMasterEnabled());
}

init().catch((err) => {
  handleError('Content.init', err, 'Failed to initialise content script');
});