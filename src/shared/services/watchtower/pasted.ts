/**
 * Pasted watchtower domain list operations.
 *
 * Provides functions to add, get, set, remove, and clear domains
 * from the pasted blocklist.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { getWatchtowerStorage, setWatchtowerStorage, normalizeDomains } from './common';
import { handleError } from '../../utils/errorHandler';

export async function addPastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const normalized = normalizeDomains(domains);
    const current = new Set(storage.watchtower.pasted);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.pasted = Array.from(current);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPasted.addPastedDomains', err, 'Failed to add pasted domains');
    return false;
  }
}

export async function getPastedDomains(): Promise<string[]> {
  try {
    const storage = await getWatchtowerStorage();
    return storage.watchtower.pasted;
  } catch (err) {
    handleError('WatchtowerPasted.getPastedDomains', err, 'Failed to get pasted domains');
    return [];
  }
}

export async function setPastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.pasted = normalizeDomains(domains);
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPasted.setPastedDomains', err, 'Failed to set pasted domains');
    return false;
  }
}

export async function removePastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    const toRemove = new Set(normalizeDomains(domains));
    storage.watchtower.pasted = storage.watchtower.pasted.filter(d => !toRemove.has(d));
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPasted.removePastedDomains', err, 'Failed to remove pasted domains');
    return false;
  }
}

export async function clearPastedList(): Promise<boolean> {
  try {
    const storage = await getWatchtowerStorage();
    storage.watchtower.pasted = [];
    await setWatchtowerStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerPasted.clearPastedList', err, 'Failed to clear pasted list');
    return false;
  }
}