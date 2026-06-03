/**
 * Company size / employee count field detection patterns.
 *
 * Exports a FieldPatternRule for company size, employee count, and team size inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'companySize',
  patterns: [
    /company_?size/i,
    /employees/i,
    /employee_?count/i,
    /number-?of-?employees/i,
    /team-?size/i,
  ],
  description: 'Company size dropdown',
};