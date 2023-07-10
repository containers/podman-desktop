<script lang="ts">
import TroubleshootingPageStoreDetails from './TroubleshootingPageStoreDetails.svelte';
import type { EventStoreInfo } from '/@/stores/event-store';

export let eventStoreInfo: EventStoreInfo;

let fetchInProgress = false;
async function fetch(): Promise<void> {
  fetchInProgress = true;
  try {
    await eventStoreInfo.fetch();
  } finally {
    fetchInProgress = false;
  }
}

let openDetails = false;
</script>

<div class="flex flex-col bg-charcoal-800 p-2 items-center rounded w-full">
  <div><svelte:component this="{eventStoreInfo.iconComponent}" size="20" /></div>
  <div class="text-xl">
    <button
      disabled="{fetchInProgress}"
      class="underline outline-none"
      title="Open Details"
      aria-label="Open Details"
      on:click="{() => (openDetails = true)}">
      {eventStoreInfo.name}
    </button>
  </div>
  <div class="text-sm">({eventStoreInfo.size} items)</div>
  <div class="">
    <button
      disabled="{fetchInProgress}"
      class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700 w-full"
      title="Refresh"
      aria-label="Refresh"
      on:click="{() => fetch()}">
      Refresh
    </button>
  </div>
  {#if eventStoreInfo.bufferEvents.length > 0}
    {@const lastUpdate = eventStoreInfo.bufferEvents[eventStoreInfo.bufferEvents.length - 1]}
    {#if lastUpdate.humanDuration}
      <div class="text-xs italic" title="Time to update">{lastUpdate.humanDuration}</div>
    {/if}
  {/if}

  {#if openDetails}
    <TroubleshootingPageStoreDetails
      closeCallback="{() => {
        openDetails = false;
      }}"
      eventStoreInfo="{eventStoreInfo}" />
  {/if}
</div>
