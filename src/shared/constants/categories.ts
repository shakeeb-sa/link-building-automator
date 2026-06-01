/**
 * Mapping from category slug to an array of keywords (lowercase).
 */
export type CategoryKeywordMap = Record<string, string[]>;

/**
 * Keywords for AI category suggestion.
 * Keys are category slugs, values are arrays of related words.
 */
export const CATEGORY_KEYWORDS: CategoryKeywordMap = {
  'real estate': [
    'real estate', 'property', 'residential', 'commercial', 'house', 'homes',
    'home sale', 'buy house', 'sell house', 'apartment', 'condo', 'rental',
    'lease', 'mortgage', 'realtor', 'realty', 'broker', 'property management',
    'housing', 'listing', 'open house',
  ],
  automotive: [
    'car', 'cars', 'vehicle', 'vehicles', 'auto', 'automotive', 'dealer',
    'dealership', 'used cars', 'new cars', 'car sale', 'sell my car',
    'auto repair', 'mechanic', 'service center', 'oil change', 'tire shop',
    'tire', 'engine', 'transmission', 'car parts', 'truck', 'suv', 'sedan',
  ],
  technology: [
    'technology', 'tech', 'software', 'software development', 'developer',
    'web developer', 'web development', 'app', 'mobile app', 'app developer',
    'website', 'web design', 'hosting', 'server', 'cloud', 'saas', 'data',
    'analytics', 'seo', 'digital marketing', 'it support', 'computer',
    'hardware', 'network', 'internet', 'email', 'cybersecurity',
  ],
  health: [
    'health', 'medical', 'clinic', 'doctor', 'dentist', 'dental', 'hospital',
    'wellness', 'fitness', 'gym', 'personal trainer', 'workout', 'nutrition',
    'diet', 'spa', 'salon', 'beauty', 'cosmetics', 'makeup', 'skincare',
    'hair', 'hair salon', 'massage', 'esthetician',
  ],
  business: [
    'business', 'company', 'corporate', 'consulting', 'consultant', 'finance',
    'financial', 'bank', 'accounting', 'accountant', 'tax', 'tax service',
    'investment', 'insurance', 'loan', 'legal', 'lawyer', 'attorney',
    'services', 'agency', 'marketing agency', 'office', 'b2b', 'small business',
  ],
  shopping: [
    'shopping', 'shop', 'store', 'retail', 'ecommerce', 'e-commerce',
    'online store', 'fashion', 'clothing', 'apparel', 'shoes', 'jewelry',
    'accessories', 'sale', 'discount', 'coupon', 'order', 'catalog',
    'boutique', 'gift shop', 'furniture', 'home goods',
  ],
  travel: [
    'travel', 'travel agent', 'vacation', 'holiday', 'tour', 'tourism',
    'tour operator', 'hotel', 'resort', 'flight', 'airline', 'booking',
    'car rental', 'destination', 'cruise', 'travel guide', 'vacation rental',
  ],
  education: [
    'education', 'school', 'college', 'university', 'course', 'online course',
    'e-learning', 'training', 'tutor', 'tutoring', 'class', 'program',
    'degree', 'student', 'learning', 'certification', 'workshop', 'seminar',
    'academy', 'teacher', 'coaching',
  ],
};

/**
 * Fallback category when no keywords match.
 */
export const FALLBACK_CATEGORY = 'business';