/**
 * Recognized field types for form filling.
 */
export type FieldType =
  | 'username'
  | 'email'
  | 'secondaryEmail'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'phone'
  | 'fax'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'company'
  | 'website'
  | 'title'
  | 'subject'
  | 'category'
  | 'dob'
  | 'gender'
  | 'language'
  | 'timezone'
  | 'price'
  | 'social'
  | 'companySize'
  | 'billing'
  | 'shipping'
  | 'unknown';

/**
 * A single detection rule.
 */
export interface FieldPatternRule {
  fieldType: FieldType;
  patterns: RegExp[];
  description?: string;
}

/**
 * Priority‑ordered field detection patterns.
 * Earlier patterns have higher priority.
 */
export const FIELD_PATTERNS: FieldPatternRule[] = [
  {
    fieldType: 'password',
    patterns: [/password/i, /passwd/i, /pwd/i],
    description: 'Password fields',
  },
  {
    fieldType: 'email',
    patterns: [/^email$/i, /^e-?mail$/i, /user_?email/i, /email-address/i],
    description: 'Primary email',
  },
  {
    fieldType: 'secondaryEmail',
    patterns: [/secondary.?email/i, /alt.?email/i, /backup.?email/i, /confirm.?email/i],
    description: 'Secondary/confirm email',
  },
  {
    fieldType: 'username',
    patterns: [/username/i, /user_?name/i, /^login$/i, /user_login/i, /^log$/i, /signup_username/i],
    description: 'Username/login fields',
  },
  {
    fieldType: 'firstName',
    patterns: [/first_?name/i, /fname/i, /given_?name/i],
    description: 'First name',
  },
  {
    fieldType: 'lastName',
    patterns: [/last_?name/i, /lname/i, /surname/i, /family_?name/i],
    description: 'Last name',
  },
  {
    fieldType: 'fullName',
    patterns: [/full_?name/i, /display_?name/i, /complete_?name/i],
    description: 'Full name',
  },
  {
    fieldType: 'phone',
    patterns: [/phone/i, /mobile/i, /cell/i, /telephone/i, /tel/i],
    description: 'Phone/mobile',
  },
  {
    fieldType: 'fax',
    patterns: [/fax/i],
    description: 'Fax number',
  },
  {
    fieldType: 'address',
    patterns: [/address/i, /street/i, /addr/i],
    description: 'Street address',
  },
  {
    fieldType: 'city',
    patterns: [/city/i, /town/i],
    description: 'City/town',
  },
  {
    fieldType: 'state',
    patterns: [/state/i, /province/i, /region/i, /county/i],
    description: 'State/province/region',
  },
  {
    fieldType: 'zip',
    patterns: [/zip/i, /postal/i, /pcode/i, /postcode/i],
    description: 'ZIP/postal code',
  },
  {
    fieldType: 'country',
    patterns: [/country/i],
    description: 'Country',
  },
  {
    fieldType: 'company',
    patterns: [/company/i, /organization/i, /organisation/i, /business/i, /employer/i],
    description: 'Company/organization',
  },
  {
    fieldType: 'website',
    patterns: [/website/i, /site/i, /url/i, /homepage/i, /web_?address/i],
    description: 'Website URL',
  },
  {
    fieldType: 'title',
    patterns: [/^title$/i, /job_?title/i, /position/i, /headline/i],
    description: 'Job title or headline',
  },
  {
    fieldType: 'subject',
    patterns: [/subject/i, /topic/i, /message_?subject/i],
    description: 'Email/forum subject',
  },
  {
    fieldType: 'category',
    patterns: [/category/i, /cat_?id/i, /section/i, /type_of_post/i, /classified/i],
    description: 'Category dropdown/input',
  },
  {
    fieldType: 'dob',
    patterns: [/birth/i, /dob/i, /date_?of_?birth/i],
    description: 'Date of birth',
  },
  {
    fieldType: 'gender',
    patterns: [/gender/i, /sex/i],
    description: 'Gender',
  },
  {
    fieldType: 'language',
    patterns: [/language/i, /lang/i],
    description: 'Language',
  },
  {
    fieldType: 'timezone',
    patterns: [/time_?zone/i, /tz/i],
    description: 'Timezone',
  },
  {
    fieldType: 'price',
    patterns: [/price/i, /budget/i, /cost/i, /amount/i],
    description: 'Price/budget field',
  },
  {
    fieldType: 'social',
    patterns: [/social/i, /twitter/i, /facebook/i, /linkedin/i, /instagram/i],
    description: 'Social media profile URL',
  },
  {
    fieldType: 'companySize',
    patterns: [/company_?size/i, /employees/i, /employee_?count/i],
    description: 'Company size dropdown',
  },
  {
    fieldType: 'billing',
    patterns: [/billing/i, /bill_?to/i],
    description: 'Billing address/section',
  },
  {
    fieldType: 'shipping',
    patterns: [/shipping/i, /ship_?to/i],
    description: 'Shipping address/section',
  },
];

/**
 * Helper function to determine field type from element attributes and context.
 * @param text – combined string from id, name, placeholder, autocomplete, label texts
 * @returns FieldType
 */
export function detectFieldType(text: string): FieldType {
  const lower = text.toLowerCase();
  for (const rule of FIELD_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) {
        return rule.fieldType;
      }
    }
  }
  return 'unknown';
}