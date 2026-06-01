import type { IUnusedBacklinksCategorized } from '../types/unusedBacklinks';
import { getStorage, setStorage } from './storage';
import { handleError } from '../utils/errorHandler';

/**
 * Replaces the entire categorized backlinks object.
 * @param categorized – mapping sheet name → array of URLs
 * @returns true on success, false on error
 */
export async function setCategorized(categorized: IUnusedBacklinksCategorized): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.unusedBacklinks.categorized = categorized;
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('UnusedBacklinksService.setCategorized', err, 'Failed to save categorized backlinks');
    return false;
  }
}

/**
 * Returns the current categorized backlinks object.
 */
export async function getCategorized(): Promise<IUnusedBacklinksCategorized> {
  try {
    const storage = await getStorage();
    return { ...storage.unusedBacklinks.categorized };
  } catch (err) {
    handleError('UnusedBacklinksService.getCategorized', err, 'Failed to retrieve categorized backlinks');
    return {};
  }
}

/**
 * Adds URLs to the history (used backlinks).
 * Duplicates are ignored (Set ensures uniqueness).
 * @param urls – array of URLs to mark as used
 * @returns true on success
 */
export async function addToHistory(urls: string[]): Promise<boolean> {
  try {
    const storage = await getStorage();
    const historySet = new Set(storage.unusedBacklinks.history);
    for (const url of urls) {
      historySet.add(url);
    }
    storage.unusedBacklinks.history = Array.from(historySet);
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('UnusedBacklinksService.addToHistory', err, 'Failed to update history');
    return false;
  }
}

/**
 * Returns the current history array (used URLs).
 */
export async function getHistory(): Promise<string[]> {
  try {
    const storage = await getStorage();
    return [...storage.unusedBacklinks.history];
  } catch (err) {
    handleError('UnusedBacklinksService.getHistory', err, 'Failed to retrieve history');
    return [];
  }
}

/**
 * Clears the entire history (marks all backlinks as unused).
 */
export async function clearHistory(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.unusedBacklinks.history = [];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('UnusedBacklinksService.clearHistory', err, 'Failed to clear history');
    return false;
  }
}

/**
 * Counts total unique URLs across all categories that are NOT in history.
 */
export async function getRemainingCount(): Promise<number> {
  try {
    const storage = await getStorage();
    const historySet = new Set(storage.unusedBacklinks.history);
    let remaining = 0;
    for (const urls of Object.values(storage.unusedBacklinks.categorized)) {
      for (const url of urls) {
        if (!historySet.has(url)) {
          remaining++;
        }
      }
    }
    return remaining;
  } catch (err) {
    handleError('UnusedBacklinksService.getRemainingCount', err, 'Failed to count remaining backlinks');
    return 0;
  }
}

/**
 * Returns unique, non‑history URLs from a specific category sheet.
 * @param category – sheet name
 * @returns array of URLs (full URLs, not normalized)
 */
export async function getUniqueUrlsFromCategory(category: string): Promise<string[]> {
  try {
    const storage = await getStorage();
    const urls = storage.unusedBacklinks.categorized[category];
    if (!urls || !Array.isArray(urls)) {
      return [];
    }
    const historySet = new Set(storage.unusedBacklinks.history);
    return urls.filter(url => !historySet.has(url));
  } catch (err) {
    handleError('UnusedBacklinksService.getUniqueUrlsFromCategory', err, 'Failed to get category URLs');
    return [];
  }
}