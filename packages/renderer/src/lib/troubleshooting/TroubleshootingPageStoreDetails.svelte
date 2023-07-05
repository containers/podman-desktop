<script lang="ts">
import Modal from '../dialogs/Modal.svelte';
import type { EventStoreInfo } from '/@/stores/event-store';

import moment from 'moment';
import humanizeDuration from 'humanize-duration';

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

<Modal name="Details of {eventStoreInfo.name}" on:close="{() => closeCallback()}">
  <div
    class="inline-block w-full overflow-hidden text-left transition-all transform bg-charcoal-600 z-50 rounded-xl shadow-xl shadow-neutral-900">
    <div class="flex items-center justify-between px-5 py-4 mb-4">
      <h1 class="text-md font-semibold">
        <div class="flex flex-row items-center">
          <svelte:component this="{eventStoreInfo.iconComponent}" size="20" />
          <div class="mx-2">Details of {eventStoreInfo.name} store</div>
        </div>
      </h1>
      <button class="hover:text-gray-300 px-2 py-1" aria-label="Close" on:click="{() => closeCallback()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
    <div class="overflow-y-auto px-4 pb-4">
      <div class="flex flex-col rounded-lg">
        <div class="bg-charcoal-800 w-full p-4 mb-4">
          <div class="pb-2 text-lg">Info:</div>

          <div class="mx-2 flex flex-row items-center">
            Size: <div role="status" aria-label="size">{eventStoreInfo.size}</div>
            <div class="mx-2">
              <button
                disabled="{fetchInProgress}"
                class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700"
                title="Refresh"
                on:click="{() => fetch()}">
                Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Display buffer events-->
        <div class="pb-4">
          <div class="bg-charcoal-800 w-full p-4 h-45">
            <div class="pb-2 text-lg">
              Updating events:
              {#if eventStoreInfo.bufferEvents.length > 0}
                <button
                  disabled="{fetchInProgress}"
                  class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700"
                  title="Refresh"
                  on:click="{() => eventStoreInfo.clearEvents()}">
                  Clear events
                </button>
              {/if}
            </div>
            {#if eventStoreInfo.bufferEvents.length > 0}
              {@const reverseOrderedBufferEvents = [...eventStoreInfo.bufferEvents].reverse()}

              <ul class="h-32 overflow-auto list-disc list-inside text-xs" aria-label="buffer-events">
                {#each reverseOrderedBufferEvents as bufferEvent}
                  <li aria-label="{bufferEvent.name}">
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
        <div class="flex flex-row justify-end w-full pt-2">
          <button aria-label="Cancel" class="text-xs hover:underline mr-3" on:click="{() => closeCallback()}"
            >Cancel</button>
          <button class="pf-c-button pf-m-primary" type="button" aria-label="Next" on:click="{() => closeCallback()}"
            >OK</button>
        </div>
      </div>
    </div>
  </div></Modal>
