<script lang="ts">
import { providerInfos } from '../stores/providers';
import Fa from 'svelte-fa/src/fa.svelte';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import type { ProviderInfo } from '../../../preload/src/api/provider-info';

let waiting = false;

async function startProviderLifecycle(provider: ProviderInfo): Promise<void> {
  waiting = true;
  await window.startProviderLifecycle(provider.name);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  console.log('receive response from the server side: started');
  waiting = false;
}

async function stopProviderLifecycle(provider: ProviderInfo): Promise<void> {
  waiting = true;
  await window.stopProviderLifecycle(provider.name);
  console.log('receive response from the server side: stopped');
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  waiting = false;
}
</script>

<div class="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
  {#each $providerInfos as provider}
    <div class="rounded overflow-hidden shadow-lg m-5 bg-gray-700">
      <div class="px-6 py-4">
        <div class="font-bold text-gray-200 text-sm mb-2 h-10">{provider.name}</div>
        <div class="text-gray-300 text-sm h-5">
          {#if provider.lifecycle}
            Status: {provider.lifecycle.status}
          {/if}
        </div>
      </div>
      <div class="px-6 pt-4 pb-2 h-12">
        <div class="flex flex-row">
          {#if provider.lifecycle}
            <button
              type="button"
              on:click="{() => startProviderLifecycle(provider)}"
              class:hidden="{provider?.lifecycle?.status === 'started'}"
              class="text-white bg-violet-700 hover:bg-violet-800 disabled:hover:bg-gray-600 disabled:bg-gray-500 focus:ring-4 focus:ring-violet-400 font-medium rounded-lg text-xs px-3 py-1.5 text-center inline-flex items-center mr-2 ">
              {#if waiting === true}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              {:else}
                <Fa class="h-10 w-8 cursor-pointer rounded-full text-xl text-white" icon="{faPlayCircle}" />
              {/if}
              Start
            </button>
            <button
              type="button"
              on:click="{() => stopProviderLifecycle(provider)}"
              class:hidden="{provider?.lifecycle?.status !== 'started'}"
              class="text-white bg-violet-700 hover:bg-violet-800 disabled:hover:bg-gray-600 disabled:bg-gray-500 focus:ring-4 focus:ring-violet-400 font-medium rounded-lg text-xs px-3 py-1.5 text-center inline-flex items-center">
              {#if waiting === true}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              {:else}
                <Fa class="h-10 w-8 cursor-pointer rounded-full text-xl text-white" icon="{faStopCircle}" />
              {/if}
              Stop
            </button>
          {/if}
        </div>
      </div>

      <div class="px-6 py-6 flex-wrap font-thin break-words text-gray-400 text-xs">
        {#if provider.connection}
          Connection:
          {provider.connection}
        {/if}
      </div>
    </div>
  {/each}
</div>
