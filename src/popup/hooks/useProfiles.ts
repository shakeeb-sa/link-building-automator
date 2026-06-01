import { useState, useEffect, useCallback } from 'react';
import type { IProfile } from '../../shared/types/profile';
import type { ExtensionMessage } from '../../shared/types/messages';
import { handleError } from '../../shared/utils/errorHandler';

interface UseProfilesReturn {
  profiles: IProfile[];
  activeProfileId: string | null;
  isLoading: boolean;
  createProfile: (name: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Pick<IProfile, 'name' | 'data'>>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string | null) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to send a message and wait for response
  const sendMessage = useCallback(<T>(message: ExtensionMessage): Promise<T> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response as T);
        }
      });
    });
  }, []);

  // Fetch all profiles (requires a new message type: GET_ALL_PROFILES)
  // For now, we simulate by fetching from storage directly? Not possible in popup.
  // We'll assume background will handle a GET_ALL_PROFILES message.
  // We'll define it as a custom message for now.
  const fetchProfiles = useCallback(async () => {
    try {
      const response = await sendMessage<{ profiles: IProfile[] }>({
        type: 'GET_ALL_PROFILES' as any, // TODO: add to messages.ts
      });
      setProfiles(response.profiles);
    } catch (err) {
      handleError('useProfiles.fetchProfiles', err, 'Failed to load profiles');
      setProfiles([]);
    }
  }, [sendMessage]);

  const fetchActiveProfile = useCallback(async () => {
    try {
      const response = await sendMessage<{ profile: IProfile | null }>({
        type: 'GET_ACTIVE_PROFILE',
      });
      setActiveProfileId(response.profile?.id ?? null);
    } catch (err) {
      handleError('useProfiles.fetchActiveProfile', err, 'Failed to load active profile');
      setActiveProfileId(null);
    }
  }, [sendMessage]);

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchProfiles(), fetchActiveProfile()]);
    setIsLoading(false);
  }, [fetchProfiles, fetchActiveProfile]);

  // Initial load
  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const createProfile = useCallback(async (name: string) => {
    try {
      const response = await sendMessage<{ profile: IProfile }>({
        type: 'CREATE_PROFILE' as any,
        payload: { name },
      });
      setProfiles((prev) => [...prev, response.profile]);
      setActiveProfileId(response.profile.id);
    } catch (err) {
      handleError('useProfiles.createProfile', err, 'Failed to create profile');
      throw err;
    }
  }, [sendMessage]);

  const updateProfile = useCallback(async (id: string, updates: Partial<Pick<IProfile, 'name' | 'data'>>) => {
    try {
      await sendMessage<{ success: boolean }>({
        type: 'UPDATE_PROFILE' as any,
        payload: { id, updates },
      });
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
      );
    } catch (err) {
      handleError('useProfiles.updateProfile', err, 'Failed to update profile');
      throw err;
    }
  }, [sendMessage]);

  const deleteProfile = useCallback(async (id: string) => {
    try {
      await sendMessage<{ success: boolean }>({
        type: 'DELETE_PROFILE' as any,
        payload: { id },
      });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (activeProfileId === id) {
        setActiveProfileId(null);
      }
    } catch (err) {
      handleError('useProfiles.deleteProfile', err, 'Failed to delete profile');
      throw err;
    }
  }, [sendMessage, activeProfileId]);

  const setActiveProfile = useCallback(async (id: string | null) => {
    try {
      await sendMessage<{ success: boolean }>({
        type: 'SET_ACTIVE_PROFILE',
        payload: { profileId: id ?? '' },
      });
      setActiveProfileId(id);
    } catch (err) {
      handleError('useProfiles.setActiveProfile', err, 'Failed to set active profile');
      throw err;
    }
  }, [sendMessage]);

  return {
    profiles,
    activeProfileId,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    refreshProfiles,
  };
}