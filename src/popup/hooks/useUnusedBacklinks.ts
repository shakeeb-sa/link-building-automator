import { useState, useEffect, useCallback } from 'react';
import type { IUnusedBacklinksCategorized } from '../../shared/types/unusedBacklinks';
import type { BacklinkBatch } from '../../shared/types/unusedBacklinks';
import { handleError } from '../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../shared/types/messages';

interface UseUnusedBacklinksReturn {
  categorized: IUnusedBacklinksCategorized;
  batch: BacklinkBatch | null;
  isLoading: boolean;
  shuffle: () => Promise<void>;
  openAll: () => void;
  setActiveSheets: (sheets: string[]) => Promise<void>;
  getAvailableSheets: () => string[];
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

export function useUnusedBacklinks(): UseUnusedBacklinksReturn {
  const [categorized, setCategorized] = useState<IUnusedBacklinksCategorized>({});
  const [batch, setBatch] = useState<BacklinkBatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSheets, setActiveSheetsState] = useState<string[]>([]);

  // Fetch categorized data and initial batch
  const fetchData = useCallback(async () => {
    try {
      const response = await sendMessage<{
        categorized: IUnusedBacklinksCategorized;
        batch: BacklinkBatch;
      }>({
        type: 'GET_UNUSED_BACKLINKS' as any, // TODO: add to messages.ts
      });
      setCategorized(response.categorized || {});
      setBatch(response.batch);
    } catch (err) {
      handleError('useUnusedBacklinks.fetchData', err, 'Failed to load unused backlinks');
      setCategorized({});
      setBatch(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const shuffle = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sendMessage<{ batch: BacklinkBatch }>({
        type: 'SHUFFLE_BACKLINKS' as any,
        payload: { sheetNames: activeSheets },
      });
      setBatch(response.batch);
    } catch (err) {
      handleError('useUnusedBacklinks.shuffle', err, 'Failed to shuffle backlinks');
    } finally {
      setIsLoading(false);
    }
  }, [activeSheets]);

  const setActiveSheets = useCallback(async (sheets: string[]) => {
    setActiveSheetsState(sheets);
    // Automatically shuffle after changing sheets
    setIsLoading(true);
    try {
      const response = await sendMessage<{ batch: BacklinkBatch }>({
        type: 'SHUFFLE_BACKLINKS' as any,
        payload: { sheetNames: sheets },
      });
      setBatch(response.batch);
    } catch (err) {
      handleError('useUnusedBacklinks.setActiveSheets', err, 'Failed to update active sheets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAll = useCallback(() => {
    if (!batch || batch.urls.length === 0) return;
    for (const url of batch.urls) {
      chrome.tabs.create({ url, active: false });
    }
  }, [batch]);

  const getAvailableSheets = useCallback(() => {
    // Safety check: ensure categorized is an object before calling Object.keys
    if (!categorized || typeof categorized !== 'object') {
      return [];
    }
    return Object.keys(categorized);
  }, [categorized]);

  return {
    categorized: categorized || {},
    batch,
    isLoading,
    shuffle,
    openAll,
    setActiveSheets,
    getAvailableSheets,
  };
}