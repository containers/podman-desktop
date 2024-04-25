<script lang="ts">
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import Tooltip from '/@/lib/ui/Tooltip.svelte';
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

export let extension: CombinedExtensionInfoUI;

export let displayIcon: boolean = true;

function openDetailsExtension() {
  router.goto(`/extensions/details/${encodeURIComponent(extension.id)}/`);
}
</script>

<Tooltip tip="{extension.name} extension details" top>
  <button aria-label="{extension.name} extension details" type="button" on:click="{() => openDetailsExtension()}">
    <div class="flex flex-row items-center">
      {#if displayIcon}
        <Fa icon="{faArrowUpRightFromSquare}" />
      {/if}
      <div class="text-left before:{$$props.class}">
        {extension.displayName} extension
      </div>
    </div>
  </button>
</Tooltip>
