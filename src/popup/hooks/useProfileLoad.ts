/**
 * Hook for loading profile data from storage.
 *
 * Manages loading state and provides a refresh function.
 * Does not handle saving – that is the responsibility of useProfileSave.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { useState, useEffect, useCallback } from 'react';
import type { IProfileData } from '../../shared/types/profile';
import { getFlattenedProfileData } from '../../shared/services/profileService';
import { handleError } from '../../shared/utils/errorHandler';

const DEFAULT_FORM_DATA: IProfileData = {
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
};

interface UseProfileLoadReturn {
  formData: IProfileData;
  isCatLocked: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useProfileLoad(activeProfileId: string | null): UseProfileLoadReturn {
  const [formData, setFormData] = useState<IProfileData>(DEFAULT_FORM_DATA);
  const [isCatLocked, setIsCatLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!activeProfileId) {
        setFormData(DEFAULT_FORM_DATA);
        setIsCatLocked(false);
        return;
      }
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
      } else {
        setFormData(DEFAULT_FORM_DATA);
        setIsCatLocked(false);
      }
    } catch (err) {
      handleError('useProfileLoad.loadProfileData', err, 'Failed to load profile data');
      setFormData(DEFAULT_FORM_DATA);
      setIsCatLocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId]);

  // Load when active profile changes
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const refresh = useCallback(async () => {
    await loadProfileData();
  }, [loadProfileData]);

  return {
    formData,
    isCatLocked,
    isLoading,
    refresh,
  };
}