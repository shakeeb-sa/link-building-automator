/**
 * Feature manager for content script.
 *
 * Initialises all extension features and provides cleanup.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

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

type CleanupFunction = () => void;

const FEATURES: Array<() => CleanupFunction | Promise<CleanupFunction>> = [
  initFormFiller,
  initWatchtower,
  initGatewayHunter,
  initEmailHunter,
  initUnusedBacklinks,
  initGoldMine,
  initUrlSwapper,
  initContextMenu,
];

export async function initAllFeatures(): Promise<CleanupFunction[]> {
  const cleanups: CleanupFunction[] = [];

  for (const init of FEATURES) {
    try {
      const result = init();
      const cleanup = result instanceof Promise ? await result : result;
      cleanups.push(cleanup);
    } catch (err) {
      handleError(`FeatureManager.init: ${init.name}`, err, 'Feature initialisation failed');
    }
  }

  return cleanups;
}

export function destroyAllFeatures(cleanups: CleanupFunction[]): void {
  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch (err) {
      handleError('FeatureManager.destroy', err, 'Error destroying feature');
    }
  }
}