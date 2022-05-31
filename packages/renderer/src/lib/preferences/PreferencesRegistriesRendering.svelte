<script lang="ts">
import { onMount } from 'svelte';
import type { Registry } from '@tmpwip/extension-api';
import { registriesInfos } from '../../stores/registries';
import PreferencesRegistriesCreateRegistryModal from './PreferencesRegistriesCreateRegistryModal.svelte';

let registries: readonly Registry[] = [];
onMount(() => {
  registriesInfos.subscribe(value => {
    registries = value;
  });
});

function removeRegistry(registry: Registry): void {
  window.unregisterImageRegistry(registry);
}

let showRegistryModal = false;
function toggleRegistryModal(): void {
  showRegistryModal = !showRegistryModal;
}
</script>

<div class="flex flex-1 flex-col p-2">
  <h1 class="capitalize text-xl">Registries</h1>

  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-x-4">
      {#each registries as registry}
        <div class="w-full p-4 md:w-60">
          <div class="p-2 bg-white rounded shadow-md">
            <div class="flex justify-end flex-wrap ">
              <button
                on:click="{() => removeRegistry(registry)}"
                class="inline-block text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-100 focus:outline-none rounded-lg text-sm p-1.5"
                type="button">
                <i class="fas fa-times " aria-hidden="true"></i>
              </button>
            </div>
            <div class="px-2">
              <h2 class="text-xl font-bold font-bol text-gray-800">{registry.serverUrl}</h2>
              <p class="text-small text-gray-600">{registry.username}</p>
              <p class="w-full font-extralight text-right text-xs text-gray-800">{registry.source}</p>
            </div>
          </div>
        </div>
      {/each}
      <div class="w-full p-4 md:w-60 md:h-60">
        <div
          on:click="{() => {
            toggleRegistryModal();
          }}"
          class="p-6 bg-white rounded shadow-md  hover:bg-gray-100 dark:hover:bg-gray-100 hover:cursor-pointer">
          <div class="px-2 text-center">
            <div class="text-3xl text-purple-800 fas fa-plus-circle" aria-hidden="true"></div>
            <h2 class="text-xl font-bold font-bol text-purple-800">Add registry</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showRegistryModal}
  <PreferencesRegistriesCreateRegistryModal toggleCallback="{toggleRegistryModal}" />
{/if}
