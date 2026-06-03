/**
 * Password field detection patterns.
 *
 * Exports a FieldPatternRule for password inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'password',
  patterns: [
    /password/i,
    /passwd/i,
    /pwd/i,
    /new-password/i,
    /confirm-password/i,
    /current-password/i,
    /old-password/i,
    /passphrase/i,
  ],
  description: 'Password fields',
};