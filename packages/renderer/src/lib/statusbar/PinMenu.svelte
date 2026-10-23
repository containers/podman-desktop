<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  children?: Snippet;
}

let { children }: Props = $props();
</script>

<div
  class="fixed z-10 bottom-[26px] left-px"
  data-testid="pin-menu">
  <div
    title="Pin Menu"
    class="z-10 m-1 rounded-md shadow-lg bg-[var(--pd-dropdown-bg)] ring-2 ring-[var(--pd-dropdown-ring)] hover:ring-[var(--pd-dropdown-hover-ring)] divide-y divide-[var(--pd-dropdown-divider)] focus:outline-hidden">
    {@render children?.()}
  </div>
</div>
