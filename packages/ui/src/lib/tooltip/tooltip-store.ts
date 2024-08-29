import { writable } from 'svelte/store';

export const tooltipHidden = writable(false);

window.addEventListener('menu-closed', () => {
  tooltipHidden.update(() => false);
});

window.addEventListener('menu-open', () => {
  tooltipHidden.update(() => true);
});

window.addEventListener('contextmenu', () => {
  tooltipHidden.update(() => true);
});
