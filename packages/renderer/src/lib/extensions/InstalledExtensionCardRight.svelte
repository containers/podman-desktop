<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionDetailsLink from './ExtensionDetailsLink.svelte';

export let extension: CombinedExtensionInfoUI;
</script>

<div class="relative px-5 py-2" role="region" aria-label="Extension {extension.name} right actions">
  <ExtensionDetailsLink class="font-bold text-base ml-2" extension="{extension}" />

  <div class="flex text-sm text-gray-700" aria-label="">
    {#if extension.description}
      {extension.description}
    {/if}
  </div>
  <div class="absolute bottom-0 flex flex-col text-gray-700 text-xs" aria-label="">
    <div>
      {extension.removable ? '' : 'Podman Desktop built-in extension'}
    </div>
    <div>
      {#if extension.version}
        v{extension.version}
      {/if}
    </div>
  </div>
</div>
