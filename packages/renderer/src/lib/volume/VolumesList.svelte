<script lang="ts">
import { faPieChart, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import type { EngineInfoUI } from '/@/lib/engine/EngineInfoUI';
import Prune from '/@/lib/engine/Prune.svelte';
import NoContainerEngineEmptyScreen from '/@/lib/image/NoContainerEngineEmptyScreen.svelte';
import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';
import ContainerEngineEnvironmentColumn from '/@/lib/table/columns/ContainerEngineEnvironmentColumn.svelte';
import EnvironmentDropdown from '/@/lib/ui/EnvironmentDropdown.svelte';
import { providerInfos } from '/@/stores/providers';
import { fetchVolumesWithData, filtered, searchPattern, setVolumeStatus, volumeListInfos } from '/@/stores/volumes';

import VolumeColumnActions from './VolumeColumnActions.svelte';
import VolumeColumnName from './VolumeColumnName.svelte';
import VolumeColumnStatus from './VolumeColumnStatus.svelte';
import VolumeEmptyScreen from './VolumeEmptyScreen.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

interface Props {
  searchTerm?: string;
}

let { searchTerm = $bindable('') }: Props = $props();

$effect(() => {
  searchPattern.set(searchTerm);
});

let selectedEnvironment = $state('');
let volumes: VolumeInfoUI[] = $state([]);
let enginesList: EngineInfoUI[] = $state([]);

// Filter volumes by selected environment
let filteredVolumes = $derived(selectedEnvironment ? volumes.filter(v => v.engineId === selectedEnvironment) : volumes);

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let volumesUnsubscribe: Unsubscriber;
onMount(async () => {
  volumesUnsubscribe = filtered.subscribe(value => {
    const computedVolumes = value.map(volume => ({ ...volume }));

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
  });
});

onDestroy(() => {
  // unsubscribe from the store
  if (volumesUnsubscribe) {
    volumesUnsubscribe();
  }
});

// delete the items selected in the list
let bulkDeleteInProgress = $state(false);
async function deleteSelectedVolumes(): Promise<void> {
  const selectedVolumes = volumes.filter(volume => volume.selected);

  if (selectedVolumes.length === 0) {
    return;
  }

  // mark volumes for deletion
  bulkDeleteInProgress = true;
  selectedVolumes.forEach(volume => {
    setVolumeStatus(volume.engineId, volume.name, 'DELETING');
  });
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

let fetchDataInProgress = $state(false);
async function fetchUsageData(): Promise<void> {
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

let selectedItemsNumber: number = $state(0);

let statusColumn = new TableColumn<VolumeInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: VolumeColumnStatus,
  comparator: (a, b): number => b.status.localeCompare(a.status),
});

let nameColumn = new TableColumn<VolumeInfoUI>('Name', {
  width: '3fr',
  renderer: VolumeColumnName,
  comparator: (a, b): number => a.shortName.localeCompare(b.shortName),
});

let envColumn = new TableColumn<VolumeInfoUI>('Environment', {
  renderer: ContainerEngineEnvironmentColumn,
  comparator: (a, b): number => a.engineId.localeCompare(b.engineId),
});

let ageColumn = new TableColumn<VolumeInfoUI, Date>('Age', {
  renderMapping: (object): Date => new Date(object.created),
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment().diff(a.created) - moment().diff(b.created),
});

let sizeColumn = new TableColumn<VolumeInfoUI, string>('Size', {
  align: 'right',
  renderMapping: (object): string => object.humanSize,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => a.size - b.size,
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
  selectable: (volume): boolean => volume.status === 'UNUSED',
  disabledText: 'Volume is used by a container',
});
/**
 * Utility function for the Table to get the key to use for each item
 */
function key(obj: VolumeInfoUI): string {
  return `${obj.engineId}:${obj.name}`;
}

/**
 * Utility function for the Table to get the label to use for each item
 */
function label(obj: VolumeInfoUI): string {
  return obj.name;
}
</script>

<NavPage bind:searchTerm={searchTerm} title="volumes">
  {#snippet additionalActions()}
    {#if $volumeListInfos.length > 0}
      <Prune type="volumes" engines={enginesList} />

      <Button
        type="secondary"
        inProgress={fetchDataInProgress}
        on:click={fetchUsageData}
        title="Gather sizes for volumes. It can take a while..."
        icon={faPieChart}
        aria-label="Gather volume sizes">Gather volume sizes</Button>
    {/if}
    {#if providerConnections.length > 0}
      <Button type="primary" on:click={gotoCreateVolume} icon={faPlusCircle} title="Create a volume" aria-label="Create"
        >Create</Button>
    {/if}
  {/snippet}

  {#snippet bottomAdditionalActions()}
    <EnvironmentDropdown bind:selectedEnvironment={selectedEnvironment} />
    {#if selectedItemsNumber > 0}
      <Button
        on:click={(): void =>
          withBulkConfirmation(
            deleteSelectedVolumes,
            `delete ${selectedItemsNumber} volume${selectedItemsNumber > 1 ? 's' : ''}`,
            { title: 'Delete Volumes?', variant: 'delete' }
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  {/snippet}

  {#snippet content()}
  <div class="flex min-w-full grow">

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={VolumeIcon} kind="volumes" bind:searchTerm={searchTerm} />
      {:else}
        <VolumeEmptyScreen />
      {/if}
    {:else if filteredVolumes.length === 0 && selectedEnvironment}
      <FilteredEmptyScreen icon={VolumeIcon} kind="volumes" searchTerm="selected environment" onResetFilter={(): void => { selectedEnvironment = ''; }} />
    {:else}
      <Table
        kind="volume"
        bind:selectedItemsNumber={selectedItemsNumber}
        data={filteredVolumes}
        columns={columns}
        row={row}
        defaultSortColumn="Name"
        enableLayoutConfiguration={true}
        key={key}
        label={label}>
      </Table>
    {/if}
  </div>
  {/snippet}
</NavPage>
