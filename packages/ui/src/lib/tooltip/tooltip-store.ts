import { writable } from 'svelte/store';

export const tooltipHidden = writable(false);

window.addEventListener('context-menu-closed', () => {
  tooltipHidden.update(() => false);
});

window.addEventListener('contextmenu', () => {
  tooltipHidden.update(() => true);
});
