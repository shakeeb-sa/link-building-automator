/**
 * Secondary/confirm email field detection patterns.
 *
 * Exports a FieldPatternRule for secondary or confirm email inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'secondaryEmail',
  patterns: [
    /secondary.?email/i,
    /alt.?email/i,
    /backup.?email/i,
    /confirm.?email/i,
    /confirm-?email/i,
    /repeat-?email/i,
  ],
  description: 'Secondary/confirm email',
};