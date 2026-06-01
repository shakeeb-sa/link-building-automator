import type { BacklinkBatch } from '../../../shared/types/unusedBacklinks';

let modalContainer: HTMLDivElement | null = null;
let backdrop: HTMLDivElement | null = null;
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * Removes the modal and backdrop from the DOM.
 */
export function hideModal(): void {
  if (modalContainer) {
    modalContainer.remove();
    modalContainer = null;
  }
  if (backdrop) {
    backdrop.remove();
    backdrop = null;
  }
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
}

/**
 * Creates and displays the modal with the given batch of backlinks.
 * @param batch – the batch of URLs to display
 * @param onShuffle – callback when the Shuffle button is clicked
 * @param onOpenAll – callback when the Open All button is clicked
 */
export function showModal(batch: BacklinkBatch, onShuffle: () => void, onOpenAll: () => void): void {
  // Remove any existing modal first
  hideModal();

  // Backdrop
  backdrop = document.createElement('div');
  backdrop.className = 'llb-fixed llb-inset-0 llb-bg-black/50 llb-z-[2147483646]';

  // Modal container
  modalContainer = document.createElement('div');
  modalContainer.className = 'llb-fixed llb-top-1/2 llb-left-1/2 llb-transform llb--translate-x-1/2 llb--translate-y-1/2 llb-bg-white llb-rounded-xl llb-shadow-2xl llb-border llb-border-slate-200 llb-w-96 llb-max-h-[80vh] llb-overflow-hidden llb-z-[2147483647] llb-flex llb-flex-col';

  // Header
  const header = document.createElement('div');
  header.className = 'llb-bg-navy-800 llb-text-white llb-px-5 llb-py-3 llb-flex llb-justify-between llb-items-center';
  header.innerHTML = `
    <span class="llb-font-black llb-text-sm llb-uppercase llb-tracking-wider">🔗 Unused Backlinks</span>
    <button class="llb-text-white/70 llb-hover:text-white llb-text-xl llb-leading-5" id="llb-modal-close">&times;</button>
  `;

  // Body – list of URLs
  const body = document.createElement('div');
  body.className = 'llb-p-4 llb-flex-1 llb-overflow-y-auto llb-custom-scrollbar';

  const list = document.createElement('ul');
  list.className = 'llb-space-y-2';
  for (const url of batch.urls) {
    const li = document.createElement('li');
    li.className = 'llb-text-sm';
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = url;
    link.className = 'llb-text-blue-600 llb-underline llb-break-all llb-hover:text-blue-800';
    li.appendChild(link);
    list.appendChild(li);
  }
  body.appendChild(list);

  // Footer with action buttons
  const footer = document.createElement('div');
  footer.className = 'llb-p-4 llb-border-t llb-border-slate-100 llb-flex llb-gap-3';

  const shuffleBtn = document.createElement('button');
  shuffleBtn.textContent = '🔄 Shuffle';
  shuffleBtn.className = 'llb-flex-1 llb-px-4 llb-py-2 llb-bg-navy-800 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-navy-900 llb-transition-colors';
  shuffleBtn.onclick = () => {
    onShuffle();
  };

  const openAllBtn = document.createElement('button');
  openAllBtn.textContent = `🚀 Open All (${batch.urls.length})`;
  openAllBtn.className = 'llb-flex-1 llb-px-4 llb-py-2 llb-bg-peach-500 llb-text-white llb-text-xs llb-font-black llb-uppercase llb-rounded-lg llb-hover:llb-bg-peach-600 llb-transition-colors';
  openAllBtn.onclick = () => {
    onOpenAll();
  };

  footer.appendChild(shuffleBtn);
  footer.appendChild(openAllBtn);

  modalContainer.appendChild(header);
  modalContainer.appendChild(body);
  modalContainer.appendChild(footer);

  document.body.appendChild(backdrop);
  document.body.appendChild(modalContainer);

  // Close button handler
  const closeBtn = header.querySelector('#llb-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', hideModal);

  // Escape key handler
  escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideModal();
    }
  };
  document.addEventListener('keydown', escapeHandler);
}