<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import type { VolumeInfoUI } from './VolumeInfoUI';
import { fetchVolumesWithData, filtered, searchPattern, volumeListInfos } from '../../stores/volumes';
import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import { VolumeUtils } from './volume-utils';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import VolumeEmptyScreen from './VolumeEmptyScreen.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import VolumeActions from './VolumeActions.svelte';
import VolumeIcon from '../images/VolumeIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import Prune from '../engine/Prune.svelte';
import moment from 'moment';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Checkbox from '../ui/Checkbox.svelte';
import Button from '../ui/Button.svelte';
import { faPieChart, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let volumes: VolumeInfoUI[] = [];
let multipleEngines = false;
let enginesList: EngineInfoUI[];

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// number of selected items in the list
$: selectedItemsNumber = volumes.filter(volume => !volume.inUse).filter(volume => volume.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = volumes.filter(volume => !volume.inUse).every(volume => volume.selected);

const volumeUtils = new VolumeUtils();

let volumesUnsubscribe: Unsubscriber;
onMount(async () => {
  volumesUnsubscribe = filtered.subscribe(value => {
    const computedVolumes = value
      .map(volumeListInfo => volumeListInfo.Volumes)
      .flat()
      .map(volume => volumeUtils.toVolumeInfoUI(volume));

    // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
    const engines = computedVolumes.map(container => {
      return {
        name: container.engineName,
        id: container.engineId,
      };
    });
    // Remove duplicates from engines by name
    const uniqueEngines = engines.filter(
      (engine, index, self) => index === self.findIndex(t => t.name === engine.name),
    );
    if (uniqueEngines.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }
    // Set the engines to the global variable for the Prune functionality button
    enginesList = uniqueEngines;

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

    // compute refresh interval
    const interval = computeInterval();
    refreshTimeouts.push(setTimeout(refreshAge, interval));
  });
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (volumesUnsubscribe) {
    volumesUnsubscribe();
  }
});

function toggleAllVolumes(checked: boolean) {
  const toggleVolumes = volumes;
  // filter out all volumes used by a container
  toggleVolumes.filter(volume => !volume.inUse).forEach(volume => (volume.selected = checked));
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

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  volumes = volumes.map(volumeInfo => {
    return { ...volumeInfo, age: volumeUtils.refreshAge(volumeInfo) };
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshAge, newInterval));
}

function computeInterval(): number {
  // no volumes, no refresh
  if (volumes.length === 0) {
    return -1;
  }

  // do we have volumes that have been created in less than 1 minute
  // if so, need to update every second
  const volumesCreatedInLessThan1Mn = volumes.filter(volume => moment().diff(volume.created, 'minutes') < 1);
  if (volumesCreatedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for images created less than 1 hour
  const volumesCreatedInLessThan1Hour = volumes.filter(volume => moment().diff(volume.created, 'hours') < 1);
  if (volumesCreatedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for images created less than 1 day
  const volumesCreatedInLessThan1Day = volumes.filter(volume => moment().diff(volume.created, 'days') < 1);
  if (volumesCreatedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

let fetchDataInProgress = false;
async function fetchUsageData() {
  fetchDataInProgress = true;
  try {
    await fetchVolumesWithData();
  } finally {
    fetchDataInProgress = false;
  }
}

function gotoCreateVolume(): void {
  router.goto('/volumes/create');
}
</script>

<NavPage bind:searchTerm="{searchTerm}" title="volumes">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    {#if providerConnections.length > 0}
      <Button on:click="{() => gotoCreateVolume()}" icon="{faPlusCircle}">Create a volume</Button>
    {/if}
    {#if $volumeListInfos.map(volumeInfo => volumeInfo.Volumes).flat().length > 0}
      <Prune type="volumes" engines="{enginesList}" />

      <Button
        inProgress="{fetchDataInProgress}"
        on:click="{() => fetchUsageData()}"
        title="Collect usage data for volumes. It can take a while..."
        icon="{faPieChart}">Collect usage data</Button>
    {/if}
  </div>

  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedVolumes()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="flex min-w-full h-full" slot="content">
    <table class="mx-5 w-full h-fit" class:hidden="{volumes.length === 0}">
      <!-- title -->
      <thead class="sticky top-0 bg-charcoal-700 z-[2]">
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5">
            <Checkbox
              title="Toggle all"
              bind:checked="{selectedAllCheckboxes}"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              on:click="{event => toggleAllVolumes(event.detail)}" />
          </th>
          <th class="text-center font-extrabold w-10 px-2">status</th>
          <th class="w-10">Name</th>
          <th class="px-6 whitespace-nowrap">age</th>
          <th class="px-6 whitespace-nowrap text-end">size</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each volumes as volume}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="rounded-tl-lg rounded-bl-lg w-5"> </td>
            <td class="px-2">
              <Checkbox
                title="Toggle volume"
                bind:checked="{volume.selected}"
                disabled="{volume.inUse}"
                disabledTooltip="Volume is used by a container" />
            </td>
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <StatusIcon icon="{VolumeIcon}" status="{volume.inUse ? 'USED' : 'UNUSED'}" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsVolume(volume)}">
              <div class="flex items-center">
                <div class="">
                  <div class="flex flex-row items-center">
                    <div class="text-sm text-gray-300">{volume.shortName}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-900">
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
                <div class="text-sm text-gray-700">{volume.age}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex">
                <div class="w-full text-right text-sm text-gray-700">{volume.humanSize}</div>
              </div>
            </td>
            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <VolumeActions volume="{volume}" />
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.map(volumeInfo => volumeInfo.Volumes).flat().length === 0}
      {#if searchTerm.length > 0}
        <FilteredEmptyScreen icon="{VolumeIcon}" kind="volumes" bind:searchTerm="{searchTerm}" />
      {:else}
        <VolumeEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
