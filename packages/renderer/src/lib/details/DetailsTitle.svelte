<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLTdAttributes } from 'svelte/elements';

interface Props extends HTMLTdAttributes {
  children: Snippet;
}

let { class: className, children, ...rest }: Props = $props();
</script>

<td class="pt-1 text-lg font-semibold text-[var(--pd-table-body-text-sub-secondary)] {className}" {...rest}>
  {@render children()}
</td>
