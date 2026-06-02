/**
 * Watchtower service – central export.
 *
 * Re‑exports all domain list operations and cross‑list checks.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

// Primary list operations
export {
  addPrimaryDomains,
  getPrimaryDomains,
  setPrimaryDomains,
  removePrimaryDomains,
  clearPrimaryList,
} from './primary';

// Secondary list operations
export {
  addSecondaryDomains,
  getSecondaryDomains,
  setSecondaryDomains,
  removeSecondaryDomains,
  clearSecondaryList,
} from './secondary';

// Pasted list operations
export {
  addPastedDomains,
  getPastedDomains,
  setPastedDomains,
  removePastedDomains,
  clearPastedList,
} from './pasted';

// Cross‑list operations
export {
  isDomainBlocked,
  getAllBlockedDomains,
  clearAllWatchtowerLists,
} from './checks';