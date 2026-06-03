/**
 * Email field detection patterns.
 *
 * Exports a FieldPatternRule for primary email inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'email',
  patterns: [
    /^email$/i,
    /^e-?mail$/i,
    /user_?email/i,
    /email-address/i,
    /e-mail-address/i,
    /mail/i,
  ],
  description: 'Primary email',
};