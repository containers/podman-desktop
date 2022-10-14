<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import type { VolumeInfoUI } from './VolumeInfoUI';
import { filtered, searchPattern, volumeListInfos } from '../../stores/volumes';
import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import { VolumeUtils } from './volume-utils';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import VolumeEmptyScreen from './VolumeEmptyScreen.svelte';
import VolumeActions from './VolumeActions.svelte';
import VolumeIcon from './VolumeIcon.svelte';

let searchTerm = '';
$: searchPattern.set(searchTerm);

let volumes: VolumeInfoUI[] = [];
let multipleEngines = false;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// number of selected items in the list
$: selectedItemsNumber = volumes.filter(volume => volume.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = volumes.every(volume => volume.selected);

let allChecked = false;

let volumesUnsubscribe: Unsubscriber;
onMount(async () => {
  volumesUnsubscribe = filtered.subscribe(value => {
    const volumeUtils = new VolumeUtils();

    // keep warnings
    const warningsPerEngine = new Map<string, string[]>();
    value.forEach(volumeListInfo => {
      warningsPerEngine.set(volumeListInfo.engineId, volumeListInfo.Warnings);
    });
    const computedVolumes = value
      .map(volumeListInfo => volumeListInfo.Volumes)
      .flat()
      .map(volume => volumeUtils.toVolumeInfoUI(volume));

    // multiple engines ?
    const engineNamesArray = computedVolumes.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }

    // update selected items based on current selected items
    computedVolumes.forEach(volume => {
      const matchingVolume = volumes.find(
        currentVolume => currentVolume.name === volume.name && currentVolume.engineId === volume.engineId,
      );
      if (matchingVolume) {
        volume.selected = matchingVolume.selected;
      }
    });
    volumes = computedVolumes;
  });
});

onDestroy(() => {
  // unsubscribe from the store
  if (volumesUnsubscribe) {
    volumesUnsubscribe();
  }
});

function toggleAllVolumes(value: boolean) {
  const toggleVolumes = volumes;
  // filter out all volumes used by a container
  toggleVolumes.filter(volume => !volume.inUse).forEach(volume => (volume.selected = value));
  volumes = toggleVolumes;
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedVolumes() {
  const selectedVolumes = volumes.filter(volume => volume.selected);

  if (selectedVolumes.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedVolumes.map(async volume => {
        try {
          await window.removeVolume(volume.engineId, volume.name);
        } catch (e) {
          console.log('error while removing volume', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

function openDetailsVolume(volume: VolumeInfoUI) {
  router.goto(`/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary`);
}
</script>

<NavPage
  bind:searchTerm
  title="Volumes"
  subtitle="Hover over a volume to view action buttons; click to open up full details.">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap"></div>

  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => deleteSelectedVolumes()}"
        title="Delete {selectedItemsNumber} selected items"
        type="button">
        <span class="pf-c-button__icon pf-m-start">
          {#if bulkDeleteInProgress}
            <div class="mr-4">
              <i class="pf-c-button__progress">
                <span class="pf-c-spinner pf-m-md" role="progressbar">
                  <span class="pf-c-spinner__clipper"></span>
                  <span class="pf-c-spinner__lead-ball"></span>
                  <span class="pf-c-spinner__tail-ball"></span>
                </span>
              </i>
            </div>
          {:else}
            <i class="fas fa-trash" aria-hidden="true"></i>
          {/if}
        </span>
      </button>
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="min-w-full flex" slot="table">
    <table class="mx-5 w-full" class:hidden="{volumes.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-500">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5"
            ><input
              type="checkbox"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              bind:checked="{allChecked}"
              on:click="{event => toggleAllVolumes(event.currentTarget.checked)}"
              class="cursor-pointer invert hue-rotate-[218deg] brightness-75" /></th>
          <th class="text-center font-extrabold w-10">status</th>
          <th class="text-center font-extrabold w-10">Name</th>
          <th class="text-center">Creation date</th>
          <th class="px-6 whitespace-nowrap text-end">size</th>
          <th class="text-center">actions</th>
        </tr>
      </thead>
      <tbody class="">
        {#each volumes as volume}
          <tr class="group h-12 bg-zinc-900 hover:bg-zinc-700">
            <td class="rounded-tl-lg rounded-bl-lg w-5"> </td>
            <td class="px-2">
              <input
                type="checkbox"
                bind:checked="{volume.selected}"
                disabled="{volume.inUse}"
                class:cursor-pointer="{!volume.inUse}"
                class:cursor-not-allowed="{volume.inUse}"
                class:opacity-10="{volume.inUse}"
                title="{volume.inUse ? 'Volume is used by a container' : ''}"
                class="cursor-pointer invert hue-rotate-[218deg] brightness-75 " />
            </td>
            <td class="bg-zinc-900 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <VolumeIcon inUse="{volume.inUse}" />
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsVolume(volume)}">
              <div class="flex items-center">
                <div class="">
                  <div class="flex flex-row items-center">
                    <div class="text-sm text-gray-200">{volume.shortName}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-500">
                    <!-- Hide in case of single engine-->
                    {#if multipleEngines}
                      <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-800 text-slate-400">
                        {volume.engineName}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-2 text-sm text-gray-200">{volume.humanCreationDate}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex">
                <div class="w-full text-right text-sm text-gray-200">{volume.humanSize}</div>
              </div>
            </td>
            <td class="px-6 whitespace-nowrap rounded-tr-lg rounded-br-lg ">
              <div class="flex opacity-0 flex-row justify-end group-hover:opacity-100">
                <VolumeActions volume="{volume}" />
              </div>
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <VolumeEmptyScreen volumes="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen />
    {/if}
  </div>
</NavPage>
