import type { FormatType, IFormatMemory } from '../types/formatMemory';
import { getStorage, setStorage } from './storage';
import { normalizeDomain } from '../utils/domain';
import { handleError } from '../utils/errorHandler';

/**
 * Retrieves the saved format for a given domain.
 * @param domain – raw domain or URL (will be normalized)
 * @returns the saved FormatType, or null if not set
 */
export async function getFormat(domain: string): Promise<FormatType | null> {
  try {
    const normalized = normalizeDomain(domain);
    if (!normalized) return null;
    const storage = await getStorage();
    return storage.formatMemory[normalized] || null;
  } catch (err) {
    handleError('FormatMemoryService.getFormat', err, 'Failed to get format preference');
    return null;
  }
}

/**
 * Saves a format preference for a domain.
 * @param domain – raw domain or URL (will be normalized)
 * @param format – the chosen FormatType
 * @returns true on success, false on error
 */
export async function setFormat(domain: string, format: FormatType): Promise<boolean> {
  try {
    const normalized = normalizeDomain(domain);
    if (!normalized) return false;
    const storage = await getStorage();
    storage.formatMemory[normalized] = format;
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('FormatMemoryService.setFormat', err, 'Failed to save format preference');
    return false;
  }
}

/**
 * Deletes the format preference for a domain.
 * @param domain – raw domain or URL (will be normalized)
 * @returns true on success, false on error (or if not found)
 */
export async function deleteFormat(domain: string): Promise<boolean> {
  try {
    const normalized = normalizeDomain(domain);
    if (!normalized) return false;
    const storage = await getStorage();
    if (!storage.formatMemory[normalized]) {
      return false;
    }
    delete storage.formatMemory[normalized];
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('FormatMemoryService.deleteFormat', err, 'Failed to delete format preference');
    return false;
  }
}

/**
 * Returns the complete format memory object (domain → format).
 */
export async function getAllFormats(): Promise<IFormatMemory> {
  try {
    const storage = await getStorage();
    return { ...storage.formatMemory }; // shallow copy
  } catch (err) {
    handleError('FormatMemoryService.getAllFormats', err, 'Failed to retrieve formats');
    return {};
  }
}

/**
 * Clears all saved format preferences.
 */
export async function clearAllFormats(): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.formatMemory = {};
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('FormatMemoryService.clearAllFormats', err, 'Failed to clear formats');
    return false;
  }
}