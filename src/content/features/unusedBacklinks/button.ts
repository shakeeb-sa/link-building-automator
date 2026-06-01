let buttonElement: HTMLDivElement | null = null;

/**
 * Creates and displays the floating button.
 * @param onClick – callback invoked when the button is clicked.
 */
export function createFloatingButton(onClick: () => void): void {
  // Remove existing button first
  destroyFloatingButton();

  const btn = document.createElement('div');
  btn.id = 'llb-unused-backlinks-btn';
  btn.className = 'llb-fixed llb-bottom-5 llb-left-5 llb-z-[2147483647] llb-w-9 llb-h-9 llb-bg-purple-600 llb-rounded-full llb-flex llb-items-center llb-justify-center llb-text-white llb-text-xl llb-cursor-pointer llb-shadow-lg llb-transition-transform llb-duration-200 hover:llb-scale-110';
  btn.textContent = '🔗';
  btn.title = 'Unused Backlinks (Alt+S)';
  btn.onclick = onClick;

  document.body.appendChild(btn);
  buttonElement = btn;
}

/**
 * Removes the floating button if it exists.
 */
export function destroyFloatingButton(): void {
  if (buttonElement) {
    buttonElement.remove();
    buttonElement = null;
  }
}