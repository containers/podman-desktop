<script lang="ts">
import { onMount } from 'svelte';
import type { Registry } from '@tmpwip/extension-api';
import { registriesInfos } from '../../stores/registries';
import Modal from '../dialogs/Modal.svelte';
import PreferencesRegistriesEditCreateRegistryModal from './PreferencesRegistriesEditCreateRegistryModal.svelte';

let registries: readonly Registry[] = [];
onMount(() => {
  registriesInfos.subscribe(value => {
    registries = value;
  });
});

function removeRegistry(registry: Registry): void {
  window.unregisterImageRegistry(registry);
  selectedRegistry = undefined;
}

let preferencesMode: 'edit' | 'create' = 'create';

let selectedRegistry: Registry | undefined;

function createRegistry(): void {
  preferencesMode = 'create';
  selectedRegistry = undefined;
  showRegistryModal = true;
}

function editRegistry(registry: Registry): void {
  preferencesMode = 'edit';
  selectedRegistry = registry;
  showRegistryModal = true;
}

let showEditRegistryModal = {
  registry: {
    serverUrl: '',
    source: '',
    username: '',
    secret: '',
  },
  value: false,
};
function toggleEditRegistryModal(): void {
  showEditRegistryModal.value = !showEditRegistryModal.value;
}

let showRegistryModal = false;
function toggleRegistryModal(): void {
  showRegistryModal = !showRegistryModal;
}
</script>

<div class="flex flex-1 flex-col p-2">
  <h1 class="capitalize text-xl">Registries</h1>

  <div class="container mx-auto pt-4">
    <div class="flex flex-wrap">
      {#each registries as registry}
        <div class="flex flex-col mr-4 mb-4 rounded-md shadow-md bg-zinc-700 w-52 h-28 sm:w-60 justify-center">
          <div class="text-right pr-4">
            <button
              on:click="{() => {
                editRegistry(registry);
              }}"
              class="text-gray-100 dark:text-gray-500 hover:bg-gray-600 dark:hover:bg-gray-600 rounded-full w-6"
              title="Edit registry"
              type="button">
              <i class="text-sm text-gray-100 fas fa-pen text-right" aria-hidden="true"></i>
            </button>
            <button
              on:click="{() => {
                removeRegistry(registry);
              }}"
              class="text-gray-100 dark:text-gray-500 hover:bg-gray-600 dark:hover:bg-gray-600 rounded-full w-6"
              title="Remove registry"
              type="button">
              <i class="text-sm text-gray-100 fas fa-times text-right" aria-hidden="true"></i>
            </button>
          </div>
          <h2 class="text-xl font-bold font-bol text-gray-100 truncate mx-4" title="{registry.serverUrl}">
            {registry.serverUrl}
          </h2>
          <p class="text-sm pl-4">{registry.username}</p>
          <p class="text-xs font-extralight text-right pr-4">{registry.source}</p>
        </div>
      {/each}

      <div
        on:click="{() => {
          createRegistry();
        }}"
        class="flex flex-col mr-4 mb-4 rounded-md shadow-md bg-zinc-700 hover:bg-gray-600 dark:hover:bg-gray-600 hover:cursor-pointer w-52 h-28 sm:w-60 justify-center text-center">
        <i class="text-3xl text-gray-100 fas fa-plus-circle" aria-hidden="true"></i>
        <h2 class="text-xl font-bold font-bol text-gray-100">Add registry</h2>
      </div>
    </div>
  </div>
</div>

{#if showRegistryModal}
  <Modal
    on:close="{() => {
      showRegistryModal = false;
    }}">
    <PreferencesRegistriesEditCreateRegistryModal
      toggleCallback="{toggleRegistryModal}"
      mode="{preferencesMode}"
      registry="{selectedRegistry}" />
  </Modal>
{/if}
