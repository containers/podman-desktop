import { writable } from 'svelte/store';

export const tooltipHidden = writable(false);

window.addEventListener('context-menu-closed', () => {
  tooltipHidden.update(() => false);
  console.log('context menu closed tooltip');
});

window.addEventListener('contextmenu', () => {
  tooltipHidden.update(() => true);
  console.log('context menu opened tooltip');
});
