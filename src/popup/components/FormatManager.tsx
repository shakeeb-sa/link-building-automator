import React, { useState } from 'react';
import { useFormatMemory } from '../hooks/useFormatMemory';
import type { FormatType } from '../../shared/types/formatMemory';

const FormatManager: React.FC = () => {
  const { formats, deleteFormat, clearAllFormats, isLoading } = useFormatMemory();
  const [search, setSearch] = useState('');

  const filteredEntries = Object.entries(formats).filter(([domain]) =>
    domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (domain: string) => {
    if (window.confirm(`Delete saved format for "${domain}"?`)) {
      await deleteFormat(domain);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete ALL saved formats? This action cannot be undone.')) {
      await clearAllFormats();
    }
  };

  if (isLoading) {
    return <div className="llb-text-center llb-py-8 llb-text-slate-400">Loading formats...</div>;
  }

  return (
    <div className="llb-space-y-4">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search domain..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="llb-w-full llb-px-3 llb-py-2 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
      />

      {/* Format list */}
      {filteredEntries.length === 0 ? (
        <div className="llb-text-center llb-py-8 llb-text-slate-400 llb-text-sm">
          {Object.keys(formats).length === 0 ? 'No saved formats.' : 'No matching domains.'}
        </div>
      ) : (
        <div className="llb-space-y-2 llb-max-h-80 llb-overflow-y-auto llb-custom-scrollbar">
          {filteredEntries.map(([domain, format]) => (
            <div
              key={domain}
              className="llb-flex llb-items-center llb-justify-between llb-p-3 llb-bg-slate-50 llb-rounded-lg llb-border llb-border-slate-100"
            >
              <div className="llb-flex-1 llb-min-w-0">
                <div className="llb-font-medium llb-text-navy-800 llb-truncate">{domain}</div>
                <div className="llb-text-xs llb-text-peach-500 llb-font-bold llb-uppercase llb-tracking-wide">{format}</div>
              </div>
              <button
                onClick={() => handleDelete(domain)}
                className="llb-ml-2 llb-px-3 llb-py-1 llb-bg-red-100 llb-text-red-600 llb-text-xs llb-font-black llb-rounded llb-hover:llb-bg-red-200 llb-transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clear all button */}
      {Object.keys(formats).length > 0 && (
        <button
          onClick={handleClearAll}
          className="llb-w-full llb-px-4 llb-py-2 llb-bg-red-600 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-red-700 llb-transition-colors"
        >
          Clear All Formats
        </button>
      )}
    </div>
  );
};

export default FormatManager;