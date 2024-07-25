<script lang="ts">
import { faPieChart, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { providerInfos } from '../../stores/providers';
import { fetchVolumesWithData, filtered, searchPattern, volumeListInfos } from '../../stores/volumes';
import { withBulkConfirmation } from '../actions/BulkActions';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Prune from '../engine/Prune.svelte';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import VolumeIcon from '../images/VolumeIcon.svelte';
import { VolumeUtils } from './volume-utils';
import VolumeColumnActions from './VolumeColumnActions.svelte';
import VolumeColumnEnvironment from './VolumeColumnEnvironment.svelte';
import VolumeColumnName from './VolumeColumnName.svelte';
import VolumeColumnStatus from './VolumeColumnStatus.svelte';
import VolumeEmptyScreen from './VolumeEmptyScreen.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let volumes: VolumeInfoUI[] = [];
let enginesList: EngineInfoUI[];

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

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

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedVolumes() {
  const selectedVolumes = volumes.filter(volume => volume.selected);

  if (selectedVolumes.length === 0) {
    return;
  }

  // mark volumes for deletion
  bulkDeleteInProgress = true;
  selectedVolumes.forEach(volume => (volume.status = 'DELETING'));
  volumes = volumes;

  await Promise.all(
    selectedVolumes.map(async volume => {
      try {
        await window.removeVolume(volume.engineId, volume.name);
      } catch (e) {
        console.error('error while removing volume', e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  for (const volumeInfo of volumes) {
    volumeInfo.age = volumeUtils.refreshAge(volumeInfo);
  }
  volumes = volumes;

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

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<VolumeInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: VolumeColumnStatus,
  comparator: (a, b) => b.status.localeCompare(a.status),
});

let nameColumn = new TableColumn<VolumeInfoUI>('Name', {
  width: '3fr',
  renderer: VolumeColumnName,
  comparator: (a, b) => a.shortName.localeCompare(b.shortName),
});

let envColumn = new TableColumn<VolumeInfoUI>('Environment', {
  renderer: VolumeColumnEnvironment,
  comparator: (a, b) => a.engineName.localeCompare(b.engineName),
});

let ageColumn = new TableColumn<VolumeInfoUI, string>('Age', {
  renderMapping: object => object.age,
  renderer: TableSimpleColumn,
  comparator: (a, b) => moment().diff(a.created) - moment().diff(b.created),
});

let sizeColumn = new TableColumn<VolumeInfoUI, string>('Size', {
  align: 'right',
  renderMapping: object => object.humanSize,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.size - b.size,
  initialOrder: 'descending',
});

const columns = [
  statusColumn,
  nameColumn,
  envColumn,
  ageColumn,
  sizeColumn,
  new TableColumn<VolumeInfoUI>('Actions', { align: 'right', renderer: VolumeColumnActions, overflow: true }),
];

const row = new TableRow<VolumeInfoUI>({
  selectable: volume => volume.status === 'UNUSED',
  disabledText: 'Volume is used by a container',
});
</script>

<NavPage bind:searchTerm={searchTerm} title="volumes">
  <svelte:fragment slot="additional-actions">
    {#if $volumeListInfos.map(volumeInfo => volumeInfo.Volumes).flat().length > 0}
      <Prune type="volumes" engines={enginesList} />

      <Button
        inProgress={fetchDataInProgress}
        on:click={() => fetchUsageData()}
        title="Gather sizes for volumes. It can take a while..."
        icon={faPieChart}
        aria-label="Gather volume sizes">Gather volume sizes</Button>
    {/if}
    {#if providerConnections.length > 0}
      <Button on:click={() => gotoCreateVolume()} icon={faPlusCircle} title="Create a volume" aria-label="Create"
        >Create</Button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click={() =>
          withBulkConfirmation(
            deleteSelectedVolumes,
            `delete ${selectedItemsNumber} volume${selectedItemsNumber > 1 ? 's' : ''}`,
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="volume"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={volumes}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (volumes = volumes)}>
    </Table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.map(volumeInfo => volumeInfo.Volumes).flat().length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={VolumeIcon} kind="volumes" bind:searchTerm={searchTerm} />
      {:else}
        <VolumeEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
