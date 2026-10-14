<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';

import ProviderWidget from '/@/lib/statusbar/ProviderWidget.svelte';
import { providerInfos } from '/@/stores/providers';
import { statusBarPinned } from '/@/stores/statusbar-pinned';

let pinned: Set<string> = $derived(
  new Set($statusBarPinned.filter(option => option.pinned).map(option => option.value)),
);

let providers: ProviderInfo[] = $derived($providerInfos.filter(provider => pinned.has(provider.id)));

function onclick(): void {
  window.executeCommand(STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU_COMMAND).catch(console.error);
}
</script>

{#if $statusBarPinned.length > 0}
  <!-- We cannot use <Fa> object here, as we detect click on this button and outside to toggle the menu -->
  <button
    data-task-button="Pin"
    onclick={onclick}
    class="px-1 py-px flex h-full items-center relative hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer z-1 fa-solid fa-thumbtack"
    title="Pin"
    aria-label="Pin">
  </button>
{/if}

{#each providers as entry, i (entry.id)}
  <ProviderWidget entry={entry} tooltipTopRight={i === 0}/>
{/each}
