import type { IProfileData } from '../../../shared/types/profile';
import { fillElement, fillSelect, fillCheckbox } from './filler';

/**
 * Simple fake data generator for fallback values when profile data is missing.
 */
function generateFake(type: string): string {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const companies = ['TechCorp', 'Global Solutions', 'Alpha Agency', 'NextGen Media'];
  const titles = ['Marketing Director', 'Content Manager', 'SEO Specialist', 'Owner'];
  const subjects = ['Inquiry regarding your website', 'Collaboration Proposal', 'Partnership Opportunity'];

  switch (type) {
    case 'username': return `user_${Math.floor(Math.random() * 10000)}`;
    case 'email': return `user${Math.floor(Math.random() * 10000)}@example.com`;
    case 'password': return `Pass${Math.floor(Math.random() * 10000)}!`;
    case 'firstName': return `First${Math.floor(Math.random() * 100)}`;
    case 'lastName': return `Last${Math.floor(Math.random() * 100)}`;
    case 'fullName': return `Full Name ${Math.floor(Math.random() * 100)}`;
    case 'phone': return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    case 'fax': return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    case 'address': return `${Math.floor(Math.random() * 9000) + 100} Main St`;
    case 'city': return cities[Math.floor(Math.random() * cities.length)];
    case 'state': return ['CA', 'NY', 'TX', 'FL', 'IL'][Math.floor(Math.random() * 5)];
    case 'zip': return `${Math.floor(Math.random() * 90000) + 10000}`;
    case 'country': return 'United States';
    case 'company': return companies[Math.floor(Math.random() * companies.length)];
    case 'website': return `https://example${Math.floor(Math.random() * 1000)}.com`;
    case 'title': return titles[Math.floor(Math.random() * titles.length)];
    case 'subject': return subjects[Math.floor(Math.random() * subjects.length)];
    case 'category': return 'General';
    case 'price': return '0';
    case 'social': return 'https://twitter.com/user';
    case 'companySize': return '1-10';
    case 'billing':
    case 'shipping':
      return 'United States';
    default:
      return 'N/A';
  }
}

/**
 * Brutal injection: fills all form elements aggressively.
 * @param profile – active profile data (may be null)
 */
export function shockwaveFill(profile: IProfileData | null): void {
  // 1. Text inputs and textareas
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]), textarea'
  );
  for (const el of inputs) {
    if (el.disabled || el.readOnly) continue;
    // Skip if already filled (non-empty)
    if (el.value && el.value.trim().length > 0) continue;

    let value: string | null = null;
    // Very basic field type detection (simplified for shockwave)
    const lowerId = (el.id + ' ' + el.name + ' ' + (el.placeholder || '')).toLowerCase();
    if (lowerId.includes('user') && !lowerId.includes('email')) value = profile?.username || generateFake('username');
    else if (lowerId.includes('email')) value = profile?.email || generateFake('email');
    else if (lowerId.includes('pass')) value = profile?.password || generateFake('password');
    else if (lowerId.includes('first')) value = profile?.firstName || generateFake('firstName');
    else if (lowerId.includes('last')) value = profile?.lastName || generateFake('lastName');
    else if (lowerId.includes('phone') || lowerId.includes('mobile')) value = profile?.phone || generateFake('phone');
    else if (lowerId.includes('address')) value = profile?.address || generateFake('address');
    else if (lowerId.includes('city')) value = profile?.city || generateFake('city');
    else if (lowerId.includes('state') || lowerId.includes('region')) value = profile?.region || generateFake('state');
    else if (lowerId.includes('zip') || lowerId.includes('postal')) value = profile?.zip || generateFake('zip');
    else if (lowerId.includes('country')) value = profile?.country || generateFake('country');
    else if (lowerId.includes('company')) value = profile?.company || generateFake('company');
    else if (lowerId.includes('website') || lowerId.includes('url')) value = profile?.website || generateFake('website');
    else if (lowerId.includes('title')) value = profile?.title || generateFake('title');
    else if (lowerId.includes('subject')) value = profile?.title || generateFake('subject');
    else if (lowerId.includes('category')) value = profile?.category || generateFake('category');
    else if (lowerId.includes('price') || lowerId.includes('budget')) value = generateFake('price');

    if (value !== null) {
      fillElement(el, value);
    } else {
      // Fallback: fill with "N/A" to prevent empty fields
      fillElement(el, 'N/A');
    }
  }

  // 2. Radio groups – prefer free/cheapest options
  const radioGroups = new Map<string, NodeListOf<HTMLInputElement>>();
  document.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
    if (radio.disabled) return;
    const name = radio.name || `_group_${radio.id}`;
    if (!radioGroups.has(name)) radioGroups.set(name, document.querySelectorAll(`input[type="radio"][name="${name}"]`));
  });
  for (const [_, group] of radioGroups) {
    let bestRadio: HTMLInputElement | null = null;
    let bestScore = -Infinity;
    for (const radio of group) {
      if (radio.disabled) continue;
      let text = '';
      if (radio.id) {
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) text += label.textContent;
      }
      const parent = radio.closest('div, li, td');
      if (parent) text += ' ' + parent.textContent;
      text = text.toLowerCase();

      let score = 0;
      // Penalise anything that looks like it costs money
      if (/\$|usd|price|cost|premium|highlight|pack|deal/i.test(text)) score -= 500;
      // Prefer "no thanks", "free", "basic", "standard"
      if (/no[,.]? thanks?/i.test(text)) score += 1000;
      if (/free|basic|standard/i.test(text)) score += 500;
      if (score > bestScore) {
        bestScore = score;
        bestRadio = radio;
      }
    }
    if (bestRadio && !bestRadio.checked) {
      bestRadio.checked = true;
      bestRadio.dispatchEvent(new Event('change', { bubbles: true }));
      // Also click the parent container if needed (common in custom UI)
      if (bestRadio.parentElement) bestRadio.parentElement.click();
    }
  }

  // 3. Checkboxes – check those related to agreements
  const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  for (const cb of checkboxes) {
    if (cb.disabled || cb.checked) continue;
    const text = (cb.closest('label')?.innerText || cb.parentElement?.innerText || cb.getAttribute('aria-label') || '').toLowerCase();
    if (/agree|accept|terms|privacy|policy|newsletter|subscribe|opt.?in/i.test(text)) {
      fillCheckbox(cb, true);
    }
  }

  // 4. Dropdowns – select any non‑empty, non‑placeholder option
  const selects = document.querySelectorAll<HTMLSelectElement>('select');
  for (const sel of selects) {
    if (sel.disabled) continue;
    if (sel.selectedIndex > 0 && sel.value && sel.value.trim() !== '') continue;
    for (let i = 0; i < sel.options.length; i++) {
      const opt = sel.options[i];
      if (opt.disabled) continue;
      const text = opt.text.toLowerCase();
      if (opt.value !== '' && !text.includes('select') && !text.includes('choose')) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  }

  // 5. File input – trigger click to open picker (cannot auto‑fill)
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput && !fileInput.disabled) {
    fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fileInput.style.outline = '3px solid red';
    setTimeout(() => fileInput.click(), 300);
  }
}