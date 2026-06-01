import React, { useState } from 'react';
import { useWatchtower } from '../hooks/useWatchtower';

const WatchtowerPanel: React.FC = () => {
  const {
    primaryDomains,
    secondaryDomains,
    pastedDomains,
    addPrimaryFromFile,
    addSecondaryFromFile,
    setPastedDomains,
    clearPrimary,
    clearSecondary,
    clearPasted,
    clearAll,
    isLoading,
  } = useWatchtower();

  const [pastedText, setPastedText] = useState(() => pastedDomains.join('\n'));

  const handlePastedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    const domains = text.split(/\r?\n/).filter((d) => d.trim().length > 0);
    setPastedDomains(domains);
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addPrimaryFromFile(file);
      e.target.value = '';
    }
  };

  const handleSecondaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addSecondaryFromFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="llb-space-y-5">
      {/* Primary DB */}
      <div className="llb-border llb-border-slate-200 llb-rounded-lg llb-p-3">
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-2">
          <h4 className="llb-text-xs llb-font-black llb-uppercase llb-text-navy-800">Primary DB</h4>
          <span className="llb-text-xs llb-font-bold llb-text-slate-500">{primaryDomains.length} domains</span>
        </div>
        <div className="llb-flex llb-gap-2">
          <label className="llb-flex-1 llb-text-center llb-px-3 llb-py-2 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-medium llb-cursor-pointer llb-hover:llb-bg-slate-200">
            Upload Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handlePrimaryUpload} className="llb-hidden" disabled={isLoading} />
          </label>
          <button
            onClick={clearPrimary}
            disabled={primaryDomains.length === 0 || isLoading}
            className="llb-px-3 llb-py-2 llb-bg-red-100 llb-text-red-600 llb-rounded llb-text-xs llb-font-black llb-uppercase llb-hover:llb-bg-red-200 llb-disabled:llb-opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Secondary DB */}
      <div className="llb-border llb-border-slate-200 llb-rounded-lg llb-p-3">
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-2">
          <h4 className="llb-text-xs llb-font-black llb-uppercase llb-text-navy-800">Secondary DB</h4>
          <span className="llb-text-xs llb-font-bold llb-text-slate-500">{secondaryDomains.length} domains</span>
        </div>
        <div className="llb-flex llb-gap-2">
          <label className="llb-flex-1 llb-text-center llb-px-3 llb-py-2 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-medium llb-cursor-pointer llb-hover:llb-bg-slate-200">
            Upload Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleSecondaryUpload} className="llb-hidden" disabled={isLoading} />
          </label>
          <button
            onClick={clearSecondary}
            disabled={secondaryDomains.length === 0 || isLoading}
            className="llb-px-3 llb-py-2 llb-bg-red-100 llb-text-red-600 llb-rounded llb-text-xs llb-font-black llb-uppercase llb-hover:llb-bg-red-200 llb-disabled:llb-opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Pasted URLs */}
      <div className="llb-border llb-border-slate-200 llb-rounded-lg llb-p-3">
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-2">
          <h4 className="llb-text-xs llb-font-black llb-uppercase llb-text-navy-800">Pasted URLs</h4>
          <span className="llb-text-xs llb-font-bold llb-text-slate-500">{pastedDomains.length} domains</span>
        </div>
        <textarea
          rows={4}
          value={pastedText}
          onChange={handlePastedChange}
          placeholder="Enter domains, one per line&#10;example.com&#10;sub.domain.org"
          className="llb-w-full llb-p-2 llb-border llb-border-slate-200 llb-rounded llb-text-sm llb-font-mono llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          disabled={isLoading}
        />
        <div className="llb-flex llb-gap-2 llb-mt-2">
          <button
            onClick={clearPasted}
            disabled={pastedDomains.length === 0 || isLoading}
            className="llb-px-3 llb-py-2 llb-bg-red-100 llb-text-red-600 llb-rounded llb-text-xs llb-font-black llb-uppercase llb-hover:llb-bg-red-200"
          >
            Clear Pasted
          </button>
          <button
            onClick={clearAll}
            disabled={(primaryDomains.length + secondaryDomains.length + pastedDomains.length) === 0 || isLoading}
            className="llb-px-3 llb-py-2 llb-bg-red-600 llb-text-white llb-rounded llb-text-xs llb-font-black llb-uppercase llb-hover:llb-bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="llb-text-center llb-text-slate-400 llb-text-sm llb-animate-pulse">Processing...</div>
      )}
    </div>
  );
};

export default WatchtowerPanel;