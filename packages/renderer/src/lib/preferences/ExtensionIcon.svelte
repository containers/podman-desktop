<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';

export let extension: ExtensionInfo;

let icon: string | undefined = undefined;
$: {
  if (extension.icon) {
    if (typeof extension.icon === 'string') {
      icon = extension.icon;
    } else if (extension.icon.dark) {
      // for now use dark theme
      icon = extension.icon.dark;
    }
  }
}
$: fade = extension.state !== 'started' ? ' brightness-50' : '';
</script>

{#if icon}
  <img src="{icon}" alt="{extension.name}" class="max-w-10 max-h-10 {fade}" />
{:else}
  <Fa class="h-10 w-10 rounded-full text-violet-600 {fade}" size="1.6x" icon="{faPuzzlePiece}" />
{/if}
