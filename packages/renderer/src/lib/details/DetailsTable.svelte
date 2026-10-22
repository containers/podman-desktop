<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLTableSectionElement> {
  children: Snippet;
}

let { children, ...rest }: Props = $props();
</script>

<div class="flex px-5 py-4 flex-col items-start h-full overflow-auto text-[var(--pd-table-body-text)]">
  <table class="w-full">
    <tbody {...rest}>
      {@render children()}
    </tbody>
  </table>
</div>
