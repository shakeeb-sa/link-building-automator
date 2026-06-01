import type { IProfile, IProfileData } from '../types/profile';
import type { IStorageSchema } from '../types/storage';
import { getStorage, setStorage, upsertProfile as storageUpsert, deleteProfile as storageDelete, setActiveProfile as storageSetActive } from './storage';
import { DEFAULT_PROFILE_DATA, DEFAULT_PROFILE_TEMPLATE } from '../constants/defaults';
import { handleError } from '../utils/errorHandler';

/**
 * Generates a UUID v4 (simplified for the extension).
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a new profile.
 * @param name – display name of the profile
 * @param initialData – optional initial form data (defaults to empty)
 * @returns the newly created profile object
 */
export async function createProfile(name: string, initialData?: Partial<IProfileData>): Promise<IProfile> {
  try {
    const storage = await getStorage();
    const now = Date.now();
    const newProfile: IProfile = {
      id: generateId(),
      name: name.trim(),
      data: {
        ...DEFAULT_PROFILE_DATA,
        ...initialData,
      },
      createdAt: now,
      updatedAt: now,
    };
    storage.profiles[newProfile.id] = newProfile;
    if (storage.activeProfileId === null) {
      storage.activeProfileId = newProfile.id;
    }
    await setStorage(storage);
    return newProfile;
  } catch (err) {
    throw new Error(handleError('ProfileService.createProfile', err, 'Failed to create profile'));
  }
}

/**
 * Updates an existing profile.
 * @param profileId – the ID of the profile to update
 * @param updates – partial profile object (name or data fields)
 * @returns true if updated, false if profile not found
 */
export async function updateProfile(profileId: string, updates: Partial<Pick<IProfile, 'name' | 'data'>>): Promise<boolean> {
  try {
    const storage = await getStorage();
    const existing = storage.profiles[profileId];
    if (!existing) {
      return false;
    }
    if (updates.name !== undefined) {
      existing.name = updates.name.trim();
    }
    if (updates.data !== undefined) {
      existing.data = {
        ...existing.data,
        ...updates.data,
      };
    }
    existing.updatedAt = Date.now();
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('ProfileService.updateProfile', err, 'Failed to update profile');
    return false;
  }
}

/**
 * Deletes a profile by ID.
 * If the deleted profile was active, the active profile is set to the first remaining or null.
 * @param profileId – the ID of the profile to delete
 * @returns true if deleted, false if profile not found
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    const storage = await getStorage();
    if (!storage.profiles[profileId]) {
      return false;
    }
    delete storage.profiles[profileId];
    if (storage.activeProfileId === profileId) {
      const remainingIds = Object.keys(storage.profiles);
      storage.activeProfileId = remainingIds.length > 0 ? remainingIds[0] : null;
    }
    await setStorage(storage);
    return true;
  } catch (err) {
    handleError('ProfileService.deleteProfile', err, 'Failed to delete profile');
    return false;
  }
}

/**
 * Retrieves a single profile by ID.
 * @param profileId – the profile ID
 * @returns the profile object or null if not found
 */
export async function getProfile(profileId: string): Promise<IProfile | null> {
  try {
    const storage = await getStorage();
    return storage.profiles[profileId] || null;
  } catch (err) {
    handleError('ProfileService.getProfile', err, 'Failed to retrieve profile');
    return null;
  }
}

/**
 * Returns all profiles as an array (sorted by name or creation date? Here sorted by name).
 */
export async function getAllProfiles(): Promise<IProfile[]> {
  try {
    const storage = await getStorage();
    return Object.values(storage.profiles).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    handleError('ProfileService.getAllProfiles', err, 'Failed to retrieve profiles');
    return [];
  }
}

/**
 * Gets the currently active profile.
 * @returns the active profile or null if none set
 */
export async function getActiveProfile(): Promise<IProfile | null> {
  try {
    const storage = await getStorage();
    if (!storage.activeProfileId) {
      return null;
    }
    return storage.profiles[storage.activeProfileId] || null;
  } catch (err) {
    handleError('ProfileService.getActiveProfile', err, 'Failed to retrieve active profile');
    return null;
  }
}

/**
 * Sets the active profile by ID.
 * @param profileId – the profile ID to set as active, or null to clear
 * @returns true on success, false on error (e.g., profileId does not exist)
 */
export async function setActiveProfile(profileId: string | null): Promise<boolean> {
  try {
    if (profileId !== null) {
      const storage = await getStorage();
      if (!storage.profiles[profileId]) {
        return false;
      }
    }
    return await storageSetActive(profileId);
  } catch (err) {
    handleError('ProfileService.setActiveProfile', err, 'Failed to set active profile');
    return false;
  }
}

/**
 * Returns the flattened data of the active profile (for content scripts).
 * @returns the profile data object or null if no active profile
 */
export async function getFlattenedProfileData(): Promise<IProfileData | null> {
  try {
    const active = await getActiveProfile();
    return active ? active.data : null;
  } catch (err) {
    handleError('ProfileService.getFlattenedProfileData', err, 'Failed to retrieve profile data');
    return null;
  }
}