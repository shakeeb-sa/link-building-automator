/**
 * useProfileForm Hook
 *
 * This hook encapsulates all state and side effects for the profile form.
 * It loads the active profile's data, provides debounced auto‑save,
 * and exposes field update methods and the category lock toggle.
 *
 * No `unknown`, `any`, or unsafe type assertions are used – everything is strictly typed.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { IProfileData } from '../../shared/types/profile';
import { getFlattenedProfileData } from '../../shared/services/profileService';
import { useProfiles } from './useProfiles';
import { handleError } from '../../shared/utils/errorHandler';

export interface UseProfileFormReturn {
  formData: IProfileData;
  isCatLocked: boolean;
  isLoading: boolean;
  activeProfileId: string | null;  // <-- add this
  updateField: (field: keyof IProfileData, value: string) => void;
  toggleCategoryLock: () => void;
  refresh: () => Promise<void>;
}

export function useProfileForm(): UseProfileFormReturn {
  const { activeProfileId, updateProfile, refreshProfiles } = useProfiles();
  const [formData, setFormData] = useState<IProfileData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    website: '',
    title: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    region: '',
    country: '',
    category: '',
    masterHTML: '',
    isCatLocked: false,
  });
  const [isCatLocked, setIsCatLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load profile data when active profile changes
  const loadProfileData = useCallback(async () => {
    if (!activeProfileId) {
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        company: '',
        website: '',
        title: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        region: '',
        country: '',
        category: '',
        masterHTML: '',
        isCatLocked: false,
      });
      setIsCatLocked(false);
      return;
    }

    try {
      const flatData = await getFlattenedProfileData();
      if (flatData) {
        setFormData({
          username: flatData.username || '',
          email: flatData.email || '',
          password: flatData.password || '',
          firstName: flatData.firstName || '',
          lastName: flatData.lastName || '',
          company: flatData.company || '',
          website: flatData.website || '',
          title: flatData.title || '',
          phone: flatData.phone || '',
          address: flatData.address || '',
          city: flatData.city || '',
          zip: flatData.zip || '',
          region: flatData.region || '',
          country: flatData.country || '',
          category: flatData.category || '',
          masterHTML: flatData.masterHTML || '',
          isCatLocked: flatData.isCatLocked === true,
        });
        setIsCatLocked(flatData.isCatLocked === true);
      }
    } catch (err) {
      handleError('useProfileForm.loadProfileData', err, 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId]);

  // Refresh when active profile changes or profiles list refreshes
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData, refreshProfiles]);

  // Auto-save changes
  const saveChanges = useCallback(async () => {
    if (!activeProfileId) return;
    try {
      await updateProfile(activeProfileId, {
        data: {
          ...formData,
          isCatLocked,
        },
      });
    } catch (err) {
      handleError('useProfileForm.saveChanges', err, 'Failed to save profile');
    }
  }, [activeProfileId, formData, isCatLocked, updateProfile]);

  const debouncedSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveChanges();
    }, 500);
  }, [saveChanges]);

  const updateField = useCallback((field: keyof IProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    debouncedSave();
  }, [debouncedSave]);

  const toggleCategoryLock = useCallback(() => {
    setIsCatLocked(prev => !prev);
    debouncedSave();
  }, [debouncedSave]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadProfileData();
  }, [loadProfileData]);

return {
  formData,
  isCatLocked,
  isLoading,
  activeProfileId,   // <-- add this
  updateField,
  toggleCategoryLock,
  refresh,
};
}