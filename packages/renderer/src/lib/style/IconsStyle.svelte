<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { iconsInfos } from '/@/stores/icons';

import type { FontDefinition } from '../../../../main/src/plugin/api/font-info';
import type { IconInfo } from '../../../../main/src/plugin/api/icon-info';

let style: HTMLStyleElement;

function createStyleSheet(): HTMLStyleElement {
  style = document.createElement('style');
  style.type = 'text/css';
  style.media = 'screen';

  document.head.append(style);

  style.textContent = '';

  return style;
}

onMount(() => {
  createStyleSheet();

  // update icon rules
  iconsInfos.subscribe(infos => {
    const styles: string[] = [];
    const fontsToAdd: FontDefinition[] = [];
    infos.forEach((icon: IconInfo) => {
      const id = icon.id;
      const iconDefinition = icon.definition;
      const fontContribution = iconDefinition.font;
      if (fontContribution) {
        if (!fontsToAdd.includes(fontContribution)) {
          fontsToAdd.push(fontContribution);
        }
        styles.push(
          `.podman-desktop-icon-${id}:before { content: '${
            iconDefinition.fontCharacter
          }'; font-family: '${fontContribution.fontId.replace(/'/g, '%27')}'; }`,
        );
      }
    });

    fontsToAdd.forEach(font => {
      const src = font.src.map(l => `${l.browserURL} format('${l.format}')`).join(', ');
      styles.push(
        `@font-face { src: ${src}; font-family: '${font.fontId.replace(/'/g, '%27')}'; font-display: block; }`,
      );
    });

    style.textContent = styles.join('\n');
  });
});

onDestroy(() => {
  // remove old style tag from the head
  style?.remove();
});
</script>
