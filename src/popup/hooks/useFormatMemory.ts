import { useState, useEffect, useCallback } from 'react';
import type { IFormatMemory, FormatType } from '../../shared/types/formatMemory';
import { handleError } from '../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../shared/types/messages';

interface UseFormatMemoryReturn {
  formats: IFormatMemory;
  isLoading: boolean;
  deleteFormat: (domain: string) => Promise<void>;
  clearAllFormats: () => Promise<void>;
  refreshFormats: () => Promise<void>;
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

export function useFormatMemory(): UseFormatMemoryReturn {
  const [formats, setFormats] = useState<IFormatMemory>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFormats = useCallback(async () => {
    try {
      const response = await sendMessage<{ formats: IFormatMemory }>({
        type: 'GET_ALL_FORMATS' as any, // TODO: add to messages.ts
      });
      setFormats(response.formats);
    } catch (err) {
      handleError('useFormatMemory.fetchFormats', err, 'Failed to load formats');
      setFormats({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormats();
  }, [fetchFormats]);

  const deleteFormat = useCallback(async (domain: string) => {
    try {
      await sendMessage<{ success: boolean }>({
        type: 'DELETE_FORMAT' as any,
        payload: { domain },
      });
      setFormats((prev) => {
        const newFormats = { ...prev };
        delete newFormats[domain];
        return newFormats;
      });
    } catch (err) {
      handleError('useFormatMemory.deleteFormat', err, 'Failed to delete format');
      throw err;
    }
  }, []);

  const clearAllFormats = useCallback(async () => {
    try {
      await sendMessage<{ success: boolean }>({
        type: 'CLEAR_ALL_FORMATS' as any,
      });
      setFormats({});
    } catch (err) {
      handleError('useFormatMemory.clearAllFormats', err, 'Failed to clear all formats');
      throw err;
    }
  }, []);

  const refreshFormats = useCallback(async () => {
    setIsLoading(true);
    await fetchFormats();
  }, [fetchFormats]);

  return {
    formats,
    isLoading,
    deleteFormat,
    clearAllFormats,
    refreshFormats,
  };
}