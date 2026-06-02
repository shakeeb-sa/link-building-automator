/**
 * FieldInput Component
 *
 * A reusable labeled input field with consistent styling for the profile form.
 * Supports all standard HTML input attributes.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import React from 'react';

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  ({ label, type = 'text', className = '', ...props }, ref) => {
    return (
      <div>
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider llb-mb-1">
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          className={`llb-w-full llb-px-3 llb-py-2 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:llb-outline-none llb-focus:llb-border-peach-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

FieldInput.displayName = 'FieldInput';

export default FieldInput;