/**
 * Company / organization field detection patterns.
 *
 * Exports a FieldPatternRule for company, organization, business, and employer inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'company',
  patterns: [
    /company/i,
    /organization/i,
    /organisation/i,
    /business/i,
    /employer/i,
    /business-?name/i,
    /company-?name/i,
  ],
  description: 'Company/organization',
};