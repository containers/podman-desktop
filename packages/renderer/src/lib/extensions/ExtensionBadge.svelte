<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import Badge from '/@/lib/ui/Badge.svelte';

export let extension: { type: 'dd' | 'pd'; removable: boolean };
</script>

<div class="flex flex-row gap-1 items-center {$$props.class}" role="region" aria-label="Extension Badge">
  {#if extension.type === 'dd'}
    <Tooltip right tip="Docker Desktop extension">
      <Badge class="text-[8px] text-white" color="bg-sky-600" label="Docker Desktop extension" />
    </Tooltip>
  {:else if !extension.removable}
    <Tooltip right tip="built-in Extension">
      <Badge class="text-[8px] text-charcoal-800" color="bg-sky-200" label="built-in Extension" />
    </Tooltip>
  {/if}
</div>
