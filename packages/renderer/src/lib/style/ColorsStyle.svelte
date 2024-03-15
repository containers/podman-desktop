<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { colorsInfos } from '/@/stores/colors';

import type { ColorInfo } from '../../../../main/src/plugin/api/color-info';

let style: HTMLStyleElement;

let unsubscribe: Unsubscriber;

function createStyleSheet(): HTMLStyleElement {
  style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'podman-desktop-colors-styles';
  style.media = 'screen';

  document.head.append(style);

  style.textContent = '';

  return style;
}

onMount(() => {
  createStyleSheet();

  // update icon rules
  unsubscribe = colorsInfos.subscribe(infos => {
    const styles: string[] = [];
    infos.forEach((color: ColorInfo) => {
      const cssVar = color.cssVar;
      const colorValue = color.value;

      styles.push(`${cssVar}: ${colorValue};`);
    });

    style.textContent = `
  :root {
    ${styles.join('\n')}
  }
`;
  });
});

onDestroy(() => {
  // remove old style tag from the head
  style?.remove();

  unsubscribe?.();
});
</script>
