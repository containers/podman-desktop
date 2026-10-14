<script lang="ts">
import type { ColorInfo } from '@desktop-framework/api';

import { colorsInfos, darkContextColorsInfos, hcDarkContextColorsInfos } from '/@/stores/colors';

function toVars(infos: ColorInfo[]): string {
  return infos.map((color): string => `${color.cssVar}: ${color.value};`).join('\n    ');
}

$effect(() => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'podman-desktop-colors-styles';
  style.media = 'screen';
  style.textContent = `
  :root {
    ${toVars($colorsInfos)}
  }
  [data-pd-force-theme="dark"] {
    ${toVars($darkContextColorsInfos)}
  }
  [data-pd-force-theme="hc-dark"] {
    ${toVars($hcDarkContextColorsInfos)}
  }
`;
  document.head.append(style);
  return (): void => style.remove();
});
</script>
