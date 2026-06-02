/**
 * Secondary watchtower domain list operations.
 *
 * Provides functions to add, get, set, remove, and clear domains
 * from the secondary blocklist.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { getWatchtowerStorage, setWatchtowerStorage, normalizeDomains } from './common';
import { handleError } from '../../utils/errorHandler';

export async function addSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const normalized = normalizeDomains(domains);
    const current = new Set(storage.watchtower.secondary);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.secondary = Array.from(current);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerSecondary.addSecondaryDomains', err, 'Failed to add secondary domains');
    return false;
  }
}

export async function getSecondaryDomains(): Promise<string[]> {
  try {
    const storage = await getWatchtowerStorage();
    return storage.watchtower.secondary;
  } catch (err) {
    handleError('WatchtowerSecondary.getSecondaryDomains', err, 'Failed to get secondary domains');
    return [];
  }
}

export async function setSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.secondary = normalizeDomains(domains);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerSecondary.setSecondaryDomains', err, 'Failed to set secondary domains');
    return false;
  }
}

export async function removeSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const toRemove = new Set(normalizeDomains(domains));
    storage.watchtower.secondary = storage.watchtower.secondary.filter(d => !toRemove.has(d));
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerSecondary.removeSecondaryDomains', err, 'Failed to remove secondary domains');
    return false;
  }
}

export async function clearSecondaryList(): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.secondary = [];
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerSecondary.clearSecondaryList', err, 'Failed to clear secondary list');
    return false;
  }
}