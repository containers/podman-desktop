<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';
import { viewsContributions } from '../stores/views';
import { context } from '../stores/context';

import type { ContainerInfo } from '../../../main/src/plugin/api/container-info';
import { router } from 'tinro';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './container/ContainerInfoUI';
import Modal from './dialogs/Modal.svelte';
import { ContainerUtils } from './container/container-utils';
import moment from 'moment';
import { get, type Unsubscriber } from 'svelte/store';
import NavPage from './ui/NavPage.svelte';
import { podCreationHolder } from '../stores/creation-from-containers-store';
import { podsInfos } from '../stores/pods';
import type { EngineInfoUI } from './engine/EngineInfoUI';
import { containerGroupsInfo } from '../stores/containerGroups';
import type { PodInfo } from '../../../main/src/plugin/api/pod-info';
import { PodUtils } from '../lib/pod/pod-utils';
import { CONTAINER_LIST_VIEW } from './view/views';
import type { ViewInfoUI } from '../../../main/src/plugin/api/view-info';
import type { ContextUI } from './context/context';
import Button from './ui/Button.svelte';
import ContainerListTopActions from './container/ContainerListTopActions.svelte';
import ContainerListBottomActions from './container/ContainerListBottomActions.svelte';
import ContainerListContent from './container/ContainerListContent.svelte';
import Tab from './ui/Tab.svelte';
import Route from '../Route.svelte';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;
let enginesList: EngineInfoUI[];

// groups of containers that will be displayed
let containerGroups: ContainerGroupInfoUI[] = [];
let viewContributions: ViewInfoUI[] = [];
let globalContext: ContextUI;
let containersInfo: ContainerInfo[] = [];
export let searchTerm = '';
$: searchPattern.set(searchTerm);

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

let multipleEngines = false;

// number of selected items in the list
$: selectedItemsNumber =
  containerGroups.reduce(
    (previous, current) => previous + current.containers.filter(container => container.selected).length,
    0,
  ) + containerGroups.filter(group => group.selected).length;

$: runningContainerGroups = containerGroups
  .map(group => {
    return { ...group, containers: group.containers.filter(container => container.state === 'RUNNING') };
  })
  .filter(group => group.containers.length > 0);

$: stoppedContainerGroups = containerGroups
  .map(group => {
    return { ...group, containers: group.containers.filter(container => container.state !== 'RUNNING') };
  })
  .filter(group => group.containers.length > 0);

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

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedContainers() {
  // delete pods first if any
  const podGroups = containerGroups
    .filter(group => group.type === ContainerGroupInfoTypeUI.POD)
    .filter(pod => pod.selected);
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
  const selectedContainers = containerGroups
    .filter(group => group.type !== ContainerGroupInfoTypeUI.POD)
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
          errorCallback(container, String(e));
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
      updateContainers(containersInfo, globalContext, viewContributions);
    }
  });

  viewsUnsubscribe = viewsContributions.subscribe(value => {
    viewContributions = value.filter(view => view.viewId === CONTAINER_LIST_VIEW) || [];
    if (containersInfo.length > 0) {
      updateContainers(containersInfo, globalContext, viewContributions);
    }
  });

  containersUnsubscribe = filtered.subscribe(value => {
    updateContainers(value, globalContext, viewContributions);
  });

  podUnsubscribe = podsInfos.subscribe(podInfos => {
    pods = podInfos;
  });
});

function updateContainers(containers: ContainerInfo[], globalContext: ContextUI, viewContributions: ViewInfoUI[]) {
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

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCreateContainer();
  }
}

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function fromDockerfile(): void {
  openChoiceModal = false;
  router.goto('/images/build');
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

<NavPage bind:searchTerm="{searchTerm}" title="containers">
  <ContainerListTopActions
    enginesList="{enginesList}"
    on:createContainer="{() => toggleCreateContainer()}"
    slot="additional-actions" />
  <ContainerListBottomActions
    selectedItemsNumber="{selectedItemsNumber}"
    bulkDeleteInProgress="{bulkDeleteInProgress}"
    on:deleteSelectedContainers="{() => deleteSelectedContainers()}"
    on:createPodFromContainers="{() => createPodFromContainers()}"
    slot="bottom-additional-actions" />
  <div class="flex flex-row px-2 border-b border-charcoal-400" slot="tabs">
    <Tab title="All containers" url="all" />
    <Tab title="Running containers" url="running" />
    <Tab title="Stopped containers" url="stopped" />
  </div>

  <svelte:fragment slot="content">
    <Route path="/all" breadcrumb="All containers" navigationHint="tab">
      <ContainerListContent
        selectedItemsNumber="{selectedItemsNumber}"
        multipleEngines="{multipleEngines}"
        containerGroups="{containerGroups}"
        bind:searchTerm="{searchTerm}"
        on:errorCallback="{event => {
          errorCallback(event.detail.container, event.detail.errorMessage);
        }}"
        on:inProgressCallback="{event => {
          inProgressCallback(event.detail.container, event.detail.inProgress, event.detail.state);
        }}" />
    </Route>
    <Route path="/running" breadcrumb="Running containers" navigationHint="tab">
      <ContainerListContent
        selectedItemsNumber="{selectedItemsNumber}"
        multipleEngines="{multipleEngines}"
        containerGroups="{runningContainerGroups}"
        bind:searchTerm="{searchTerm}"
        on:errorCallback="{event => {
          errorCallback(event.detail.container, event.detail.errorMessage);
        }}"
        on:inProgressCallback="{event => {
          inProgressCallback(event.detail.container, event.detail.inProgress, event.detail.state);
        }}" />
    </Route>
    <Route path="/stopped" breadcrumb="Stopped containers" navigationHint="tab">
      <ContainerListContent
        selectedItemsNumber="{selectedItemsNumber}"
        multipleEngines="{multipleEngines}"
        containerGroups="{stoppedContainerGroups}"
        bind:searchTerm="{searchTerm}"
        on:errorCallback="{event => {
          errorCallback(event.detail.container, event.detail.errorMessage);
        }}"
        on:inProgressCallback="{event => {
          inProgressCallback(event.detail.container, event.detail.inProgress, event.detail.state);
        }}" />
    </Route>
  </svelte:fragment>
</NavPage>

{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <button
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-charcoal-600 z-50 h-[200px] rounded-xl shadow-xl shadow-charcoal-900"
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
    </button>
  </Modal>
{/if}
