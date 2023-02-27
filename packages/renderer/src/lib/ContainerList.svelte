<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { filtered, searchPattern, containersInfos } from '../stores/containers';

import type { ContainerInfo } from '../../../main/src/plugin/api/container-info';
import ContainerIcon from './images/ContainerIcon.svelte';
import ContainerGroupIcon from './container/ContainerGroupIcon.svelte';
import StatusIcon from './images/StatusIcon.svelte';
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
import ErrorMessage from './ui/ErrorMessage.svelte';
import { podCreationHolder } from '../stores/creation-from-containers-store';
import KubePlayButton from './kube/KubePlayButton.svelte';
import Prune from './engine/Prune.svelte';
import type { EngineInfoUI } from './engine/EngineInfoUI';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;
let enginesList: EngineInfoUI[];

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
        inProgressCallback(container, true);
        try {
          await window.deleteContainer(container.engineId, container.id);
        } catch (e) {
          console.log('error while removing container', e);
          errorCallback(container, e);
        } finally {
          inProgressCallback(container, false);
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
      return { id: container.id, name: container.name, engineId: container.engineId, ports: container.port };
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

    // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
    const engines = currentContainers.map(container => {
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

    // create groups
    const computedContainerGroups = containerUtils.getContainerGroups(currentContainers);

    // update selected items based on current selected items
    computedContainerGroups.forEach(group => {
      const matchingGroup = containerGroups.find(currentGroup => currentGroup.name === group.name);
      if (matchingGroup) {
        group.selected = matchingGroup.selected;
        group.expanded = matchingGroup.expanded;
        group.containers.forEach(container => {
          const matchingContainer = matchingGroup.containers.find(
            currentContainer => currentContainer.id === container.id,
          );
          if (matchingContainer) {
            container.actionError = matchingContainer.actionError;
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

function openGroupDetails(containerGroup: ContainerGroupInfoUI): void {
  if (containerGroup.type === ContainerGroupInfoTypeUI.POD) {
    router.goto(`/pods/podman/${encodeURI(containerGroup.name)}/${encodeURI(containerGroup.engineId)}/logs`);
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

function inProgressCallback(container: ContainerInfoUI, inProgress: boolean, state?: string): void {
  container.actionInProgress = inProgress;
  // reset error when starting task
  if (inProgress) {
    container.actionError = '';
  }
  if (state) {
    container.state = state;
  }

  containerGroups = [...containerGroups];
}

function errorCallback(container: ContainerInfoUI, errorMessage: string): void {
  container.actionError = errorMessage;
  container.state = 'ERROR';
  containerGroups = [...containerGroups];
}
</script>

<NavPage
  bind:searchTerm="{searchTerm}"
  title="containers"
  subtitle="Hover over a container to view action buttons; click to open up full details.">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    <!-- Only show if there are containers-->
    {#if $containersInfos.length > 0}
      <Prune type="containers" engines="{enginesList}" />
    {/if}
    <button on:click="{() => toggleCreateContainer()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-plus-circle" aria-hidden="true"></i>
      </span>
      Create a container
    </button>
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </div>
  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
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
      <div class="px-1"></div>
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => createPodFromContainers()}"
        title="Create Pod with {selectedItemsNumber} selected items"
        type="button">
        <i class="fas fa-cubes" aria-hidden="true"></i>
      </button>
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="min-w-full flex" slot="table">
    <table class="mx-5 w-full" class:hidden="{containerGroups.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-500">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5"
            ><input
              type="checkbox"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              bind:checked="{selectedAllCheckboxes}"
              on:click="{event => toggleAllContainerGroups(event.currentTarget.checked)}"
              class="cursor-pointer invert hue-rotate-[218deg] brightness-75" /></th>
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th class="w-10">Name</th>
          <th>Image</th>
          <th class="pl-4">Age</th>
          <th class="text-right pr-2">actions</th>
        </tr>
      </thead>

      <!-- Display each group -->
      {#each containerGroups as containerGroup}
        <tbody>
          {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE || containerGroup.type === ContainerGroupInfoTypeUI.POD}
            <tr class="group h-12 bg-zinc-900 hover:bg-zinc-700">
              <td
                class="bg-zinc-900 group-hover:bg-zinc-700 pl-2 w-3 rounded-tl-lg"
                class:rounded-bl-lg="{!containerGroup.expanded}"
                on:click="{() => toggleContainerGroup(containerGroup)}">
                <Fa
                  size="12"
                  class="text-gray-400 cursor-pointer"
                  icon="{containerGroup.expanded ? faChevronDown : faChevronRight}" />
              </td>
              <td class="px-2">
                <input
                  type="checkbox"
                  on:click="{event => toggleCheckboxContainerGroup(event.currentTarget.checked, containerGroup)}"
                  bind:checked="{containerGroup.selected}"
                  class=" cursor-pointer invert hue-rotate-[218deg] brightness-75" />
              </td>
              <td class="flex flex-row justify-center h-12" title="{containerGroup.type}">
                <div class="grid place-content-center ml-3 mr-4">
                  <ContainerGroupIcon containers="{containerGroup.containers}" />
                </div>
              </td>
              <td class="whitespace-nowrap hover:cursor-pointer">
                <div class="flex items-center text-sm text-gray-200 overflow-hidden text-ellipsis">
                  <div class="flex flex-col flex-nowrap">
                    <div
                      class="text-sm text-gray-200 overflow-hidden text-ellipsis"
                      title="{containerGroup.type}"
                      on:click="{() => openGroupDetails(containerGroup)}">
                      {containerGroup.name} ({containerGroup.type})
                    </div>
                    <div class="text-xs font-extra-light text-gray-500">
                      {containerGroup.containers.length} container{containerGroup.containers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-2 whitespace-nowrap w-10">
                <div class="flex items-center">
                  <div class="ml-2 text-sm text-gray-400"></div>
                </div>
              </td>
              <td class="whitespace-nowrap pl-4">
                <div class="flex items-center">
                  <div class="text-sm text-gray-400"></div>
                </div>
              </td>
              <td
                class="pl-6 text-right whitespace-nowrap rounded-tr-lg"
                class:rounded-br-lg="{!containerGroup.expanded}">
                <!-- Only show POD actions if the container group is POD, otherwise keep blank / empty (for future compose implementation) -->
                {#if containerGroup.type === ContainerGroupInfoTypeUI.POD}
                  <PodActions
                    pod="{{
                      id: containerGroup.id,
                      shortId: containerGroup.shortId,
                      status: containerGroup.status,
                      name: containerGroup.name,
                      engineId: containerGroup.engineId,
                      engineName: containerGroup.engineName,
                      age: containerGroup.humanCreationDate,
                      created: containerGroup.created,
                      selected: false,
                      containers: [],
                      kind: 'podman',
                    }}"
                    dropdownMenu="{true}" />
                {/if}
              </td>
            </tr>
          {/if}
          <!-- Display each container of this group -->
          {#if containerGroup.expanded}
            {#each containerGroup.containers as container, index}
              <tr class="group h-12 bg-zinc-900 hover:bg-zinc-700">
                <td
                  class="{containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE ? 'rounded-tl-lg' : ''} {index ===
                  containerGroup.containers.length - 1
                    ? 'rounded-bl-lg'
                    : ''}">
                </td>
                <td class="px-2">
                  <input
                    type="checkbox"
                    bind:checked="{container.selected}"
                    class="cursor-pointer invert hue-rotate-[218deg] brightness-75" />
                </td>
                <td class="flex flex-row justify-center h-12">
                  <div class="grid place-content-center ml-3 mr-4">
                    <StatusIcon icon="{ContainerIcon}" status="{container.state}" />
                  </div>
                </td>
                <td
                  class="whitespace-nowrap hover:cursor-pointer group"
                  on:click="{() => openDetailsContainer(container)}">
                  <div class="flex items-center">
                    <div class="">
                      <div class="flex flex-nowrap">
                        <div
                          class="text-sm text-gray-200 overflow-hidden text-ellipsis group-hover:text-violet-400"
                          title="{container.name}">
                          {container.name}
                        </div>
                      </div>
                      <div class="flex flex-row text-xs font-extra-light text-gray-500">
                        <div>{container.state}</div>
                        <!-- Hide in case of single engines-->
                        {#if multipleEngines}
                          <div
                            class="mx-2 px-2 inline-flex text-xs font-extralight rounded-sm bg-zinc-700 text-slate-400">
                            {container.engineName}
                          </div>
                        {/if}
                        <div class="pl-2 pr-2">{container.displayPort}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <!-- Open the container details, TODO: open image details instead? -->
                <td
                  class="whitespace-nowrap hover:cursor-pointer group"
                  on:click="{() => openDetailsContainer(container)}">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-400 overflow-hidden text-ellipsis" title="{container.image}">
                      {container.image}
                    </div>
                  </div></td>
                <td class="whitespace-nowrap pl-4">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-400">{container.uptime}</div>
                  </div>
                </td>
                <td
                  class="pl-6 text-right whitespace-nowrap {containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE
                    ? 'rounded-tr-lg'
                    : ''} {index === containerGroup.containers.length - 1 ? 'rounded-br-lg' : ''}">
                  <div class="flex w-full">
                    <div class="flex items-center w-5">
                      {#if container.actionInProgress}
                        <svg
                          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      {:else if container.actionError}
                        <ErrorMessage error="{container.actionError}" icon />
                      {:else}
                        <div>&nbsp;</div>
                      {/if}
                    </div>
                    <div class="text-right w-full">
                      <ContainerActions
                        errorCallback="{error => errorCallback(container, error)}"
                        inProgressCallback="{(flag, state) => inProgressCallback(container, flag, state)}"
                        container="{container}"
                        dropdownMenu="{true}" />
                    </div>
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

  <div slot="empty" class="min-h-full">
    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      <ContainerEmptyScreen />
    {/if}
  </div>
</NavPage>

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
        <span class="pb-3">Choose the following:</span>
        <ul class="list-disc ml-8 space-y-2">
          <li>Create a container from a Containerfile</li>
          <li>Create a container from an existing image stored in the local registry</li>
        </ul>

        <div class="pt-5 grid grid-cols-2 gap-10 place-content-center w-full">
          <button class="pf-c-button pf-m-primary" type="button" on:click="{() => fromDockerfile()}"
            >Containerfile or Dockerfile</button>
          <button class="pf-c-button pf-m-secondary" type="button" on:click="{() => fromExistingImage()}"
            >Existing image</button>
        </div>
      </div>
    </div>
  </Modal>
{/if}
