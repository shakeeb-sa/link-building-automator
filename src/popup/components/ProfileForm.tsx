import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { handleError } from '../../shared/utils/errorHandler';

// Helper to get flattened profile data directly from storage
async function getFlattenedProfileData(): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['current_flat_data'], (result) => {
      if (chrome.runtime.lastError) {
        resolve(null);
      } else {
        resolve(result.current_flat_data || null);
      }
    });
  });
}

const ProfileForm: React.FC = () => {
  const { activeProfileId, updateProfile, refreshProfiles } = useProfiles();
  const [formData, setFormData] = useState<Record<string, string>>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    website: '',
    title: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    region: '',
    country: '',
    category: '',
    masterHTML: '',
  });
  const [isCatLocked, setIsCatLocked] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRef = useRef<Range | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load profile data when active profile changes
  const loadProfileData = useCallback(async () => {
    if (!activeProfileId) {
      setFormData({
        username: '', email: '', password: '', firstName: '', lastName: '',
        company: '', website: '', title: '', phone: '', address: '', city: '',
        zip: '', region: '', country: '', category: '', masterHTML: '',
      });
      return;
    }

    try {
      const flatData = await getFlattenedProfileData();
      if (flatData) {
        setFormData({
          username: flatData.username || '',
          email: flatData.email || '',
          password: flatData.password || '',
          firstName: flatData.firstName || '',
          lastName: flatData.lastName || '',
          company: flatData.company || '',
          website: flatData.website || '',
          title: flatData.title || '',
          phone: flatData.phone || '',
          address: flatData.address || '',
          city: flatData.city || '',
          zip: flatData.zip || '',
          region: flatData.region || '',
          country: flatData.country || '',
          category: flatData.category || '',
          masterHTML: flatData.masterHTML || '',
        });
        setIsCatLocked(flatData.isCatLocked === true);
      }
    } catch (err) {
      handleError('ProfileForm.loadProfileData', err, 'Failed to load profile data');
    }
  }, [activeProfileId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData, refreshProfiles]);

  // Auto-save changes
  const saveChanges = useCallback(async () => {
    if (!activeProfileId) return;
    try {
      await updateProfile(activeProfileId, {
        data: {
          ...formData,
          isCatLocked,
        },
      });
    } catch (err) {
      handleError('ProfileForm.saveChanges', err, 'Failed to save profile');
    }
  }, [activeProfileId, formData, isCatLocked, updateProfile]);

  const debouncedSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveChanges();
    }, 500);
  }, [saveChanges]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    debouncedSave();
  };

  const toggleCategoryLock = () => {
    setIsCatLocked(!isCatLocked);
    debouncedSave();
  };

  // Rich text editor functions
  const updateEditorFromHTML = () => {
    if (editorRef.current && sourceTextareaRef.current) {
      if (isHtmlMode) {
        editorRef.current.innerHTML = sourceTextareaRef.current.value;
      } else {
        sourceTextareaRef.current.value = editorRef.current.innerHTML;
      }
    }
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Visual
      if (sourceTextareaRef.current && editorRef.current) {
        editorRef.current.innerHTML = sourceTextareaRef.current.value;
      }
    } else {
      // Switching from Visual to HTML
      if (editorRef.current && sourceTextareaRef.current) {
        sourceTextareaRef.current.value = editorRef.current.innerHTML;
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  const execCommand = (command: string, value?: string) => {
    if (!isHtmlMode) {
      document.execCommand(command, false, value || '');
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        handleInputChange('masterHTML', html);
      }
    }
  };

  const showLinkModal = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
      setLinkModalOpen(true);
      setLinkUrl('');
    }
  };

  const applyLink = () => {
    if (savedSelectionRef.current && linkUrl.trim()) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        let url = linkUrl.trim();
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        document.execCommand('createLink', false, url);
        if (editorRef.current) {
          handleInputChange('masterHTML', editorRef.current.innerHTML);
        }
      }
    }
    setLinkModalOpen(false);
    setLinkUrl('');
    savedSelectionRef.current = null;
  };

  // Update form when editor changes
  const handleEditorInput = () => {
    if (editorRef.current && !isHtmlMode) {
      handleInputChange('masterHTML', editorRef.current.innerHTML);
    }
  };

  const handleSourceChange = () => {
    if (sourceTextareaRef.current && isHtmlMode) {
      handleInputChange('masterHTML', sourceTextareaRef.current.value);
    }
  };

  if (!activeProfileId) {
    return (
      <div className="llb-text-center llb-py-8 llb-text-slate-400 llb-text-sm">
        No active profile. Please create and activate a profile in the Profiles tab.
      </div>
    );
  }

  return (
    <div className="llb-space-y-3">
      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Company / Brand</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Website URL</label>
        <input
          type="text"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Title / Subject</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Zip / Postal</label>
          <input
            type="text"
            value={formData.zip}
            onChange={(e) => handleInputChange('zip', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
        <div>
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">State / Region</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
          />
        </div>
      </div>

      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">Country</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500"
        />
      </div>

      <div>
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-1">
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider">Category</label>
          <button
            onClick={toggleCategoryLock}
            className="llb-text-xs llb-px-2 llb-py-0.5 llb-rounded llb-bg-slate-100 llb-text-slate-500 hover:llb-bg-slate-200"
          >
            {isCatLocked ? '🔒 Locked' : '🔓 Unlocked'}
          </button>
        </div>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          readOnly={isCatLocked}
          className={`llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500 ${isCatLocked ? 'llb-bg-slate-100 llb-text-slate-400' : ''}`}
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-1">
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider">Description / Bio</label>
          <div className="llb-flex llb-gap-1">
            <button onClick={() => execCommand('bold')} className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-bold">B</button>
            <button onClick={() => execCommand('italic')} className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-bold italic">I</button>
            <button onClick={showLinkModal} className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs">🔗</button>
            <button onClick={toggleHtmlMode} className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs">&lt;/&gt;</button>
          </div>
        </div>

        {!isHtmlMode ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="llb-min-h-[100px] llb-p-3 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:outline-none llb-focus:border-peach-500 llb-overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: formData.masterHTML }}
          />
        ) : (
          <textarea
            ref={sourceTextareaRef}
            value={formData.masterHTML}
            onChange={handleSourceChange}
            className="llb-w-full llb-min-h-[100px] llb-p-3 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-font-mono llb-focus:outline-none llb-focus:border-peach-500"
          />
        )}
      </div>

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="llb-fixed llb-inset-0 llb-bg-black/50 llb-flex llb-items-center llb-justify-center llb-z-[2147483647]">
          <div className="llb-bg-white llb-rounded-lg llb-p-4 llb-w-80">
            <h4 className="llb-text-sm llb-font-black llb-mb-3">Insert Link</h4>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="llb-w-full llb-px-3 llb-py-2 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-mb-3"
              autoFocus
            />
            <div className="llb-flex llb-justify-end llb-gap-2">
              <button onClick={() => setLinkModalOpen(false)} className="llb-px-3 llb-py-1 llb-text-sm">Cancel</button>
              <button onClick={applyLink} className="llb-px-3 llb-py-1 llb-bg-peach-500 llb-text-white llb-rounded llb-text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;