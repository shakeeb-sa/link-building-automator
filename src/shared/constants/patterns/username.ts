/**
 * Username / login field detection patterns.
 *
 * Exports a FieldPatternRule for username, user ID, and login inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'username',
  patterns: [
    /username/i,
    /user_?name/i,
    /^login$/i,
    /user_login/i,
    /^log$/i,
    /signup_username/i,
    /user-?id/i,
    /userid/i,
    /uid/i,
    /login-?name/i,
    /nickname/i,
    /handle/i,
  ],
  description: 'Username/login fields',
};