/**
 * Primary watchtower domain list operations.
 *
 * Provides functions to add, get, set, remove, and clear domains
 * from the primary blocklist.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { getWatchtowerStorage, setWatchtowerStorage, normalizeDomains } from './common';
import { handleError } from '../../utils/errorHandler';

export async function addPrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const normalized = normalizeDomains(domains);
    const current = new Set(storage.watchtower.primary);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.primary = Array.from(current);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPrimary.addPrimaryDomains', err, 'Failed to add primary domains');
    return false;
  }
}

export async function getPrimaryDomains(): Promise<string[]> {
  try {
    const storage = await getWatchtowerStorage();
    return storage.watchtower.primary;
  } catch (err) {
    handleError('WatchtowerPrimary.getPrimaryDomains', err, 'Failed to get primary domains');
    return [];
  }
}

export async function setPrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.primary = normalizeDomains(domains);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPrimary.setPrimaryDomains', err, 'Failed to set primary domains');
    return false;
  }
}

export async function removePrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const toRemove = new Set(normalizeDomains(domains));
    storage.watchtower.primary = storage.watchtower.primary.filter(d => !toRemove.has(d));
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPrimary.removePrimaryDomains', err, 'Failed to remove primary domains');
    return false;
  }
}

export async function clearPrimaryList(): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.primary = [];
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPrimary.clearPrimaryList', err, 'Failed to clear primary list');
    return false;
  }
}