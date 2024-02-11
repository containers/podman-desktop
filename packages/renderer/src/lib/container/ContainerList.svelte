<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { containersInfos } from '../../stores/containers';
import { viewsContributions } from '../../stores/views';
import { context } from '../../stores/context';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import { router } from 'tinro';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './ContainerInfoUI';
import ContainerActions from './ContainerActions.svelte';
import PodActions from '../pod/PodActions.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';
import ContainerEmptyScreen from './ContainerEmptyScreen.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import Modal from '../dialogs/Modal.svelte';
import { ContainerUtils } from './container-utils';
import { providerInfos } from '../../stores/providers';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import moment from 'moment';
import { get, type Unsubscriber } from 'svelte/store';
import NavPage from '../ui/NavPage.svelte';
import { faChevronDown, faChevronRight, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import { podCreationHolder } from '../../stores/creation-from-containers-store';
import { podsInfos } from '../../stores/pods';
import KubePlayButton from '../kube/KubePlayButton.svelte';
import Prune from '../engine/Prune.svelte';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import { containerGroupsInfo } from '../../stores/containerGroups';
import Checkbox from '../ui/Checkbox.svelte';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import { PodUtils } from '../pod/pod-utils';
import ComposeActions from '../compose/ComposeActions.svelte';
import { CONTAINER_LIST_VIEW } from '../view/views';
import type { ViewInfoUI } from '../../../../main/src/plugin/api/view-info';
import type { ContextUI } from '../context/context';
import Button from '../ui/Button.svelte';
import StateChange from '../ui/StateChange.svelte';
import SolidPodIcon from '../images/SolidPodIcon.svelte';
import ProviderInfo from '../ui/ProviderInfo.svelte';
import { findMatchInLeaves } from '../../stores/search-util';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;
let enginesList: EngineInfoUI[];

// groups of containers that will be displayed
let containerGroups: ContainerGroupInfoUI[] = [];
let viewContributions: ViewInfoUI[] = [];
let globalContext: ContextUI;
let containersInfo: ContainerInfo[] = [];
export let searchTerm = '';
$: updateContainers(containersInfo, globalContext, viewContributions, searchTerm);

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

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

function toggleCheckboxContainerGroup(checked: boolean, containerGroup: ContainerGroupInfoUI) {
  // need to apply that on all containers
  containerGroup.containers.forEach(container => (container.selected = checked));
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedContainers() {
  const podGroups = containerGroups
    .filter(group => group.type === ContainerGroupInfoTypeUI.POD)
    .filter(pod => pod.selected);
  const selectedContainers = containerGroups
    .filter(group => group.type !== ContainerGroupInfoTypeUI.POD)
    .map(group => group.containers)
    .flat()
    .filter(container => container.selected);

  if (podGroups.length + selectedContainers.length === 0) {
    return;
  }

  // mark pods and containers for deletion
  bulkDeleteInProgress = true;
  podGroups.forEach(pod => (pod.status = 'DELETING'));
  selectedContainers.forEach(container => (container.state = 'DELETING'));
  containerGroups = [...containerGroups];

  // delete pods first if any
  if (podGroups.length > 0) {
    await Promise.all(
      podGroups.map(async podGroup => {
        if (podGroup.engineId && podGroup.id) {
          try {
            await window.removePod(podGroup.engineId, podGroup.id);
          } catch (e) {
            console.error('error while removing pod', e);
          }
        }
      }),
    );
  }

  // then containers (that are not inside a pod)
  if (selectedContainers.length > 0) {
    await Promise.all(
      selectedContainers.map(async container => {
        container.actionInProgress = true;
        // reset error when starting task
        container.actionError = '';
        containerGroups = [...containerGroups];
        try {
          await window.deleteContainer(container.engineId, container.id);
        } catch (e) {
          console.log('error while removing container', e);
          container.actionError = String(e);
          container.state = 'ERROR';
        } finally {
          container.actionInProgress = false;
          containerGroups = [...containerGroups];
        }
      }),
    );
  }
  bulkDeleteInProgress = false;
}

function createPodFromContainers() {
  const selectedContainers = containerGroups
    .map(group => group.containers)
    .flat()
    .filter(container => container.selected);

  const podUtils = new PodUtils();

  const podCreation = {
    name: podUtils.calculateNewPodName(pods),
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
let contextsUnsubscribe: Unsubscriber;
let podUnsubscribe: Unsubscriber;
let viewsUnsubscribe: Unsubscriber;
let pods: PodInfo[];

onMount(async () => {
  // grab previous groups
  containerGroups = get(containerGroupsInfo);

  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
    if (containersInfo.length > 0) {
      updateContainers(containersInfo, globalContext, viewContributions, searchTerm);
    }
  });

  viewsUnsubscribe = viewsContributions.subscribe(value => {
    viewContributions = value.filter(view => view.viewId === CONTAINER_LIST_VIEW) || [];
    if (containersInfo.length > 0) {
      updateContainers(containersInfo, globalContext, viewContributions, searchTerm);
    }
  });

  containersUnsubscribe = containersInfos.subscribe(value => {
    updateContainers(value, globalContext, viewContributions, searchTerm);
  });

  podUnsubscribe = podsInfos.subscribe(podInfos => {
    pods = podInfos;
  });
});

/* updateContainers updates the variables:
   - containersInfo with the value of containers
   - containerGroups based on the containers and their groups
   - multipleEngines and enginesList based on the engines of containers
*/
function updateContainers(
  containers: ContainerInfo[],
  globalContext: ContextUI,
  viewContributions: ViewInfoUI[],
  searchTerm: string,
) {
  containersInfo = containers;
  const currentContainers = containers.map((containerInfo: ContainerInfo) => {
    return containerUtils.getContainerInfoUI(containerInfo, globalContext, viewContributions);
  });

  // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
  const engines = currentContainers.map(container => {
    return {
      name: container.engineName,
      id: container.engineId,
    };
  });

  // Remove duplicates from engines by name
  const uniqueEngines = engines.filter((engine, index, self) => index === self.findIndex(t => t.name === engine.name));

  // Set the engines to the global variable for the Prune functionality button
  enginesList = uniqueEngines;

  // create groups
  let computedContainerGroups = containerUtils.getContainerGroups(currentContainers);

  // Filter containers in groups
  computedContainerGroups.forEach(group => {
    group.containers = group.containers
      .filter(containerInfo =>
        findMatchInLeaves(containerInfo, containerUtils.filterSearchTerm(searchTerm).toLowerCase()),
      )
      .filter(containerInfo => {
        if (containerUtils.filterIsRunning(searchTerm)) {
          return containerInfo.state === 'RUNNING';
        }
        if (containerUtils.filterIsStopped(searchTerm)) {
          return containerInfo.state !== 'RUNNING';
        }
        return true;
      });
  });
  // Remove groups with all containers filtered
  computedContainerGroups = computedContainerGroups.filter(group => group.containers.length > 0);

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
}

function displayContainersCount(containerGroup: ContainerGroupInfoUI) {
  let result = containerGroup.allContainersCount + ' container' + (containerGroup.allContainersCount > 1 ? 's' : '');
  if (containerGroup.containers.length !== containerGroup.allContainersCount) {
    result += ` (${containerGroup.allContainersCount - containerGroup.containers.length} filtered)`;
  }
  return result;
}

onDestroy(() => {
  // store current groups for later
  containerGroupsInfo.set(containerGroups);

  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (containersUnsubscribe) {
    containersUnsubscribe();
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
  if (podUnsubscribe) {
    podUnsubscribe();
  }
  if (viewsUnsubscribe) {
    viewsUnsubscribe();
  }
});

function openDetailsContainer(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/`);
}

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCreateContainer();
  }
}

function openGroupDetails(containerGroup: ContainerGroupInfoUI): void {
  if (!containerGroup.engineId) {
    return;
  }
  if (containerGroup.type === ContainerGroupInfoTypeUI.POD) {
    router.goto(`/pods/podman/${encodeURI(containerGroup.name)}/${encodeURIComponent(containerGroup.engineId)}/logs`);
  } else if (containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE) {
    router.goto(`/compose/details/${encodeURI(containerGroup.name)}/${encodeURI(containerGroup.engineId)}/logs`);
  }
}

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
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

function toggleAllContainerGroups(checked: boolean) {
  const toggleContainers = containerGroups;
  toggleContainers
    .filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE)
    .forEach(group => (group.selected = checked));
  toggleContainers.forEach(group => group.containers.forEach(container => (container.selected = checked)));
  containerGroups = toggleContainers;
}

function resetRunningFilter() {
  searchTerm = containerUtils.filterResetRunning(searchTerm);
}

function setRunningFilter() {
  searchTerm = containerUtils.filterSetRunning(searchTerm);
}

function setStoppedFilter() {
  searchTerm = containerUtils.filterSetStopped(searchTerm);
}
</script>

<NavPage bind:searchTerm="{searchTerm}" title="containers">
  <svelte:fragment slot="additional-actions">
    <!-- Only show if there are containers-->
    {#if $containersInfos.length > 0}
      <Prune type="containers" engines="{enginesList}" />
    {/if}
    <Button on:click="{() => toggleCreateContainer()}" icon="{faPlusCircle}" title="Create a container">Create</Button>
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <div class="inline-flex space-x-2">
        <Button
          on:click="{() => deleteSelectedContainers()}"
          aria-label="Delete selected containers and pods"
          title="Delete {selectedItemsNumber} selected items"
          bind:inProgress="{bulkDeleteInProgress}"
          icon="{faTrash}">
        </Button>

        <Button
          on:click="{() => createPodFromContainers()}"
          title="Create Pod with {selectedItemsNumber} selected items"
          icon="{SolidPodIcon}">
          Create Pod
        </Button>
      </div>
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="tabs">
    <Button type="tab" on:click="{() => resetRunningFilter()}" selected="{containerUtils.filterIsAll(searchTerm)}"
      >All</Button>
    <Button type="tab" on:click="{() => setRunningFilter()}" selected="{containerUtils.filterIsRunning(searchTerm)}"
      >Running</Button>
    <Button type="tab" on:click="{() => setStoppedFilter()}" selected="{containerUtils.filterIsStopped(searchTerm)}"
      >Stopped</Button>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <table class="mx-5 w-full h-fit" class:hidden="{containerGroups.length === 0}">
      <!-- title -->
      <thead class="sticky top-0 bg-charcoal-700 z-[2]">
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5">
            <Checkbox
              title="Toggle all"
              bind:checked="{selectedAllCheckboxes}"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              on:click="{event => toggleAllContainerGroups(event.detail)}" />
          </th>
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="pl-3">Environment</th>
          <th class="pl-3">Image</th>
          <th class="pl-3">Age</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>

      <!-- Display each group -->
      <tbody>
        {#each containerGroups as containerGroup}
          {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE || containerGroup.type === ContainerGroupInfoTypeUI.POD}
            <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
              <td
                class="bg-charcoal-800 group-hover:bg-zinc-700 pl-2 w-3 rounded-tl-lg"
                class:rounded-bl-lg="{!containerGroup.expanded}"
                on:click="{() => toggleContainerGroup(containerGroup)}">
                <Fa
                  size="12"
                  class="text-gray-700 cursor-pointer"
                  icon="{containerGroup.expanded ? faChevronDown : faChevronRight}" />
              </td>
              <td class="px-2">
                <Checkbox
                  title="Toggle {containerGroup.type}"
                  bind:checked="{containerGroup.selected}"
                  on:click="{event => toggleCheckboxContainerGroup(event.detail, containerGroup)}" />
              </td>
              <td class="flex flex-row justify-center h-12" title="{containerGroup.type}">
                <div class="grid place-content-center ml-3 mr-4">
                  <StatusIcon icon="{PodIcon}" status="{containerGroup.status}" />
                </div>
              </td>
              <td class="whitespace-nowrap hover:cursor-pointer">
                <div class="flex items-center text-sm text-gray-300 overflow-hidden text-ellipsis">
                  <div>
                    <button
                      class="text-sm text-gray-300 overflow-hidden text-ellipsis"
                      title="{containerGroup.type}"
                      on:click="{() => openGroupDetails(containerGroup)}">
                      {containerGroup.name} ({containerGroup.type})
                    </button>
                    <div class="text-xs font-extra-light text-gray-900">
                      {displayContainersCount(containerGroup)}
                    </div>
                  </div>
                </div>
              </td>
              <td class="pl-3 whitespace-nowrap hover:cursor-pointer group">
                <div class="flex items-center text-xs p-1 rounded-md text-gray-500"></div>
              </td>
              <td class="px-6 py-2 whitespace-nowrap w-10"> </td>
              <td class="whitespace-nowrap pl-3">
                <div class="flex items-center">
                  <div class="text-sm text-gray-700"></div>
                </div>
              </td>
              <td
                class="pl-6 text-right whitespace-nowrap rounded-tr-lg"
                class:rounded-br-lg="{!containerGroup.expanded}">
                <!-- Only show POD actions if the container group is POD, otherwise keep blank / empty (for future compose implementation) -->
                {#if containerGroup.type === ContainerGroupInfoTypeUI.POD && containerGroup.engineId && containerGroup.id && containerGroup.shortId && containerGroup.status && containerGroup.engineName && containerGroup.humanCreationDate && containerGroup.created}
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
                      containers: containerGroup.containers.map(container => ({
                        Id: container.id,
                        Names: container.name,
                        Status: container.state,
                      })),
                      kind: 'podman',
                    }}"
                    dropdownMenu="{true}"
                    on:update="{() => (containerGroups = [...containerGroups])}" />
                {/if}
                {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE && containerGroup.status && containerGroup.engineId && containerGroup.engineType}
                  <ComposeActions
                    compose="{{
                      status: containerGroup.status,
                      name: containerGroup.name,
                      engineId: containerGroup.engineId,
                      engineType: containerGroup.engineType,
                      containers: containerGroup.containers,
                    }}"
                    dropdownMenu="{true}"
                    on:update="{() => {
                      containerGroups = [...containerGroups];
                    }}" />
                {/if}
              </td>
            </tr>
          {/if}
          <!-- Display each container of this group -->
          {#if containerGroup.expanded}
            {#each containerGroup.containers as container, index}
              <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
                <td
                  class="{containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE ? 'rounded-tl-lg' : ''} {index ===
                  containerGroup.containers.length - 1
                    ? 'rounded-bl-lg'
                    : ''}">
                </td>
                <td class="px-2">
                  <Checkbox title="Toggle container" bind:checked="{container.selected}" />
                </td>
                <td class="flex flex-row justify-center h-12">
                  <div class="grid place-content-center ml-3 mr-4">
                    <StatusIcon icon="{container.icon}" status="{container.state}" />
                  </div>
                </td>
                <td
                  class="whitespace-nowrap hover:cursor-pointer group"
                  on:click="{() => openDetailsContainer(container)}">
                  <div class="flex items-center">
                    <div class="">
                      <div class="flex flex-nowrap">
                        <div
                          class="text-sm text-gray-300 overflow-hidden text-ellipsis group-hover:text-violet-400"
                          title="{container.name}">
                          {container.name}
                        </div>
                      </div>
                      <div class="flex flex-nowrap text-xs font-extra-light text-gray-900 items-center">
                        <div>{container.state}</div>
                        <div class="pl-2 pr-2 inline-flex">{container.displayPort}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="pl-3 whitespace-nowrap hover:cursor-pointer group">
                  <div class="flex items-center text-xs p-1 rounded-md text-gray-500">
                    <ProviderInfo provider="{container.engineType}" context="{container.engineId}" />
                  </div>
                </td>
                <!-- Open the container details, TODO: open image details instead? -->
                <td
                  class="pl-3 whitespace-nowrap hover:cursor-pointer group"
                  on:click="{() => openDetailsContainer(container)}">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-700 overflow-hidden text-ellipsis" title="{container.image}">
                      {container.shortImage}
                    </div>
                  </div></td>
                <td class="whitespace-nowrap pl-3">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-700">
                      <StateChange state="{container.state}">{container.uptime}</StateChange>
                    </div>
                  </div>
                </td>
                <td
                  class="pl-6 text-right whitespace-nowrap {containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE
                    ? 'rounded-tr-lg'
                    : ''} {index === containerGroup.containers.length - 1 ? 'rounded-br-lg' : ''}">
                  <div class="flex w-full">
                    <div class="flex items-center w-5">
                      {#if container.actionError}
                        <ErrorMessage error="{container.actionError}" icon />
                      {:else}
                        <div>&nbsp;</div>
                      {/if}
                    </div>
                    <div class="text-right w-full">
                      <ContainerActions
                        container="{container}"
                        dropdownMenu="{true}"
                        on:update="{() => (containerGroups = [...containerGroups])}" />
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if containerGroups.length === 0}
      {#if containerUtils.filterSearchTerm(searchTerm)}
        <FilteredEmptyScreen
          icon="{ContainerIcon}"
          kind="containers"
          on:resetFilter="{e => {
            searchTerm = containerUtils.filterResetSearchTerm(searchTerm);
            e.preventDefault();
          }}"
          searchTerm="{containerUtils.filterSearchTerm(searchTerm)}" />
      {:else}
        <ContainerEmptyScreen
          runningOnly="{containerUtils.filterIsRunning(searchTerm)}"
          stoppedOnly="{containerUtils.filterIsStopped(searchTerm)}" />
      {/if}
    {/if}
  </div>
</NavPage>

{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <div
      role="presentation"
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-charcoal-600 z-50 rounded-xl shadow-xl shadow-charcoal-900"
      on:keydown="{keydownChoice}">
      <div class="flex items-center justify-between bg-black px-5 py-4 border-b-2 border-violet-700">
        <h1 class="text-xl font-bold">Create a new container</h1>

        <button class="hover:text-gray-300 px-2 py-1" on:click="{() => toggleCreateContainer()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="bg-charcoal-600 p-5 h-full flex flex-col justify-items-center">
        <span class="pb-3">Choose the following:</span>
        <ul class="list-disc ml-8 space-y-2">
          <li>Create a container from a Containerfile</li>
          <li>Create a container from an existing image stored in the local registry</li>
        </ul>

        <div class="pt-5 grid grid-cols-2 gap-10 place-content-center w-full">
          <Button type="primary" on:click="{() => fromDockerfile()}">Containerfile or Dockerfile</Button>
          <Button type="secondary" on:click="{() => fromExistingImage()}">Existing image</Button>
        </div>
      </div>
    </div>
  </Modal>
{/if}
