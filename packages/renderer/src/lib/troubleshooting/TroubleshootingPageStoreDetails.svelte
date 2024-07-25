<script lang="ts">
import { faRefresh, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { EventStoreInfo } from '/@/stores/event-store';

import Dialog from '../dialogs/Dialog.svelte';

export let closeCallback: () => void;

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
</script>

<Dialog title="Details of {eventStoreInfo.name}" on:close={() => closeCallback()}>
  <svelte:component this={eventStoreInfo.iconComponent} slot="icon" size="20" />

  <div slot="content" class="inline-block w-full overflow-hidden overflow-y-auto text-left transition-all">
    <div class="flex flex-col rounded-lg">
      <div class="bg-[var(--pd-card-bg)] text-[var(--pd-card-text)] w-full p-4 mb-4">
        <div class="pb-2 text-lg">Info:</div>

        <div class="mx-2 flex flex-row items-center">
          Size: <div role="status" aria-label="size">{eventStoreInfo.size}</div>
          <div class="mx-2">
            <Button class="my-1" bind:inProgress={fetchInProgress} on:click={() => fetch()} icon={faRefresh}
              >Refresh</Button>
          </div>
        </div>
      </div>

      <!-- Display buffer events-->
      <div class="pb-4">
        <div class="bg-[var(--pd-card-bg)] text-[var(--pd-card-text)] w-full p-4 h-45">
          <div class="pb-2 text-lg">
            Updating events:
            {#if eventStoreInfo.bufferEvents.length > 0}
              <Button
                class="my-1"
                bind:inProgress={fetchInProgress}
                title="Clear events"
                on:click={() => eventStoreInfo.clearEvents()}
                icon={faTrash}>Clear</Button>
            {/if}
          </div>
          {#if eventStoreInfo.bufferEvents.length > 0}
            {@const reverseOrderedBufferEvents = [...eventStoreInfo.bufferEvents].reverse()}

            <ul class="h-32 overflow-auto list-disc list-inside text-xs" aria-label="buffer-events">
              {#each reverseOrderedBufferEvents as bufferEvent}
                <li aria-label={bufferEvent.name}>
                  {#if bufferEvent.skipped}
                    Skipped event
                  {:else}
                    Grab {bufferEvent.length} items from
                  {/if}

                  '{bufferEvent.name}' event
                  {#if bufferEvent.args?.length > 0}
                    ({bufferEvent.args})
                  {/if}

                  {humanizeDuration(moment().diff(bufferEvent.date), { round: true, largest: 1 })} ago.

                  {#if bufferEvent.humanDuration}
                    Took {bufferEvent.humanDuration}.
                  {/if}

                  {#if bufferEvent.skipped}
                    (ignoring)
                  {/if}
                </li>
              {/each}
            </ul>
          {:else}
            <div class="h-32 flex flex-row mx-auto text-xs text-gray-800 text-center">No buffer events</div>
          {/if}
        </div>
      </div>

      <div class="text-xs text-gray-800 mt-2 text-center">Track events that have updated the store</div>
    </div>
  </div>
  <svelte:fragment slot="buttons">
    <Button aria-label="Cancel" class="mr-3" type="link" on:click={() => closeCallback()}>Cancel</Button>
    <Button aria-label="OK" on:click={() => closeCallback()}>OK</Button>
  </svelte:fragment>
</Dialog>
