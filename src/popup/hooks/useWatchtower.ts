import { useState, useEffect, useCallback } from 'react';
import { parseExcelToDomains } from '../../shared/utils/excel';
import { handleError } from '../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../shared/types/messages';

interface UseWatchtowerReturn {
  primaryDomains: string[];
  secondaryDomains: string[];
  pastedDomains: string[];
  isLoading: boolean;
  addPrimaryFromFile: (file: File) => Promise<void>;
  addSecondaryFromFile: (file: File) => Promise<void>;
  setPastedDomains: (domains: string[]) => Promise<void>;
  clearPrimary: () => Promise<void>;
  clearSecondary: () => Promise<void>;
  clearPasted: () => Promise<void>;
  clearAll: () => Promise<void>;
}

// Helper to send a message and wait for response
async function sendMessage<T>(message: ExtensionMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response as T);
      }
    });
  });
}

export function useWatchtower(): UseWatchtowerReturn {
  const [primaryDomains, setPrimaryDomains] = useState<string[]>([]);
  const [secondaryDomains, setSecondaryDomains] = useState<string[]>([]);
  const [pastedDomains, setPastedDomainsState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all lists from storage via background
  const fetchLists = useCallback(async () => {
    try {
      const response = await sendMessage<{
        primary: string[];
        secondary: string[];
        pasted: string[];
      }>({
        type: 'GET_WATCHTOWER_LISTS' as any, // TODO: add to messages.ts
      });
      setPrimaryDomains(response.primary);
      setSecondaryDomains(response.secondary);
      setPastedDomainsState(response.pasted);
    } catch (err) {
      handleError('useWatchtower.fetchLists', err, 'Failed to load watchtower lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const addPrimaryFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const domains = await parseExcelToDomains(file);
      if (domains.length === 0) return;
      await sendMessage<{ success: boolean }>({
        type: 'ADD_PRIMARY_DOMAINS' as any,
        payload: { domains },
      });
      setPrimaryDomains((prev) => [...new Set([...prev, ...domains])]);
    } catch (err) {
      handleError('useWatchtower.addPrimaryFromFile', err, 'Failed to add primary domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSecondaryFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const domains = await parseExcelToDomains(file);
      if (domains.length === 0) return;
      await sendMessage<{ success: boolean }>({
        type: 'ADD_SECONDARY_DOMAINS' as any,
        payload: { domains },
      });
      setSecondaryDomains((prev) => [...new Set([...prev, ...domains])]);
    } catch (err) {
      handleError('useWatchtower.addSecondaryFromFile', err, 'Failed to add secondary domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPastedDomains = useCallback(async (domains: string[]) => {
    setIsLoading(true);
    try {
      await sendMessage<{ success: boolean }>({
        type: 'SET_PASTED_DOMAINS' as any,
        payload: { domains },
      });
      setPastedDomainsState(domains);
    } catch (err) {
      handleError('useWatchtower.setPastedDomains', err, 'Failed to set pasted domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPrimary = useCallback(async () => {
    setIsLoading(true);
    try {
      await sendMessage<{ success: boolean }>({
        type: 'CLEAR_PRIMARY_DOMAINS' as any,
      });
      setPrimaryDomains([]);
    } catch (err) {
      handleError('useWatchtower.clearPrimary', err, 'Failed to clear primary domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSecondary = useCallback(async () => {
    setIsLoading(true);
    try {
      await sendMessage<{ success: boolean }>({
        type: 'CLEAR_SECONDARY_DOMAINS' as any,
      });
      setSecondaryDomains([]);
    } catch (err) {
      handleError('useWatchtower.clearSecondary', err, 'Failed to clear secondary domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPasted = useCallback(async () => {
    setIsLoading(true);
    try {
      await sendMessage<{ success: boolean }>({
        type: 'CLEAR_PASTED_DOMAINS' as any,
      });
      setPastedDomainsState([]);
    } catch (err) {
      handleError('useWatchtower.clearPasted', err, 'Failed to clear pasted domains');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        sendMessage({ type: 'CLEAR_PRIMARY_DOMAINS' as any }),
        sendMessage({ type: 'CLEAR_SECONDARY_DOMAINS' as any }),
        sendMessage({ type: 'CLEAR_PASTED_DOMAINS' as any }),
      ]);
      setPrimaryDomains([]);
      setSecondaryDomains([]);
      setPastedDomainsState([]);
    } catch (err) {
      handleError('useWatchtower.clearAll', err, 'Failed to clear all watchtower lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    primaryDomains,
    secondaryDomains,
    pastedDomains,
    isLoading,
    addPrimaryFromFile,
    addSecondaryFromFile,
    setPastedDomains,
    clearPrimary,
    clearSecondary,
    clearPasted,
    clearAll,
  };
}