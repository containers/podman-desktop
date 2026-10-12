<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import type { HTMLAttributes } from 'svelte/elements';

import Badge from '/@/lib/ui/Badge.svelte';

interface Props extends HTMLAttributes<HTMLDivElement> {
  extension: { type: 'dd' | 'pd'; removable: boolean; devMode: boolean; bundled: boolean };
}

let { extension, class: className = '', ...restProps }: Props = $props();
</script>

<div class="flex flex-row gap-1 items-center {className}" role="region" aria-label="Extension Badge" {...restProps}>
  {#if extension.type === 'dd'}
    <Tooltip right tip="Docker Desktop extension">
      <Badge class="text-[8px] text-(--pd-badge-dd-extension-text)" color="bg-(--pd-badge-dd-extension-bg)" label="Docker Desktop extension" />
    </Tooltip>
  {:else if extension.devMode}
    <Tooltip right tip="In Development Mode Extension">
      <Badge class="text-[8px] text-(--pd-badge-text)" color="bg-(--pd-badge-devmode-extension-bg)" label="devMode Extension" />
    </Tooltip>
  {:else if extension.bundled}
    <Tooltip right tip="Bundled extension">
      <Badge class="text-[8px] text-(--pd-badge-text)" color="bg-(--pd-badge-bundled-extension-bg)" label="Bundled extension" />
    </Tooltip>
  {/if}
</div>
