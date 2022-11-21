<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import type { PodInfoUI } from './PodInfoUI';
import { filtered, searchPattern } from '../../stores/pods';
import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import { PodUtils } from './pod-utils';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import PodEmptyScreen from './PodEmptyScreen.svelte';
import PodIcon from '../container/PodIcon.svelte';
import PodActions from './PodActions.svelte';
import KubePlayButton from '../kube/KubePlayButton.svelte';

let searchTerm = '';
$: searchPattern.set(searchTerm);

let pods: PodInfoUI[] = [];
let multipleEngines = false;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

$: providerPodmanConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  // keep only podman providers as it is not supported by docker
  .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// number of selected items in the list
$: selectedItemsNumber = pods.filter(pod => pod.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = pods.every(pod => pod.selected);

let allChecked = false;

let podsUnsubscribe: Unsubscriber;
onMount(async () => {
  podsUnsubscribe = filtered.subscribe(value => {
    const podUtils = new PodUtils();

    const computedPods = value.map((podInfo: PodInfo) => podUtils.getPodInfoUI(podInfo)).flat();

    // multiple engines ?
    const engineNamesArray = computedPods.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }

    // update selected items based on current selected items
    computedPods.forEach(pod => {
      const matchingPod = pods.find(currentPod => currentPod.id === pod.id && currentPod.engineId === pod.engineId);
      if (matchingPod) {
        pod.selected = matchingPod.selected;
      }
    });
    pods = computedPods;
  });
});

onDestroy(() => {
  // unsubscribe from the store
  if (podsUnsubscribe) {
    podsUnsubscribe();
  }
});

function toggleAllPods(value: boolean) {
  const togglePods = pods;
  // filter out all images used by a container
  togglePods.forEach(pod => (pod.selected = value));
  pods = togglePods;
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedPods() {
  const selectedPods = pods.filter(pod => pod.selected);

  if (selectedPods.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedPods.map(async pod => {
        try {
          await window.removePod(pod.engineId, pod.id);
        } catch (e) {
          console.log('error while removing pod', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

function openDetailsPod(pod: PodInfoUI) {
  router.goto(`/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/summary`);
}

function openContainersFromPod(pod: PodInfoUI) {
  router.goto(`/containers/?filter=${pod.shortId}`);
}
</script>

<NavPage
  bind:searchTerm
  title="pods"
  subtitle="Hover over an pod to view action buttons; click to open up full details.">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </div>

  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => deleteSelectedPods()}"
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
    <table class="mx-5 w-full" class:hidden="{pods.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-500">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5"
            ><input
              type="checkbox"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              bind:checked="{allChecked}"
              on:click="{event => toggleAllPods(event.currentTarget.checked)}"
              class="cursor-pointer invert hue-rotate-[218deg] brightness-75" /></th>
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="text-center">Creation date</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody class="">
        {#each pods as pod}
          <tr class="group h-12 bg-zinc-900 hover:bg-zinc-700">
            <td class="rounded-tl-lg rounded-bl-lg w-5"> </td>
            <td class="px-2">
              <input
                type="checkbox"
                bind:checked="{pod.selected}"
                class="cursor-pointer invert hue-rotate-[218deg] brightness-75 " />
            </td>
            <td class="bg-zinc-900 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div
                class="border-2 flex flex-col justify-center align-middle m-3 p-1 w-10 text-center items-center rounded "
                class:border-green-600="{pod.status === 'RUNNING'}"
                class:border-orange-500="{pod.status === 'EXITED' || pod.status === 'DEGRADED'}"
                class:border-gray-400="{pod.status === 'CREATED'}"
                class:text-green-400="{pod.status === 'RUNNING'}"
                class:text-orange-500="{pod.status === 'EXITED' || pod.status === 'DEGRADED'}"
                class:text-gray-400="{pod.status === 'CREATED'}"
                title="{pod.status}">
                <PodIcon colorClasses="" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsPod(pod)}">
              <div class="flex items-center">
                <div class="">
                  <div class="flex flex-row items-center">
                    <div class="text-sm text-gray-200">{pod.name}</div>
                  </div>
                  <div class="flex flex-row items-center">
                    <div class="text-xs text-violet-400">{pod.shortId}</div>
                    <div
                      class="ml-1 text-xs font-extra-light text-gray-500"
                      class:cursor-pointer="{pod.containers.length > 0}"
                      on:click="{() => openContainersFromPod(pod)}">
                      {pod.containers.length} containers
                    </div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-500">
                    <!-- Hide in case of single engine-->
                    {#if multipleEngines}
                      <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-800 text-slate-400">
                        {pod.engineName}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-2 text-sm text-gray-200">{pod.humanCreationDate}</div>
              </div>
            </td>

            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <PodActions pod="{pod}" dropdownMenu="{true}" />
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <PodEmptyScreen pods="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen />
    {/if}
  </div>
</NavPage>
