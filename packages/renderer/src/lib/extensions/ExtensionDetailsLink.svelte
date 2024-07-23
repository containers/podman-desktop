<script lang="ts">
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

export let extension: CombinedExtensionInfoUI;

export let displayIcon: boolean = true;

function openDetailsExtension() {
  router.goto(`/extensions/details/${encodeURIComponent(extension.id)}/`);
}
</script>

<Tooltip top tip="{extension.name} extension details">
  <button aria-label="{extension.name} extension details" type="button" on:click={() => openDetailsExtension()}>
    <div class="flex flex-row items-center text-[var(--pd-content-header)]">
      {#if displayIcon}
        <Fa icon={faArrowUpRightFromSquare} />
      {/if}
      <div class="text-left before:{$$props.class}">
        {extension.displayName} extension
      </div>
    </div>
  </button>
</Tooltip>
