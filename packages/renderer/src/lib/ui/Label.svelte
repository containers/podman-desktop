<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

export let name = '';
export let tip = '';
</script>

<Tooltip top tip="{tip}">
  <div class="flex items-center bg-[var(--pd-label-bg)] p-1 rounded-md text-xs text-[var(--pd-label-text)] gap-x-1">
    <slot></slot>
    <span class="capitalize">
      {name}
    </span>
  </div>
</Tooltip>
