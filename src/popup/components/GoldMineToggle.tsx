import React, { useState, useEffect } from 'react';
import { handleError } from '../../shared/utils/errorHandler';

const GOLD_MINE_STORAGE_KEY = 'goldMineEnabled';

const GoldMineToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get(GOLD_MINE_STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        handleError('GoldMineToggle.load', chrome.runtime.lastError, 'Failed to load Gold Mine state');
      } else {
        setIsEnabled(result[GOLD_MINE_STORAGE_KEY] === true);
      }
      setIsLoading(false);
    });
  }, []);

  // Notify all content scripts about the toggle
  const notifyContentScripts = (enabled: boolean) => {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_GOLD_MINE',
            enabled,
          }).catch(() => {
            // Ignore errors (e.g., no content script on the page)
          });
        }
      }
    });
  };

  const handleToggle = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    // Save to storage
    chrome.storage.local.set({ [GOLD_MINE_STORAGE_KEY]: newState }, () => {
      if (chrome.runtime.lastError) {
        handleError('GoldMineToggle.save', chrome.runtime.lastError, 'Failed to save Gold Mine state');
        // Revert UI on error
        setIsEnabled(isEnabled);
        return;
      }
      notifyContentScripts(newState);
    });
  };

  if (isLoading) {
    return <div className="llb-text-center llb-py-4 llb-text-slate-400">Loading...</div>;
  }

  return (
    <div className="llb-flex llb-items-center llb-justify-between llb-p-3 llb-bg-slate-50 llb-rounded-lg llb-border llb-border-slate-200">
      <div>
        <div className="llb-font-medium llb-text-navy-800">🏆 Gold Mine Shuffle</div>
        <div className="llb-text-xs llb-text-slate-500">
          {isEnabled ? 'Enabled – shows floating button on pages' : 'Disabled – button hidden'}
        </div>
      </div>
      <button
        onClick={handleToggle}
        className={`llb-relative llb-w-12 llb-h-6 llb-rounded-full llb-transition-colors llb-duration-200 llb-focus:llb-outline-none llb-focus:llb-ring-2 llb-focus:llb-ring-peach-500
          ${isEnabled ? 'llb-bg-peach-500' : 'llb-bg-slate-300'}`}
        aria-label="Toggle Gold Mine"
      >
        <span
          className={`llb-absolute llb-top-0.5 llb-left-0.5 llb-w-5 llb-h-5 llb-bg-white llb-rounded-full llb-shadow llb-transform llb-transition-transform llb-duration-200
            ${isEnabled ? 'llb-translate-x-6' : 'llb-translate-x-0'}`}
        />
      </button>
    </div>
  );
};

export default GoldMineToggle;