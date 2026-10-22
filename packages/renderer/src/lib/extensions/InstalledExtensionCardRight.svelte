<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionDetailsLink from './ExtensionDetailsLink.svelte';
import ExtensionUpdateLink from './ExtensionUpdateLink.svelte';

interface Props {
  extension: CombinedExtensionInfoUI;
}

let { extension }: Props = $props();
</script>

<div class="relative px-5 py-2" role="region" aria-label="Extension {extension.name} right actions">
  <ExtensionDetailsLink class="font-bold ml-2" extension={extension} />

  <div class="flex text-[var(--pd-content-text)]">
    {#if extension.description}
      {extension.description}
    {/if}
  </div>
  <div class="absolute bottom-0 flex flex-col text-[var(--pd-content-text)] text-sm">
    <div>
      {extension.removable ? '' : 'Pre-installed'}
    </div>
    <div aria-label="Version">
      {#if extension.version}
        v{extension.version}
        <ExtensionUpdateLink {extension} />
      {/if}
    </div>
  </div>
</div>
