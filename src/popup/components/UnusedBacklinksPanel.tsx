import React, { useState, useEffect } from 'react';
import { useUnusedBacklinks } from '../hooks/useUnusedBacklinks';

const UnusedBacklinksPanel: React.FC = () => {
  const {
    categorized,
    batch,
    isLoading,
    shuffle,
    openAll,
    getAvailableSheets,
    setActiveSheets,
  } = useUnusedBacklinks();

  const [activeSheets, setActiveSheetsState] = useState<string[]>([]);

  // Initialize active sheets with all available sheets
  useEffect(() => {
    const sheets = getAvailableSheets();
    setActiveSheetsState(sheets);
    setActiveSheets(sheets);
  }, [categorized, getAvailableSheets, setActiveSheets]);

  const handleSheetToggle = (sheet: string) => {
    const newActive = activeSheets.includes(sheet)
      ? activeSheets.filter((s) => s !== sheet)
      : [...activeSheets, sheet];
    setActiveSheetsState(newActive);
    setActiveSheets(newActive);
  };

  const handleSelectAll = () => {
    const allSheets = getAvailableSheets();
    setActiveSheetsState(allSheets);
    setActiveSheets(allSheets);
  };

  const handleClearAll = () => {
    setActiveSheetsState([]);
    setActiveSheets([]);
  };

  const handleShuffle = () => {
    if (activeSheets.length === 0) return;
    shuffle();
  };

  const handleOpenAll = () => {
    if (!batch || batch.urls.length === 0) return;
    openAll();
  };

  const sheets = getAvailableSheets();

  return (
    <div className="llb-space-y-4">
      {/* Sheet selection */}
      <div>
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-2">
          <h4 className="llb-text-xs llb-font-black llb-uppercase llb-text-navy-800">Categories</h4>
          <div className="llb-flex llb-gap-2">
            <button
              onClick={handleSelectAll}
              className="llb-text-[10px] llb-font-black llb-uppercase llb-text-peach-500 llb-hover:llb-underline"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="llb-text-[10px] llb-font-black llb-uppercase llb-text-slate-400 llb-hover:llb-text-red-500"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="llb-flex llb-flex-wrap llb-gap-2">
          {sheets.map((sheet) => (
            <label key={sheet} className="llb-flex llb-items-center llb-gap-1 llb-text-xs">
              <input
                type="checkbox"
                checked={activeSheets.includes(sheet)}
                onChange={() => handleSheetToggle(sheet)}
                className="llb-w-3 llb-h-3"
              />
              <span>{sheet}</span>
              <span className="llb-text-slate-400">({categorized[sheet]?.length || 0})</span>
            </label>
          ))}
        </div>
        {sheets.length === 0 && (
          <div className="llb-text-center llb-text-slate-400 llb-text-sm llb-py-4">
            No backlink lists uploaded. Use the "Backlinks" tab in the popup to upload.
          </div>
        )}
      </div>

      {/* Batch display */}
      {batch && batch.urls.length > 0 && (
        <div className="llb-border llb-border-slate-200 llb-rounded-lg llb-p-3 llb-bg-slate-50">
          <div className="llb-flex llb-justify-between llb-items-center llb-mb-2">
            <h4 className="llb-text-xs llb-font-black llb-uppercase llb-text-navy-800">Fresh Batch</h4>
            <span className="llb-text-xs llb-text-slate-500">{batch.totalRemaining} remaining</span>
          </div>
          <ul className="llb-space-y-1 llb-max-h-48 llb-overflow-y-auto llb-custom-scrollbar">
            {batch.urls.map((url, idx) => (
              <li key={idx} className="llb-text-xs llb-truncate">
                <a href={url} target="_blank" rel="noopener noreferrer" className="llb-text-blue-600 llb-hover:llb-underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="llb-flex llb-gap-3">
        <button
          onClick={handleShuffle}
          disabled={activeSheets.length === 0 || isLoading}
          className="llb-flex-1 llb-px-4 llb-py-2 llb-bg-navy-800 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-navy-900 llb-disabled:llb-opacity-50 llb-transition-colors"
        >
          {isLoading ? 'Loading...' : 'Shuffle'}
        </button>
        <button
          onClick={handleOpenAll}
          disabled={!batch || batch.urls.length === 0 || isLoading}
          className="llb-flex-1 llb-px-4 llb-py-2 llb-bg-peach-500 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-peach-600 llb-disabled:llb-opacity-50 llb-transition-colors"
        >
          Open All ({batch?.urls.length || 0})
        </button>
      </div>

      {activeSheets.length === 0 && sheets.length > 0 && (
        <div className="llb-text-center llb-text-amber-600 llb-text-xs">
          Select at least one category to shuffle.
        </div>
      )}
    </div>
  );
};

export default UnusedBacklinksPanel;