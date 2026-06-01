import { handleError } from '../../../shared/utils/errorHandler';

let menuContainer: HTMLDivElement | null = null;
let backdrop: HTMLDivElement | null = null;

const GATEWAY_PATHS: string[] = [
  '/login',
  '/register',
  '/signup',
  '/join',
  '/create-account',
  '/start',
  '/wp-admin',
  '/admin',
  '/administrator',
  '/dashboard',
  '/my-account',
  '/account',
  '/profile',
  '/submit',
  '/post-ad',
  '/add-listing',
  '/submit-url',
];

/**
 * Removes the menu and backdrop if they exist.
 */
function removeMenu(): void {
  if (menuContainer) {
    menuContainer.remove();
    menuContainer = null;
  }
  if (backdrop) {
    backdrop.remove();
    backdrop = null;
  }
}

/**
 * Creates and displays the gateway hunter menu.
 */
function showMenu(): void {
  removeMenu();

  const origin = window.location.origin;

  // Backdrop (click to close)
  backdrop = document.createElement('div');
  backdrop.className = 'llb-fixed llb-inset-0 llb-bg-black/30 llb-z-[2147483646]';
  backdrop.onclick = removeMenu;

  // Menu container
  menuContainer = document.createElement('div');
  menuContainer.className = 'llb-fixed llb-top-1/2 llb-left-1/2 llb-transform llb--translate-x-1/2 llb--translate-y-1/2 llb-bg-white llb-rounded-xl llb-shadow-2xl llb-border llb-border-slate-200 llb-w-80 llb-max-h-[80vh] llb-overflow-hidden llb-z-[2147483647] llb-flex llb-flex-col';

  // Header
  const header = document.createElement('div');
  header.className = 'llb-bg-navy-800 llb-text-white llb-px-5 llb-py-3 llb-flex llb-justify-between llb-items-center';
  header.innerHTML = `
    <span class="llb-font-black llb-text-sm llb-uppercase llb-tracking-wider">🚪 Gateway Hunter</span>
    <button class="llb-text-white/70 llb-hover:text-white llb-text-xl llb-leading-5" id="llb-gateway-close">&times;</button>
  `;

  // Path list container
  const listContainer = document.createElement('div');
  listContainer.className = 'llb-p-4 llb-max-h-96 llb-overflow-y-auto llb-custom-scrollbar';

  for (const path of GATEWAY_PATHS) {
    const fullUrl = origin + path;
    const btn = document.createElement('button');
    btn.textContent = path;
    btn.className = 'llb-block llb-w-full llb-text-left llb-px-3 llb-py-2 llb-mb-1 llb-rounded llb-text-slate-700 llb-font-medium llb-bg-slate-50 llb-border llb-border-slate-100 llb-hover:llb-bg-peach-500 llb-hover:text-white llb-transition-colors';
    btn.onclick = () => {
      window.location.href = fullUrl;
    };
    listContainer.appendChild(btn);
  }

  // Footer note
  const footer = document.createElement('div');
  footer.className = 'llb-px-4 llb-py-3 llb-border-t llb-border-slate-100 llb-bg-slate-50 llb-text-center';
  footer.innerHTML = '<span class="llb-text-[10px] llb-text-slate-400 llb-font-black llb-uppercase">Press Alt+G to open / Esc to close</span>';

  menuContainer.appendChild(header);
  menuContainer.appendChild(listContainer);
  menuContainer.appendChild(footer);

  document.body.appendChild(backdrop);
  document.body.appendChild(menuContainer);

  // Close button handler
  const closeBtn = header.querySelector('#llb-gateway-close');
  if (closeBtn) closeBtn.addEventListener('click', removeMenu);

  // Close on Escape key
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      removeMenu();
      document.removeEventListener('keydown', onKeyDown);
    }
  };
  document.addEventListener('keydown', onKeyDown);
}

/**
 * Keyboard event handler for Alt+G.
 */
function onKeyDown(e: KeyboardEvent): void {
  if (e.altKey && e.code === 'KeyG') {
    e.preventDefault();
    showMenu();
  }
}

/**
 * Initialises the Gateway Hunter feature.
 * @returns cleanup function
 */
export function init(): () => void {
  document.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('keydown', onKeyDown);
    removeMenu();
  };
}