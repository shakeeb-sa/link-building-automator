import type { IStorageSchema, IProfile, IProfileData, IWatchtowerLists, IFormatMemory, IUnusedBacklinks } from '../types/storage';
import { STORAGE_KEY, DEFAULT_STORAGE } from '../types/storage';
import { DEFAULT_WATCHTOWER_LISTS, DEFAULT_FORMAT_MEMORY, DEFAULT_UNUSED_BACKLINKS } from '../constants/defaults';
import { logError } from '../utils/errorHandler';

/**
 * Reads the entire storage object.
 * If no data exists, returns a fresh default storage.
 */
export async function getStorage(): Promise<IStorageSchema> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        logError('StorageService', chrome.runtime.lastError);
        resolve(DEFAULT_STORAGE);
        return;
      }
      const stored = result[STORAGE_KEY] as IStorageSchema | undefined;
      if (!stored || typeof stored !== 'object') {
        resolve(DEFAULT_STORAGE);
        return;
      }
      resolve(stored);
    });
  });
}

/**
 * Writes the entire storage object, preserving versioning.
 */
export async function setStorage(data: IStorageSchema): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        logError('StorageService', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Migrates storage from older versions to the current schema (version 2).
 * This function is called during extension startup.
 */
export async function migrateStorage(): Promise<void> {
  const raw = await getStorage();
  let migrated = false;
  let current = raw;

  // Only migrate if version is missing or below 2
  if (current.version === undefined || current.version < 2) {
    // Ensure all required fields exist
    if (!current.watchtower) {
      current.watchtower = DEFAULT_WATCHTOWER_LISTS;
      migrated = true;
    }
    if (!current.formatMemory) {
      current.formatMemory = DEFAULT_FORMAT_MEMORY;
      migrated = true;
    }
    if (!current.unusedBacklinks) {
      current.unusedBacklinks = DEFAULT_UNUSED_BACKLINKS;
      migrated = true;
    }
    if (current.goldMineEnabled === undefined) {
      current.goldMineEnabled = false;
      migrated = true;
    }
    if (!current.goldMineHistory) {
      current.goldMineHistory = [];
      migrated = true;
    }
    if (current.masterSwitchEnabled === undefined) {
      current.masterSwitchEnabled = true;
      migrated = true;
    }
    // Set version to 2
    current.version = 2;
    migrated = true;
  }

  if (migrated) {
    await setStorage(current);
  }
}

/**
 * Watches for changes to the storage (using chrome.storage.onChanged).
 * @param callback – called with the new storage state whenever any part changes.
 */
export function watchStorage(callback: (storage: IStorageSchema) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      const newValue = changes[STORAGE_KEY].newValue as IStorageSchema | undefined;
      if (newValue) {
        callback(newValue);
      }
    }
  });
}

/**
 * Updates a specific profile by ID.
 * @returns true if profile was updated/created, false on error.
 */
export async function upsertProfile(profile: IProfile): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.profiles[profile.id] = profile;
    if (storage.activeProfileId === null) {
      storage.activeProfileId = profile.id;
    }
    await setStorage(storage);
    return true;
  } catch (err) {
    logError('StorageService', err);
    return false;
  }
}

/**
 * Deletes a profile by ID.
 * If the deleted profile was active, resets activeProfileId to the first remaining profile or null.
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    const storage = await getStorage();
    if (!storage.profiles[profileId]) {
      return false;
    }
    delete storage.profiles[profileId];
    if (storage.activeProfileId === profileId) {
      const remaining = Object.keys(storage.profiles);
      storage.activeProfileId = remaining.length > 0 ? remaining[0] : null;
    }
    await setStorage(storage);
    return true;
  } catch (err) {
    logError('StorageService', err);
    return false;
  }
}

/**
 * Sets the active profile ID.
 */
export async function setActiveProfile(profileId: string | null): Promise<boolean> {
  try {
    const storage = await getStorage();
    storage.activeProfileId = profileId;
    await setStorage(storage);
    return true;
  } catch (err) {
    logError('StorageService', err);
    return false;
  }
}

/**
 * Retrieves the flattened profile data for quick access by content scripts.
 * (This is computed on‑demand, not stored separately.)
 */
export async function getFlattenedProfileData(): Promise<IProfileData | null> {
  const storage = await getStorage();
  if (!storage.activeProfileId) {
    return null;
  }
  const active = storage.profiles[storage.activeProfileId];
  return active ? active.data : null;
}