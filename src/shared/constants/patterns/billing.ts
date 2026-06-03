/**
 * Billing address / section field detection patterns.
 *
 * Exports a FieldPatternRule for billing, bill to, and billing address inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'billing',
  patterns: [
    /billing/i,
    /bill_?to/i,
    /billing-?address/i,
  ],
  description: 'Billing address/section',
};