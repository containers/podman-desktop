<script lang="ts">
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
} from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import { get, type Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import type { ContainerInfo } from '/@api/container-info';
import type { ViewInfoUI } from '/@api/view-info';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import { containerGroupsInfo } from '../../stores/containerGroups';
import { containersInfos } from '../../stores/containers';
import { context } from '../../stores/context';
import { podCreationHolder } from '../../stores/creation-from-containers-store';
import { podsInfos } from '../../stores/pods';
import { providerInfos } from '../../stores/providers';
import { findMatchInLeaves } from '../../stores/search-util';
import { viewsContributions } from '../../stores/views';
import { withBulkConfirmation } from '../actions/BulkActions';
import type { ContextUI } from '../context/context';
import Dialog from '../dialogs/Dialog.svelte';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Prune from '../engine/Prune.svelte';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import SolidPodIcon from '../images/SolidPodIcon.svelte';
import { PodUtils } from '../pod/pod-utils';
import { CONTAINER_LIST_VIEW } from '../view/views';
import { ContainerUtils } from './container-utils';
import ContainerColumnActions from './ContainerColumnActions.svelte';
import ContainerColumnEnvironment from './ContainerColumnEnvironment.svelte';
import ContainerColumnImage from './ContainerColumnImage.svelte';
import ContainerColumnName from './ContainerColumnName.svelte';
import ContainerColumnStatus from './ContainerColumnStatus.svelte';
import ContainerEmptyScreen from './ContainerEmptyScreen.svelte';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './ContainerInfoUI';

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

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedContainers(): Promise<void> {
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

function createPodFromContainers(): void {
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
): void {
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
}

onDestroy(() => {
  // store current groups for later
  containerGroupsInfo.set(containerGroups);

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

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function fromDockerfile(): void {
  openChoiceModal = false;
  router.goto('/images/build');
}

function resetRunningFilter(): void {
  searchTerm = containerUtils.filterResetRunning(searchTerm);
}

function setRunningFilter(): void {
  searchTerm = containerUtils.filterSetRunning(searchTerm);
}

function setStoppedFilter(): void {
  searchTerm = containerUtils.filterSetStopped(searchTerm);
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<ContainerInfoUI | ContainerGroupInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: ContainerColumnStatus,
  comparator: (a, b) => {
    const bStatus = ('status' in b ? b.status : 'state' in b ? b.state : '') ?? '';
    const aStatus = ('status' in a ? a.status : 'state' in a ? a.state : '') ?? '';
    return bStatus.localeCompare(aStatus);
  },
});

let nameColumn = new TableColumn<ContainerInfoUI | ContainerGroupInfoUI>('Name', {
  width: '2fr',
  renderer: ContainerColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let envColumn = new TableColumn<ContainerInfoUI | ContainerGroupInfoUI>('Environment', {
  renderer: ContainerColumnEnvironment,
  comparator: (a, b) => (a.engineType ?? '').localeCompare(b.engineType ?? ''),
});

let imageColumn = new TableColumn<ContainerInfoUI | ContainerGroupInfoUI>('Image', {
  width: '3fr',
  renderer: ContainerColumnImage,
  comparator: (a, b) => {
    const aImage = 'image' in a ? a.image : '';
    const bImage = 'image' in b ? b.image : '';
    return aImage.localeCompare(bImage);
  },
});

let ageColumn = new TableColumn<ContainerInfoUI | ContainerGroupInfoUI, Date | undefined>('Age', {
  renderer: TableDurationColumn,
  renderMapping(object): Date | undefined {
    if (containerUtils.isContainerInfoUI(object)) {
      return containerUtils.getUpDate(object);
    }
    return undefined;
  },
  comparator: (a, b) => {
    const aTime = containerUtils.isContainerInfoUI(a) && a.state === 'RUNNING' ? (moment().diff(a.startedAt) ?? 0) : 0;
    const bTime = containerUtils.isContainerInfoUI(b) && b.state === 'RUNNING' ? (moment().diff(b.startedAt) ?? 0) : 0;
    return aTime - bTime;
  },
});

const columns = [
  statusColumn,
  nameColumn,
  envColumn,
  imageColumn,
  ageColumn,
  new TableColumn<ContainerInfoUI | ContainerGroupInfoUI>('Actions', {
    align: 'right',
    width: '150px',
    renderer: ContainerColumnActions,
    overflow: true,
  }),
];

const row = new TableRow<ContainerGroupInfoUI | ContainerInfoUI>({
  selectable: _container => true,
  children: object => {
    if ('type' in object && object.type !== ContainerGroupInfoTypeUI.STANDALONE) {
      return object.containers;
    } else {
      return [];
    }
  },
});

let containersAndGroups: (ContainerGroupInfoUI | ContainerInfoUI)[];
$: containersAndGroups = containerGroups.map(group =>
  group?.type === ContainerGroupInfoTypeUI.STANDALONE ? group.containers[0] : group,
);
</script>

<NavPage bind:searchTerm={searchTerm} title="containers">
  <svelte:fragment slot="additional-actions">
    <!-- Only show if there are containers-->
    {#if $containersInfos.length > 0}
      <Prune type="containers" engines={enginesList} />
    {/if}
    <Button on:click={() => toggleCreateContainer()} icon={faPlusCircle} title="Create a container">Create</Button>
  </svelte:fragment>
  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <div class="inline-flex space-x-2">
        <Button
          on:click={() =>
            withBulkConfirmation(
              deleteSelectedContainers,
              `delete ${selectedItemsNumber} container${selectedItemsNumber > 1 ? 's' : ''}`,
            )}
          aria-label="Delete selected containers and pods"
          title="Delete {selectedItemsNumber} selected items"
          bind:inProgress={bulkDeleteInProgress}
          icon={faTrash}>
        </Button>

        <Button
          on:click={() => createPodFromContainers()}
          title="Create Pod with {selectedItemsNumber} selected items"
          icon={SolidPodIcon}>
          Create Pod
        </Button>
      </div>
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="tabs">
    <Button type="tab" on:click={() => resetRunningFilter()} selected={containerUtils.filterIsAll(searchTerm)}
      >All</Button>
    <Button type="tab" on:click={() => setRunningFilter()} selected={containerUtils.filterIsRunning(searchTerm)}
      >Running</Button>
    <Button type="tab" on:click={() => setStoppedFilter()} selected={containerUtils.filterIsStopped(searchTerm)}
      >Stopped</Button>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="container"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={containersAndGroups}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (containerGroups = [...containerGroups])}>
    </Table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if containerGroups.length === 0}
      {#if containerUtils.filterSearchTerm(searchTerm)}
        <FilteredEmptyScreen
          icon={ContainerIcon}
          kind="containers"
          on:resetFilter={e => {
            searchTerm = containerUtils.filterResetSearchTerm(searchTerm);
            e.preventDefault();
          }}
          searchTerm={containerUtils.filterSearchTerm(searchTerm)} />
      {:else}
        <ContainerEmptyScreen
          runningOnly={containerUtils.filterIsRunning(searchTerm)}
          stoppedOnly={containerUtils.filterIsStopped(searchTerm)} />
      {/if}
    {/if}
  </div>
</NavPage>

{#if openChoiceModal}
  <Dialog
    title="Create a new container"
    on:close={() => {
      openChoiceModal = false;
    }}>
    <div slot="content" class="h-full flex flex-col justify-items-center text-[var(--pd-modal-text)]">
      <span class="pb-3">Choose the following:</span>
      <ul class="list-disc ml-8 space-y-2">
        <li>Create a container from a Containerfile</li>
        <li>Create a container from an existing image stored in the local registry</li>
      </ul>
    </div>
    <svelte:fragment slot="buttons">
      <Button type="primary" on:click={() => fromDockerfile()}>Containerfile or Dockerfile</Button>
      <Button type="secondary" on:click={() => fromExistingImage()}>Existing image</Button>
    </svelte:fragment>
  </Dialog>
{/if}
