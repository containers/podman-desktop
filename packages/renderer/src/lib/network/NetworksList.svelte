<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, FilteredEmptyScreen, NavPage, Table, TableColumn, TableRow } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import NoContainerEngineEmptyScreen from '/@/lib/image/NoContainerEngineEmptyScreen.svelte';
import ContainerEngineEnvironmentColumn from '/@/lib/table/columns/ContainerEngineEnvironmentColumn.svelte';
import EnvironmentDropdown from '/@/lib/ui/EnvironmentDropdown.svelte';
import { handleNavigation } from '/@/navigation';
import { filtered, searchPattern, setNetworkStatus } from '/@/stores/networks';
import { providerInfos } from '/@/stores/providers';

import NetworkColumnDriver from './columns/NetworkColumnDriver.svelte';
import NetworkColumnId from './columns/NetworkColumnId.svelte';
import NetworkColumnName from './columns/NetworkColumnName.svelte';
import NetworkActions from './NetworkActions.svelte';
import NetworkEmptyScreen from './NetworkEmptyScreen.svelte';
import type { NetworkInfoUI } from './NetworkInfoUI';

interface Props {
  searchTerm?: string;
}

let { searchTerm = '' }: Props = $props();

$effect(() => {
  $searchPattern = searchTerm;
});

let selectedEnvironment = $state('');

let networks: NetworkInfoUI[] = $derived($filtered.map(network => ({ ...network, selected: false })));

// Filter networks by selected environment
let filteredNetworks = $derived.by(() => {
  if (!selectedEnvironment) return networks;
  return networks.filter(network => network.engineId === selectedEnvironment);
});

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let selectedItemsNumber: number = $state(0);

let bulkDeleteInProgress = $state(false);
async function deleteSelectedNetworks(): Promise<void> {
  const selectedNetworks = networks.filter(network => network.selected);

  if (selectedNetworks.length === 0) {
    return;
  }

  // mark networks for deletion
  bulkDeleteInProgress = true;

  await Promise.all(
    selectedNetworks.map(async network => {
      const oldStatus = network.status;
      try {
        setNetworkStatus(network.engineId, network.id, 'DELETING');
        await window.removeNetwork(network.engineId, network.id);
      } catch (error) {
        console.error(`error while removing network ${network.name}`, error);
        setNetworkStatus(network.engineId, network.id, oldStatus);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

function gotoCreateNetwork(): void {
  handleNavigation({ page: NavigationPage.NETWORK_CREATE });
}

let idColumn = new TableColumn<NetworkInfoUI>('Id', {
  width: '100px',
  renderer: NetworkColumnId,
  comparator: (a, b): number => b.id.localeCompare(a.id),
});

let nameColumn = new TableColumn<NetworkInfoUI>('Name', {
  width: '2fr',
  renderer: NetworkColumnName,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let driverColumn = new TableColumn<NetworkInfoUI>('Driver', {
  renderer: NetworkColumnDriver,
  comparator: (a, b): number => a.driver.localeCompare(b.driver),
});

let envColumn = new TableColumn<NetworkInfoUI>('Environment', {
  renderer: ContainerEngineEnvironmentColumn,
  comparator: (a, b): number => a.engineId.localeCompare(b.engineId),
});

const columns = [
  nameColumn,
  idColumn,
  envColumn,
  driverColumn,
  new TableColumn<NetworkInfoUI>('Actions', { align: 'right', renderer: NetworkActions, overflow: true }),
];

const row = new TableRow<NetworkInfoUI>({
  selectable: (network): boolean => network.status === 'UNUSED',
  disabledText: 'Network is used by a container',
});

/**
 * Utility function for the Table to get the key to use for each item
 */
function key(network: NetworkInfoUI): string {
  return `${network.engineId}:${network.id}`;
}
</script>

<NavPage bind:searchTerm={searchTerm} title="networks">

  {#snippet additionalActions()}
    {#if providerConnections.length > 0}
      <Button onclick={gotoCreateNetwork} icon={faPlusCircle} title="Create a network" aria-label="Create"
        >Create</Button>
    {/if}
  {/snippet}

  {#snippet bottomAdditionalActions()}
    <EnvironmentDropdown bind:selectedEnvironment={selectedEnvironment} />
    {#if selectedItemsNumber > 0}
      <Button
        onclick={(): void =>
          withBulkConfirmation(
            deleteSelectedNetworks,
            `delete ${selectedItemsNumber} network${selectedItemsNumber > 1 ? 's' : ''}`,
            { title: 'Delete Networks?', variant:'delete' }
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
    {:else if networks.length === 0}
      {#if searchTerm}
          <FilteredEmptyScreen icon={ContainerIcon} kind="networks" bind:searchTerm={searchTerm} />
        {:else}
          <NetworkEmptyScreen />
        {/if}
    {:else if filteredNetworks.length === 0 && selectedEnvironment}
      <FilteredEmptyScreen icon={ContainerIcon} kind="networks" searchTerm="selected environment" onResetFilter={(): void => { selectedEnvironment = ''; }} />
    {:else}
      <Table
        kind="network"
        bind:selectedItemsNumber={selectedItemsNumber}
        data={filteredNetworks}
        columns={columns}
        row={row}
        key={key}
        defaultSortColumn="Name"
        enableLayoutConfiguration={true}>
      </Table>
    {/if}
  </div>
  {/snippet}
</NavPage>
