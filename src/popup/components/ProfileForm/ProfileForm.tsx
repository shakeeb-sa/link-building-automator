/**
 * ProfileForm Component
 *
 * The main profile form that displays all user data fields and allows editing.
 * Uses custom hook for state management and reusable subcomponents.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import React from 'react';
import { useProfileForm } from '../../hooks/useProfileForm';
import FieldInput from './FieldInput';
import RichTextEditor from './RichTextEditor';

const ProfileForm: React.FC = () => {
  const { formData, isCatLocked, isLoading, activeProfileId, updateField, toggleCategoryLock } = useProfileForm();

  if (isLoading) {
    return (
      <div className="llb-text-center llb-py-8 llb-text-slate-400 llb-text-sm">
        Loading profile...
      </div>
    );
  }

  // Show message if no active profile
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
        <FieldInput
          label="Username"
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
        <FieldInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </div>

      <FieldInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => updateField('password', e.target.value)}
      />

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <FieldInput
          label="First Name"
          value={formData.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
        />
        <FieldInput
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
        />
      </div>

      <FieldInput
        label="Company / Brand"
        value={formData.company}
        onChange={(e) => updateField('company', e.target.value)}
      />

      <FieldInput
        label="Website URL"
        type="url"
        value={formData.website}
        onChange={(e) => updateField('website', e.target.value)}
      />

      <FieldInput
        label="Title / Subject"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
      />

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <FieldInput
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <FieldInput
          label="Zip / Postal"
          value={formData.zip}
          onChange={(e) => updateField('zip', e.target.value)}
        />
      </div>

      <FieldInput
        label="Address"
        value={formData.address}
        onChange={(e) => updateField('address', e.target.value)}
      />

      <div className="llb-grid llb-grid-cols-2 llb-gap-3">
        <FieldInput
          label="City"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
        />
        <FieldInput
          label="State / Region"
          value={formData.region}
          onChange={(e) => updateField('region', e.target.value)}
        />
      </div>

      <FieldInput
        label="Country"
        value={formData.country}
        onChange={(e) => updateField('country', e.target.value)}
      />

      {/* Category field with lock toggle */}
      <div>
        <div className="llb-flex llb-justify-between llb-items-center llb-mb-1">
          <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider">
            Category
          </label>
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
          onChange={(e) => updateField('category', e.target.value)}
          readOnly={isCatLocked}
          className={`llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500 ${
            isCatLocked ? 'llb-bg-slate-100 llb-text-slate-400' : ''
          }`}
        />
      </div>

      {/* Rich Text Editor for masterHTML */}
      <RichTextEditor
        value={formData.masterHTML}
        onChange={(html) => updateField('masterHTML', html)}
      />
    </div>
  );
};

export default ProfileForm;