import type { IWatchtowerLists } from '../types/watchtower';
import { getStorage, setStorage } from './storage';
import { normalizeDomain } from '../utils/domain';
import { handleError } from '../utils/errorHandler';

/**
 * Adds domains to the primary list (overwrites duplicates with set).
 * @param domains – array of raw domain strings or URLs
 * @returns true on success, false on error
 */
export async function addPrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const normalized = domains.map(normalizeDomain).filter(d => d.length > 0);
    const current = new Set(storage.watchtower.primary);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.primary = Array.from(current);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.addPrimaryDomains', err, 'Failed to add primary domains');
    return false;
  }
}

/**
 * Gets the entire primary domain list.
 * @returns array of primary domains
 */
export async function getPrimaryDomains(): Promise<string[]> {
  try {
    const storage = await getStorage();
    return storage.watchtower.primary;
  } catch (err) {
    handleError('WatchtowerService.getPrimaryDomains', err, 'Failed to get primary domains');
    return [];
  }
}

/**
 * Adds domains to the secondary list.
 */
export async function addSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const normalized = domains.map(normalizeDomain).filter(d => d.length > 0);
    const current = new Set(storage.watchtower.secondary);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.secondary = Array.from(current);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.addSecondaryDomains', err, 'Failed to add secondary domains');
    return false;
  }
}

/**
 * Gets the entire secondary domain list.
 * @returns array of secondary domains
 */
export async function getSecondaryDomains(): Promise<string[]> {
  try {
    const storage = await getStorage();
    return storage.watchtower.secondary;
  } catch (err) {
    handleError('WatchtowerService.getSecondaryDomains', err, 'Failed to get secondary domains');
    return [];
  }
}

/**
 * Adds domains to the pasted list.
 */
export async function addPastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const normalized = domains.map(normalizeDomain).filter(d => d.length > 0);
    const current = new Set(storage.watchtower.pasted);
    for (const d of normalized) {
      current.add(d);
    }
    storage.watchtower.pasted = Array.from(current);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.addPastedDomains', err, 'Failed to add pasted domains');
    return false;
  }
}

/**
 * Gets the entire pasted domain list.
 * @returns array of pasted domains
 */
export async function getPastedDomains(): Promise<string[]> {
  try {
    const storage = await getStorage();
    return storage.watchtower.pasted;
  } catch (err) {
    handleError('WatchtowerService.getPastedDomains', err, 'Failed to get pasted domains');
    return [];
  }
}

/**
 * Replaces the entire primary list with a new set of domains.
 */
export async function setPrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.primary = domains.map(normalizeDomain).filter(d => d.length > 0);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.setPrimaryDomains', err, 'Failed to set primary domains');
    return false;
  }
}

/**
 * Replaces the entire secondary list.
 */
export async function setSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.secondary = domains.map(normalizeDomain).filter(d => d.length > 0);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.setSecondaryDomains', err, 'Failed to set secondary domains');
    return false;
  }
}

/**
 * Replaces the entire pasted list.
 */
export async function setPastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.pasted = domains.map(normalizeDomain).filter(d => d.length > 0);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.setPastedDomains', err, 'Failed to set pasted domains');
    return false;
  }
}

/**
 * Removes domains from the primary list.
 * @param domains – domains to remove (normalized internally)
 */
export async function removePrimaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const toRemove = new Set(domains.map(normalizeDomain).filter(d => d.length > 0));
    storage.watchtower.primary = storage.watchtower.primary.filter(d => !toRemove.has(d));
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.removePrimaryDomains', err, 'Failed to remove primary domains');
    return false;
  }
}

/**
 * Removes domains from the secondary list.
 */
export async function removeSecondaryDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const toRemove = new Set(domains.map(normalizeDomain).filter(d => d.length > 0));
    storage.watchtower.secondary = storage.watchtower.secondary.filter(d => !toRemove.has(d));
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.removeSecondaryDomains', err, 'Failed to remove secondary domains');
    return false;
  }
}

/**
 * Removes domains from the pasted list.
 */
export async function removePastedDomains(domains: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const toRemove = new Set(domains.map(normalizeDomain).filter(d => d.length > 0));
    storage.watchtower.pasted = storage.watchtower.pasted.filter(d => !toRemove.has(d));
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.removePastedDomains', err, 'Failed to remove pasted domains');
    return false;
  }
}

/**
 * Checks whether a specific domain is blocked in any of the three lists.
 * @param domain – raw domain or URL (will be normalized)
 * @returns true if blocked, false otherwise
 */
export async function isDomainBlocked(domain: string): Promise<boolean> {
  try {
    const normalized = normalizeDomain(domain);
    if (!normalized) return false;
    const storage = await getStorage();
    return (
      storage.watchtower.primary.includes(normalized) ||
      storage.watchtower.secondary.includes(normalized) ||
      storage.watchtower.pasted.includes(normalized)
    );
  } catch (err) {
    handleError('WatchtowerService.isDomainBlocked', err, 'Failed to check domain');
    return false;
  }
}

/**
 * Returns a merged array of all blocked domains (unique across all three lists).
 */
export async function getAllBlockedDomains(): Promise<string[]> {
  try {
    const storage = await getStorage();
    const combined = new Set([
      ...storage.watchtower.primary,
      ...storage.watchtower.secondary,
      ...storage.watchtower.pasted,
    ]);
    return Array.from(combined).sort();
  } catch (err) {
    handleError('WatchtowerService.getAllBlockedDomains', err, 'Failed to retrieve blocked domains');
    return [];
  }
}

/**
 * Clears all watchtower lists (primary, secondary, pasted).
 */
export async function clearAllWatchtowerLists(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.primary = [];
    storage.watchtower.secondary = [];
    storage.watchtower.pasted = [];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.clearAllWatchtowerLists', err, 'Failed to clear watchtower');
    return false;
  }
}

/**
 * Clears only the primary list.
 */
export async function clearPrimaryList(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.primary = [];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.clearPrimaryList', err, 'Failed to clear primary list');
    return false;
  }
}

/**
 * Clears only the secondary list.
 */
export async function clearSecondaryList(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.secondary = [];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.clearSecondaryList', err, 'Failed to clear secondary list');
    return false;
  }
}

/**
 * Clears only the pasted list.
 */
export async function clearPastedList(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.watchtower.pasted = [];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('WatchtowerService.clearPastedList', err, 'Failed to clear pasted list');
    return false;
  }
}