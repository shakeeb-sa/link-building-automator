/**
 * Cross‑list watchtower operations.
 *
 * Provides functions to check domain status across all lists,
 * retrieve all blocked domains, and clear all lists at once.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { getWatchtowerStorage, setWatchtowerStorage, getNormalizedDomain } from './common';
import { handleError } from '../../utils/errorHandler';

export async function isDomainBlocked(domain: string): Promise<boolean> {
  try {
    const normalized = getNormalizedDomain(domain);
    if (!normalized) return false;
    const storage = await getWatchtowerStorage();
    return (
      storage.watchtower.primary.includes(normalized) ||
      storage.watchtower.secondary.includes(normalized) ||
      storage.watchtower.pasted.includes(normalized)
    );
  } catch (err) {
    handleError('WatchtowerChecks.isDomainBlocked', err, 'Failed to check domain');
    return false;
  }
}

export async function getAllBlockedDomains(): Promise<string[]> {
  try {
    const storage = await getWatchtowerStorage();
    const combined = new Set([
      ...storage.watchtower.primary,
      ...storage.watchtower.secondary,
      ...storage.watchtower.pasted,
    ]);
    return Array.from(combined).sort();
  } catch (err) {
    handleError('WatchtowerChecks.getAllBlockedDomains', err, 'Failed to retrieve blocked domains');
    return [];
  }
}

export async function clearAllWatchtowerLists(): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.primary = [];
    storage.watchtower.secondary = [];
    storage.watchtower.pasted = [];
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerChecks.clearAllWatchtowerLists', err, 'Failed to clear watchtower');
    return false;
  }
}