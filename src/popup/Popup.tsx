import React, { useState, useEffect } from 'react';
import ProfileManager from './components/ProfileManager';
import WatchtowerPanel from './components/WatchtowerPanel';
import FormatManager from './components/FormatManager';
import UnusedBacklinksPanel from './components/UnusedBacklinksPanel';
import GoldMineToggle from './components/GoldMineToggle';
import MasterSwitch from './components/MasterSwitch';

type TabId = 'profiles' | 'watchtower' | 'formats' | 'backlinks' | 'goldmine' | 'master';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profiles');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load (or you can remove this if no async load needed)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'profiles', label: 'Profiles' },
    { id: 'watchtower', label: 'Watchtower' },
    { id: 'formats', label: 'Formats' },
    { id: 'backlinks', label: 'Backlinks' },
    { id: 'goldmine', label: 'Gold Mine' },
    { id: 'master', label: 'Master' },
  ];

  if (isLoading) {
    return (
      <div className="llb-w-80 llb-p-4 llb-text-center">
        <div className="llb-animate-pulse llb-text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="llb-w-96 llb-bg-white llb-shadow-lg llb-rounded-lg llb-overflow-hidden">
      {/* Tab Bar */}
      <div className="llb-flex llb-border-b llb-border-slate-200 llb-bg-slate-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`llb-flex-1 llb-py-3 llb-text-xs llb-font-black llb-uppercase llb-tracking-wider llb-transition-colors
              ${activeTab === tab.id
                ? 'llb-text-peach-500 llb-border-b-2 llb-border-peach-500 llb-bg-white'
                : 'llb-text-slate-400 hover:llb-text-slate-600 llb-bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="llb-p-4 llb-max-h-[500px] llb-overflow-y-auto llb-custom-scrollbar">
        {activeTab === 'profiles' && <ProfileManager />}
        {activeTab === 'watchtower' && <WatchtowerPanel />}
        {activeTab === 'formats' && <FormatManager />}
        {activeTab === 'backlinks' && <UnusedBacklinksPanel />}
        {activeTab === 'goldmine' && <GoldMineToggle />}
        {activeTab === 'master' && <MasterSwitch />}
      </div>

      {/* Footer */}
      <div className="llb-px-4 llb-py-3 llb-border-t llb-border-slate-100 llb-bg-slate-50 llb-text-center">
        <p className="llb-text-[10px] llb-text-slate-400 llb-font-black llb-uppercase llb-tracking-wider">
          Lightning LinkBuilder v10
        </p>
      </div>
    </div>
  );
};

export default Popup;