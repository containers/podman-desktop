<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

export let name = '';
export let tip = '';
export let capitalize = true;
export let role: string | undefined = undefined;
</script>

<Tooltip top tip="{tip}">
  <div
    role="{role}"
    class="flex items-center bg-[var(--pd-label-bg)] p-1 rounded-md text-xs text-[var(--pd-label-text)] gap-x-1">
    <slot></slot>
    <span class="{capitalize ? 'capitalize' : ''}">
      {name}
    </span>
  </div>
</Tooltip>
