<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import Badge from '/@/lib/ui/Badge.svelte';

export let extension: { type: 'dd' | 'pd'; removable: boolean };
</script>

<div class="flex flex-row gap-1 items-center {$$props.class}" role="region" aria-label="Extension Badge">
  {#if extension.type === 'dd'}
    <Tooltip right>
      <svelte:fragment slot="content">
        <Badge class="text-[8px] text-white" color="bg-sky-600" label="Docker Desktop extension" />
      </svelte:fragment>
      <svelte:fragment slot="tip">
        <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
          Docker Desktop extension
        </div>
      </svelte:fragment>
    </Tooltip>
  {:else if !extension.removable}
    <Tooltip right>
      <svelte:fragment slot="content">
        <Badge class="text-[8px] text-charcoal-800" color="bg-sky-200" label="built-in Extension" />
      </svelte:fragment>
      <svelte:fragment slot="tip">
        <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
          built-in Extension
        </div>
      </svelte:fragment>
    </Tooltip>
  {/if}
</div>
