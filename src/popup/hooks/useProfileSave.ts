/**
 * Hook for saving profile data immediately (no debounce).
 *
 * Shows toast notifications on success or failure.
 * Uses chrome.runtime.sendMessage for toasts.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { useCallback } from 'react';
import type { IProfileData } from '../../shared/types/profile';
import type { ExtensionMessage } from '../../shared/types/messages';
import { handleError } from '../../shared/utils/errorHandler';

interface UseProfileSaveProps {
  activeProfileId: string | null;
  formData: IProfileData;
  isCatLocked: boolean;
  updateProfile: (id: string, updates: Partial<Pick<IProfile, 'name' | 'data'>>) => Promise<void>;
}

// Minimal IProfile type needed for the updateProfile signature
interface IProfile {
  id: string;
  name: string;
  data: IProfileData;
  createdAt: number;
  updatedAt: number;
}

interface UseProfileSaveReturn {
  saveChanges: () => Promise<void>;
}

export function useProfileSave({
  activeProfileId,
  formData,
  isCatLocked,
  updateProfile,
}: UseProfileSaveProps): UseProfileSaveReturn {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const toastMessage: ExtensionMessage = {
      type: 'SHOW_TOAST',
      payload: { message, type },
    };
    chrome.runtime.sendMessage(toastMessage).catch(() => {
      // Popup might be closed, ignore
    });
  }, []);

  const saveChanges = useCallback(async (): Promise<void> => {
    if (!activeProfileId) {
      showToast('No active profile – please create or activate one first', 'error');
      return;
    }

    try {
      await updateProfile(activeProfileId, {
        data: {
          ...formData,
          isCatLocked,
        },
      });
      showToast('Profile saved successfully', 'success');
    } catch (err) {
      handleError('useProfileSave.saveChanges', err, 'Failed to save profile');
      showToast('Failed to save profile', 'error');
    }
  }, [activeProfileId, formData, isCatLocked, updateProfile, showToast]);

  return { saveChanges };
}