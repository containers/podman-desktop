<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import type { PodInfoUI } from './PodInfoUI';
import { filtered, searchPattern, podsInfos } from '../../stores/pods';
import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import { PodUtils } from './pod-utils';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import PodEmptyScreen from './PodEmptyScreen.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import PodIcon from '../images/PodIcon.svelte';
import PodActions from './PodActions.svelte';
import KubePlayButton from '../kube/KubePlayButton.svelte';
import moment from 'moment';
import Tooltip from '../ui/Tooltip.svelte';
import Prune from '../engine/Prune.svelte';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Checkbox from '../ui/Checkbox.svelte';
import Button from '../ui/Button.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import StateChange from '../ui/StateChange.svelte';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let pods: PodInfoUI[] = [];
let enginesList: EngineInfoUI[];

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

const podUtils = new PodUtils();

let podsUnsubscribe: Unsubscriber;
onMount(async () => {
  podsUnsubscribe = filtered.subscribe(value => {
    const computedPods = value.map((podInfo: PodInfo) => podUtils.getPodInfoUI(podInfo)).flat();

    // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
    const engines = computedPods.map(container => {
      return {
        name: container.engineName,
        id: container.engineId,
      };
    });

    // Remove duplicates from engines by name
    // Set the engines to the global variable for the Prune functionality button
    enginesList = engines.filter((engine, index, self) => index === self.findIndex(t => t.name === engine.name));

    // update selected items based on current selected items
    computedPods.forEach(pod => {
      const matchingPod = pods.find(currentPod => currentPod.id === pod.id && currentPod.engineId === pod.engineId);
      if (matchingPod) {
        pod.selected = matchingPod.selected;
      }
    });
    pods = computedPods;

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
  if (podsUnsubscribe) {
    podsUnsubscribe();
  }
});

function toggleAllPods(checked: boolean) {
  const togglePods = pods;
  togglePods.forEach(pod => (pod.selected = checked));
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
          if (pod.kind === 'podman') {
            await window.removePod(pod.engineId, pod.id);
          } else {
            await window.kubernetesDeletePod(pod.name);
          }
        } catch (e) {
          console.log('error while removing pod', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

function openDetailsPod(pod: PodInfoUI) {
  router.goto(`/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/logs`);
}

function openContainersFromPod(pod: PodInfoUI) {
  router.goto(`/containers/?filter=${pod.shortId}`);
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  pods = pods.map(podInfo => {
    return { ...podInfo, age: podUtils.refreshAge(podInfo) };
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshAge, newInterval));
}

function computeInterval(): number {
  // no pods, no refresh
  if (pods.length === 0) {
    return -1;
  }

  // do we have pods that have been created in less than 1 minute
  // if so, need to update every second
  const podsCreatedInLessThan1Mn = pods.filter(pod => moment().diff(pod.created, 'minutes') < 1);
  if (podsCreatedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for pods created less than 1 hour
  const podsCreatedInLessThan1Hour = pods.filter(volume => moment().diff(volume.created, 'hours') < 1);
  if (podsCreatedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for pods created less than 1 day
  const podsCreatedInLessThan1Day = pods.filter(volume => moment().diff(volume.created, 'days') < 1);
  if (podsCreatedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

function inProgressCallback(pod: PodInfoUI, inProgress: boolean, state?: string): void {
  pod.actionInProgress = inProgress;
  // reset error when starting task
  if (inProgress) {
    pod.actionError = '';
  }
  if (state) {
    pod.status = state;
  }

  pods = [...pods];
}

function errorCallback(pod: PodInfoUI, errorMessage: string): void {
  pod.actionError = errorMessage;
  pod.status = 'ERROR';
  pods = [...pods];
}
</script>

<NavPage bind:searchTerm="{searchTerm}" title="pods">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    {#if $podsInfos.length > 0}
      <Prune type="pods" engines="{enginesList}" />
    {/if}
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </div>

  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedPods()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="flex min-w-full h-full" slot="content">
    <table class="mx-5 w-full h-fit" class:hidden="{pods.length === 0}">
      <!-- title -->
      <thead class="sticky top-0 bg-charcoal-700 z-[2]">
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5">
            <Checkbox
              title="Toggle all"
              bind:checked="{selectedAllCheckboxes}"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              on:click="{checked => toggleAllPods(checked.detail)}" />
          </th>
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="whitespace-nowrap px-6">age</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each pods as pod}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="rounded-tl-lg rounded-bl-lg w-5"> </td>
            <td class="px-2">
              <Checkbox title="Toggle pod" bind:checked="{pod.selected}" />
            </td>
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <StatusIcon icon="{PodIcon}" status="{pod.status}" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsPod(pod)}">
              <div class="flex items-center">
                <div class="">
                  <div class="flex flex-row items-center">
                    <div class="text-sm text-gray-300">{pod.name}</div>
                  </div>
                  <div class="flex flex-row items-center">
                    <div class="text-xs text-violet-400">{pod.shortId}</div>
                    <button
                      class="ml-1 text-xs font-extra-light text-gray-900"
                      class:cursor-pointer="{pod.containers.length > 0}"
                      on:click="{() => openContainersFromPod(pod)}">
                      {pod.containers.length} container{pod.containers.length > 1 ? 's' : ''}
                    </button>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-900">
                    <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-800 text-slate-400">
                      {pod.engineName}{#if pod.kind === 'kubernetes'}<div class="ml-1">
                          <Tooltip tip="{pod.engineId}" top>{pod.engineId.substring(0, 16)}</Tooltip>
                        </div>{/if}
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-700">
                  <StateChange state="{pod.status}">{pod.age}</StateChange>
                </div>
              </div>
            </td>

            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <div class="flex w-full">
                <div class="flex items-center w-5">
                  {#if pod.actionError}
                    <ErrorMessage error="{pod.actionError}" icon />
                  {:else}
                    <div>&nbsp;</div>
                  {/if}
                </div>
                <div class="text-right w-full">
                  <PodActions
                    pod="{pod}"
                    errorCallback="{error => errorCallback(pod, error)}"
                    inProgressCallback="{(flag, state) => inProgressCallback(pod, flag, state)}"
                    dropdownMenu="{true}" />
                </div>
              </div>
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>

    {#if $filtered.length === 0 && providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{PodIcon}" kind="pods" bind:searchTerm="{searchTerm}" />
      {:else}
        <PodEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
