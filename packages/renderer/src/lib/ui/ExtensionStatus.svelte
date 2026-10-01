<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';

import { ExtensionStatusMapper } from './extension-status';
import StatusDotIcon from './StatusDotIcon.svelte';

interface Props extends HTMLAttributes<HTMLDivElement> {
  status: string;
}

let { status, class: className = '', ...restProps }: Props = $props();

const mapper = new ExtensionStatusMapper();
const presentation = $derived(mapper.getPresentation(status));
</script>

<div
  role="status"
  aria-label="Extension status"
  class="flex min-w-0 max-w-full items-center gap-1.5 {className}"
  {...restProps}>
  <span class="inline-flex w-3 shrink-0 items-center justify-center">
    <StatusDotIcon status={presentation.icon} size="12" decorative />
  </span>
  <span class="min-w-0 truncate {presentation.labelClass}">
    {presentation.label}
  </span>
</div>
