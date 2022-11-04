<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import ContainerIcon from './ContainerIcon.svelte';
import EngineIcon from './EngineIcon.svelte';
import type { PodInfoUI } from '../pod/PodInfoUI';
import { router } from 'tinro';
import { ContainerGroupInfoTypeUI, ContainerGroupInfoUI, ContainerInfoUI } from './container/ContainerInfoUI';
import ContainerActions from './container/ContainerActions.svelte';
import PodActions from './pod/PodActions.svelte';
import ContainerEmptyScreen from './container/ContainerEmptyScreen.svelte';
import Modal from './dialogs/Modal.svelte';
import { ContainerUtils } from './container/container-utils';
import { providerInfos } from '../stores/providers';
import NoContainerEngineEmptyScreen from './image/NoContainerEngineEmptyScreen.svelte';
import moment from 'moment';
import type { Unsubscriber } from 'svelte/store';
import NavPage from './ui/NavPage.svelte';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import ContainerGroupIcon from './container/ContainerGroupIcon.svelte';
import { podCreationHolder } from '../stores/creation-from-containers-store';
import KubePlayButton from './kube/KubePlayButton.svelte';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;

// groups of containers that will be displayed
let containerGroups: ContainerGroupInfoUI[] = [];
export let searchTerm = '';
$: searchPattern.set(searchTerm);

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

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
$: selectedItemsNumber =
  containerGroups.reduce(
    (previous, current) => previous + current.containers.filter(container => container.selected).length,
    0,
  ) + containerGroups.filter(group => group.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes =
  containerGroups.filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE).every(group => group.selected) &&
  containerGroups
    .map(group => group.containers)
    .flat()
    .every(container => container.selected);

let refreshTimeouts: NodeJS.Timeout[] = [];

const SECOND = 1000;
function refreshUptime() {
  containerGroups = containerGroups.map(containerGroupUiInfo => {
    containerGroupUiInfo.containers = containerGroupUiInfo.containers.map(containerUiInfo => {
      return { ...containerUiInfo, uptime: containerUtils.refreshUptime(containerUiInfo) };
    });
    return containerGroupUiInfo;
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshUptime, newInterval));
}

function computeInterval(): number {
  const allContainers = containerGroups.map(group => group.containers).flat();
  // no container running, no refresh
  if (!allContainers.some(container => container.state === 'RUNNING')) {
    return -1;
  }

  // limit to containers running
  const runningContainers = allContainers.filter(container => container.state === 'RUNNING');

  // do we have containers that have been started in less than 1 minute
  // if so, need to update every second
  const containersStartedInLessThan1Mn = runningContainers.filter(
    container => moment().diff(container.startedAt, 'minutes') < 1,
  );
  if (containersStartedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for containers started less than 1 hour
  const containersStartedInLessThan1Hour = runningContainers.filter(
    container => moment().diff(container.startedAt, 'hours') < 1,
  );
  if (containersStartedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for containers started less than 1 day
  const containersStartedInLessThan1Day = runningContainers.filter(
    container => moment().diff(container.startedAt, 'days') < 1,
  );
  if (containersStartedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

function toggleCheckboxContainerGroup(value: boolean, containerGroup: ContainerGroupInfoUI) {
  // need to apply that on all containers
  containerGroup.containers.forEach(container => (container.selected = value));
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedContainers() {
  const selectedContainers = containerGroups
    .map(group => group.containers)
    .flat()
    .filter(container => container.selected);

  if (selectedContainers.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedContainers.map(async container => {
        try {
          await window.deleteContainer(container.engineId, container.id);
        } catch (e) {
          console.log('error while removing container', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

function createPodFromContainers() {
  const selectedContainers = containerGroups
    .map(group => group.containers)
    .flat()
    .filter(container => container.selected);

  const podCreation = {
    name: 'my-pod',
    containers: selectedContainers.map(container => {
      return { id: container.id, name: container.name, engineId: container.engineId, ports: container.ports };
    }),
  };

  // update the store
  podCreationHolder.set(podCreation);

  // redirect to pod creation page
  router.goto('/pod-create-from-containers');
}

let containersUnsubscribe: Unsubscriber;
onMount(async () => {
  containersUnsubscribe = filtered.subscribe(value => {
    const currentContainers = value.map((containerInfo: ContainerInfo) => {
      return containerUtils.getContainerInfoUI(containerInfo);
    });

    // multiple engines ?
    const engineNamesArray = currentContainers.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }

    // create groups
    const computedContainerGroups = containerUtils.getContainerGroups(currentContainers);

    // update selected items based on current selected items
    computedContainerGroups.forEach(group => {
      const matchingGroup = containerGroups.find(currentGroup => currentGroup.name === group.name);
      if (matchingGroup) {
        group.selected = matchingGroup.selected;
        group.containers.forEach(container => {
          const matchingContainer = matchingGroup.containers.find(
            currentContainer => currentContainer.id === container.id,
          );
          if (matchingContainer) {
            container.selected = matchingContainer.selected;
          }
        });
      }
    });

    // update the value
    containerGroups = computedContainerGroups;

    // compute refresh interval
    const interval = computeInterval();
    refreshTimeouts.push(setTimeout(refreshUptime, interval));
  });
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (containersUnsubscribe) {
    containersUnsubscribe();
  }
});

function openDetailsContainer(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/logs`);
}

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCreateContainer();
  }
}

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function runContainerYaml(): void {
  router.goto('/containers/play');
}

function fromDockerfile(): void {
  openChoiceModal = false;
  router.goto('/images/build');
}

function toggleContainerGroup(containerGroup: ContainerGroupInfoUI) {
  containerGroup.expanded = !containerGroup.expanded;
  // update the group expanded attribute if this is the matching group
  containerGroups = containerGroups.map(group => (group.name === containerGroup.name ? containerGroup : group));
}

function toggleAllContainerGroups(value: boolean) {
  const toggleContainers = containerGroups;
  toggleContainers
    .filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE)
    .forEach(group => (group.selected = value));
  toggleContainers.forEach(group => group.containers.forEach(container => (container.selected = value)));
  containerGroups = toggleContainers;
}
</script>

<!-- NavPage information -->
<NavPage
  bind:searchTerm
  title="containers"
  subtitle="Hover over a container to view action buttons; click to open up full details.">
  <!-- All additional actions (create container, kubernetes, etc.) -->
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    <!-- Create container button -->
    <button on:click="{() => toggleCreateContainer()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-plus-circle" aria-hidden="true"></i>
      </span>
      Create container
    </button>

    <!-- Create Kubernetes button -->
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </div>

  <!-- Additional actions (deleting multiple selected items)-->
  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    <!-- Button for deleting multiple objects-->
    {#if selectedItemsNumber > 0}
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => deleteSelectedContainers()}"
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

      <!-- Spacer -->
      <div class="px-1"></div>

      <!-- Button for creating a pod with selected containers -->
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => createPodFromContainers()}"
        title="Create Pod with {selectedItemsNumber} selected items"
        type="button">
        <i class="fas fa-cubes" aria-hidden="true"></i>
      </button>

      <!-- Show how many selected items-->
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <!-- Start of the table -->

  <div class="min-w-full flex relative" slot="table">
    <table class="table-auto mx-5 w-full" class:hidden="{containerGroups.length === 0}">
      <!-- TABLE HEAD -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-500">
          <th class="whitespace-nowrap w-1"></th>
          <th class="px-2 w-5"
            ><input
              type="checkbox"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              bind:checked="{selectedAllCheckboxes}"
              on:click="{event => toggleAllContainerGroups(event.currentTarget.checked)}"
              class="cursor-pointer invert hue-rotate-[218deg] bg-white-100 rounded-sm" /></th>
          <th class="px-1 w-1 text-center"></th>
          <th class="px-2">Name</th>
          <th class="px-2">Image</th>
          <th class="px-2">Started</th>
          <th class="px-2">Engine</th>
          <th class="px-2 text-right">actions</th>
        </tr>
      </thead>

      <!-- Display each containers group -->
      {#each containerGroups as containerGroup}
        <tbody>
          {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE || containerGroup.type === ContainerGroupInfoTypeUI.POD}
            <!-- Show group for if it is a POD or COMPOSE -->
            <tr class="group h-10 bg-zinc-900 hover:bg-zinc-700">
              <!-- Show the "toggle" for the grouping -->
              <td
                class="bg-zinc-900 group-hover:bg-zinc-700 pl-2 w-3 rounded-tl-lg"
                class:rounded-bl-lg="{!containerGroup.expanded}"
                on:click="{() => toggleContainerGroup(containerGroup)}">
                <Fa
                  size="12"
                  class="text-gray-400 cursor-pointer"
                  icon="{containerGroup.expanded ? faChevronDown : faChevronRight}" />
              </td>

              <!-- Checkbox -->
              <td class="px-2">
                <input
                  type="checkbox"
                  on:click="{event => toggleCheckboxContainerGroup(event.currentTarget.checked, containerGroup)}"
                  bind:checked="{containerGroup.selected}"
                  class=" cursor-pointer invert hue-rotate-[218deg] bg-white-100 rounded-sm" />
              </td>

              <!-- Container icon -->
              <td class="flex flex-row justify-center h-10" title="{containerGroup.type}">
                <ContainerGroupIcon type="{containerGroup.type}" containers="{containerGroup.containers}" />
              </td>

              <!-- Show the container name, type and number of containers -->
              <td class="p-2 whitespace-nowrap hover:cursor-pointer {!containerGroup.expanded ? 'rounded-br-lg' : ''}">
                <div class="flex items-center text-sm text-gray-200 overflow-hidden text-ellipsis">
                  <div class="flex flex-col flex-nowrap">
                    <div class="text-sm text-gray-200 overflow-hidden text-ellipsis" title="{containerGroup.type}">
                      {containerGroup.name} ({containerGroup.type})
                    </div>
                    <div class="text-xs font-extra-light text-gray-500">
                      {containerGroup.containers.length} container{containerGroup.containers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Container image name -->
              <td class="p-2 whitespace-nowrap"> </td>

              <!-- Container icon + state -->
              <td class="p-2 whitespace-nowrap"> </td>

              <!-- Name of the engine being used
                When using a pod, it is assumed all containers are using the same engine
                So we use the first containers engine name. -->
              <td class="p-2">
                <EngineIcon engine="{containerGroup.containers[0].engineName}" />
              </td>

              <!-- Show the POD actions -->
              <td class="pl-6 text-right whitespace-nowrap">
                <div class="flex flex-row justify-end opacity-0 group-hover:opacity-100">
                  <!-- Only show POD actions if the container group is POD, otherwise keep blank / empty (for future compose implementation) -->
                  {#if containerGroup.type === ContainerGroupInfoTypeUI.POD}
                    <PodActions
                      pod="{{ id: containerGroup.id, name: containerGroup.name, engineId: containerGroup.engineId }}" />
                  {/if}
                </div>
              </td>
            </tr>
          {/if}

          <!-- Display each container of this group -->
          {#if containerGroup.expanded}
            {#each containerGroup.containers as container, index}
              <!-- Show the type if it's standalone or not -->
              <tr class="group h-10 bg-zinc-900 hover:bg-zinc-700">
                <td
                  class="{containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE ? 'rounded-tl-lg' : ''} {index ===
                  containerGroup.containers.length - 1
                    ? 'rounded-bl-lg'
                    : ''}">
                </td>

                <!-- Checkbox -->
                <td class="px-2">
                  <input
                    type="checkbox"
                    bind:checked="{container.selected}"
                    class=" cursor-pointer invert hue-rotate-[218deg] bg-white-100 rounded-sm" />
                </td>

                <!-- Container icon + state -->
                <td class="px-2">
                  <ContainerIcon state="{container.state}" />
                </td>

                <!-- The entire <td> is clickable -->
                <td
                  class="p-2 whitespace-nowrap hover:cursor-pointer"
                  on:click="{() => openDetailsContainer(container)}">
                  <div class="">
                    <!-- Container name -->
                    <div class="flex flex-row">
                      <div class="text-sm text-gray-200 overflow-hidden text-ellipsis" title="{container.name}">
                        {container.name}
                      </div>
                      <div class="pl-2 text-sm text-gray-500 overflow-hidden text-ellipsis" title="{container.name}">
                        {#if container.port}
                          ({container.port})
                        {/if}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Container image name -->
                <td class="p-2 whitespace-nowrap">
                  <div class="flex flex-row">
                    <div class="text-sm text-violet-400 overflow-hidden text-ellipsis" title="{container.image}">
                      {container.image}
                    </div>
                  </div>
                </td>

                <!-- Container icon + state -->
                <td class="p-2 whitespace-nowrap">
                  <div class="text-sm text-gray-200">
                    {container.uptime}
                  </div>
                </td>

                <!-- Name of the engine being used -->
                <td class="p-2">
                  <EngineIcon engine="{container.engineName}" />
                </td>

                <!-- If it's standalone, show the container actions -->
                <td
                  class="pl-6 whitespace-nowrap text-right {containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE
                    ? 'rounded-tr-lg'
                    : ''} {index === containerGroup.containers.length - 1 ? 'rounded-br-lg' : ''}">
                  <div class="flex flex-row justify-end opacity-0 group-hover:opacity-100 ">
                    <ContainerActions container="{container}" />
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>

        <tr><td class="leading-[8px]">&nbsp;</td></tr>
      {/each}
    </table>
  </div>

  <!-- If empty / no containers -->
  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <ContainerEmptyScreen slot="empty" containers="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen slot="empty" />
    {/if}
  </div>
</NavPage>

<!-- If there is NOTHING (no containers, etc.) display a modal with an example of how to create a container -->
{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <div
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-zinc-800 z-50 h-[200px] rounded-xl shadow-xl shadow-neutral-900"
      on:keydown="{keydownChoice}">
      <div class="flex items-center justify-between bg-black px-5 py-4 border-b-2 border-violet-700">
        <h1 class="text-xl font-bold">Create a new container</h1>

        <button class="hover:text-gray-200 px-2 py-1" on:click="{() => toggleCreateContainer()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="bg-zinc-800 p-5 h-full flex flex-col justify-items-center">
        <span class="pb-3">Please make a choice:</span>
        <ul class="list-disc ml-8 space-y-2">
          <li>Create a container from a Containerfile.</li>
          <li>Create a container from an existing image stored in the local registry.</li>
        </ul>

        <div class="pt-5 grid grid-cols-2 gap-10 place-content-center w-full">
          <button class="pf-c-button pf-m-primary" type="button" on:click="{() => fromDockerfile()}"
            >From Containerfile/Dockerfile</button>
          <button class="pf-c-button pf-m-secondary" type="button" on:click="{() => fromExistingImage()}"
            >From existing image</button>
        </div>
      </div>
    </div>
  </Modal>
{/if}
