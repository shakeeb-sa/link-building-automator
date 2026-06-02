import React, { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import type { IProfile } from '../../shared/types/profile';

const ProfileManager: React.FC = () => {
  const { profiles, activeProfileId, createProfile, updateProfile, deleteProfile, setActiveProfile, isLoading } = useProfiles();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  const handleCreate = async () => {
    if (!newProfileName.trim()) return;
    await createProfile(newProfileName.trim());
    setNewProfileName('');
  };

  const handleEditStart = (profile: IProfile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;
    await updateProfile(id, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete profile "${name}"?`)) {
      await deleteProfile(id);
      if (editingId === id) handleEditCancel();
    }
  };

  if (isLoading) {
    return <div className="llb-text-center llb-py-8 llb-text-slate-400">Loading profiles...</div>;
  }

  // Ensure profiles is always an array
  const safeProfiles = profiles || [];

  return (
    <div className="llb-space-y-4">
      {/* Create new profile */}
      <div className="llb-flex llb-gap-2">
        <input
          type="text"
          placeholder="New profile name"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          className="llb-flex-1 llb-px-3 llb-py-2 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
        <button
          onClick={handleCreate}
          disabled={!newProfileName.trim()}
          className="llb-px-4 llb-py-2 llb-bg-peach-500 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-peach-600 llb-disabled:llb-opacity-50 llb-transition-colors"
        >
          Create
        </button>
      </div>

      {/* Profile list */}
      {safeProfiles.length === 0 ? (
        <div className="llb-text-center llb-py-8 llb-text-slate-400 llb-text-sm">No profiles. Create one above.</div>
      ) : (
        <div className="llb-space-y-2">
          {safeProfiles.map((profile) => {
            const isActive = activeProfileId === profile.id;
            const isEditing = editingId === profile.id;

            return (
              <div
                key={profile.id}
                className={`llb-flex llb-items-center llb-justify-between llb-p-3 llb-rounded-lg llb-border llb-transition-colors
                  ${isActive ? 'llb-bg-peach-50 llb-border-peach-200' : 'llb-bg-slate-50 llb-border-slate-100'}`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="llb-flex-1 llb-px-2 llb-py-1 llb-border llb-border-slate-200 llb-rounded llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
                    autoFocus
                  />
                ) : (
                  <div className="llb-flex-1">
                    <div className="llb-font-medium llb-text-navy-800">{profile.name}</div>
                    {isActive && (
                      <span className="llb-text-[10px] llb-font-black llb-text-peach-500 llb-uppercase llb-tracking-wider">Active</span>
                    )}
                  </div>
                )}

                <div className="llb-flex llb-items-center llb-gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleEditSave(profile.id)}
                        className="llb-px-3 llb-py-1 llb-bg-green-500 llb-text-white llb-text-[10px] llb-font-black llb-rounded llb-hover:llb-bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="llb-px-3 llb-py-1 llb-bg-slate-300 llb-text-slate-700 llb-text-[10px] llb-font-black llb-rounded llb-hover:llb-bg-slate-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {!isActive && (
                        <button
                          onClick={() => setActiveProfile(profile.id)}
                          className="llb-px-3 llb-py-1 llb-bg-navy-800 llb-text-white llb-text-[10px] llb-font-black llb-rounded llb-hover:llb-bg-navy-900"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleEditStart(profile)}
                        className="llb-px-3 llb-py-1 llb-bg-slate-200 llb-text-slate-600 llb-text-[10px] llb-font-black llb-rounded llb-hover:llb-bg-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id, profile.name)}
                        className="llb-px-3 llb-py-1 llb-bg-red-500 llb-text-white llb-text-[10px] llb-font-black llb-rounded llb-hover:llb-bg-red-600"
                      >
                        Del
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileManager;