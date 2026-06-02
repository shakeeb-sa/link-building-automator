/**
 * Hook for managing the local editable state of the profile form.
 *
 * Provides update functions and a way to sync external data.
 * Does not load or save – only manages the current UI state.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { useState, useCallback } from 'react';
import type { IProfileData } from '../../shared/types/profile';

export interface UseProfileFormStateReturn {
  formData: IProfileData;
  isCatLocked: boolean;
  updateField: (field: keyof IProfileData, value: string) => void;
  toggleCategoryLock: () => void;
  syncExternalData: (newFormData: IProfileData, newIsCatLocked: boolean) => void;
}

export function useProfileFormState(
  initialFormData: IProfileData,
  initialIsCatLocked: boolean
): UseProfileFormStateReturn {
  const [formData, setFormData] = useState<IProfileData>(initialFormData);
  const [isCatLocked, setIsCatLocked] = useState<boolean>(initialIsCatLocked);

  const updateField = useCallback((field: keyof IProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleCategoryLock = useCallback(() => {
    setIsCatLocked((prev) => !prev);
  }, []);

  const syncExternalData = useCallback((newFormData: IProfileData, newIsCatLocked: boolean) => {
    setFormData(newFormData);
    setIsCatLocked(newIsCatLocked);
  }, []);

  return {
    formData,
    isCatLocked,
    updateField,
    toggleCategoryLock,
    syncExternalData,
  };
}