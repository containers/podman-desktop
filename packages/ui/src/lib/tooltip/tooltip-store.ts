import { writable } from 'svelte/store';

export const tooltipHidden = writable(false);

window.addEventListener('tooltip-show', () => {
  tooltipHidden.update(() => false);
});

window.addEventListener('tooltip-hide', () => {
  tooltipHidden.update(() => true);
});
