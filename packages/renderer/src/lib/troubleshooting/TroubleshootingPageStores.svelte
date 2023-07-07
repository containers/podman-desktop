<script lang="ts">
import { onMount, onDestroy } from 'svelte';

import { type Unsubscriber } from 'svelte/store';
import type { EventStoreInfo } from '/@/stores/event-store';
import { allEventStoresInfo } from '/@/stores/event-store-manager';
import TroubleshootingPageStore from './TroubleshootingPageStore.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

let allEventstores: EventStoreInfo[] = [];

let allEventsUnsubscriber: Unsubscriber;

onMount(() => {
  allEventsUnsubscriber = allEventStoresInfo.subscribe(value => {
    // sort the store
    value.sort((a, b) => a.name.localeCompare(b.name));
    allEventstores = value;
  });
});

onDestroy(() => {
  allEventsUnsubscriber?.();
});
</script>

<div class="flex flex-col bg-zinc-700 m-4 p-4">
  <div class="flex flex-row align-middle items-center w-full mb-4">
    <Fa size="40" icon="{faDatabase}" />
    <h2 class="mx-2 text-xl">Stores</h2>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
    {#each allEventstores as eventStore (eventStore.name)}
      <TroubleshootingPageStore eventStoreInfo="{eventStore}" />
    {/each}
  </div>
</div>
