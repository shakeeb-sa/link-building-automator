/**
 * useProfileForm Hook (Refactored)
 *
 * Composes three focused hooks:
 * - useProfileLoad: loads data from storage
 * - useProfileFormState: manages local editable state
 * - useProfileSave: saves changes immediately
 *
 * Returns the same public API as before, but with immediate saving.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { useEffect } from 'react';
import { useProfiles } from './useProfiles';
import { useProfileLoad } from './useProfileLoad';
import { useProfileFormState } from './useProfileFormState';
import { useProfileSave } from './useProfileSave';

export interface UseProfileFormReturn {
  formData: ReturnType<typeof useProfileFormState>['formData'];
  isCatLocked: ReturnType<typeof useProfileFormState>['isCatLocked'];
  isLoading: boolean;
  activeProfileId: string | null;
  updateField: ReturnType<typeof useProfileFormState>['updateField'];
  toggleCategoryLock: ReturnType<typeof useProfileFormState>['toggleCategoryLock'];
  refresh: () => Promise<void>;
}

export function useProfileForm(): UseProfileFormReturn {
  const { activeProfileId, updateProfile } = useProfiles();

  // 1. Load data
  const { formData: loadedFormData, isCatLocked: loadedIsCatLocked, isLoading, refresh } =
    useProfileLoad(activeProfileId);

  // 2. Manage local state
  const {
    formData,
    isCatLocked,
    updateField,
    toggleCategoryLock,
    syncExternalData,
  } = useProfileFormState(loadedFormData, loadedIsCatLocked);

  // 3. Save immediately when local state changes
  const { saveChanges } = useProfileSave({
    activeProfileId,
    formData,
    isCatLocked,
    updateProfile,
  });

  // Sync external data (from load) into local state
  useEffect(() => {
    syncExternalData(loadedFormData, loadedIsCatLocked);
  }, [loadedFormData, loadedIsCatLocked, syncExternalData]);

  // Save whenever local state changes (immediate, no debounce)
  useEffect(() => {
    // Avoid saving on initial mount before data is loaded
    if (!isLoading && activeProfileId) {
      saveChanges();
    }
  }, [formData, isCatLocked, isLoading, activeProfileId, saveChanges]);

  return {
    formData,
    isCatLocked,
    isLoading,
    activeProfileId,
    updateField,
    toggleCategoryLock,
    refresh,
  };
}