<script lang="ts">
import type { SecretInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
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
import moment from 'moment/moment';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import NoContainerEngineEmptyScreen from '/@/lib/image/NoContainerEngineEmptyScreen.svelte';
import SecretIcon from '/@/lib/images/SecretIcon.svelte';
import SecretColumnEnvironment from '/@/lib/secrets/columns/SecretColumnEnvironment.svelte';
import SecretColumnName from '/@/lib/secrets/columns/SecretColumnName.svelte';
import SecretActions from '/@/lib/secrets/components/SecretActions.svelte';
import SecretEmptyScreen from '/@/lib/secrets/components/SecretEmptyScreen.svelte';
import type { SecretInfoUI } from '/@/lib/secrets/SecretInfoUI';
import EnvironmentDropdown from '/@/lib/ui/EnvironmentDropdown.svelte';
import { handleNavigation } from '/@/navigation';
import { providerInfos } from '/@/stores/providers';
import { filtered, searchPattern } from '/@/stores/secrets';

let selectedEnvironment = $state('');

let secrets: Array<SecretInfoUI> = $derived(
  $filtered
    .map((info: SecretInfo) => ({
      ...info,
      Name: info.Name ?? '<none>',
      selected: false,
    }))
    .filter(info => (selectedEnvironment ? info.engineId === selectedEnvironment : true)),
);

let selectedItemsNumber: number = $state(0);

let nameColumn = new TableColumn<SecretInfoUI>('Name', {
  align: 'left',
  renderer: SecretColumnName,
  comparator: (a, b): number => a.Name.localeCompare(b.Name),
  initialOrder: 'descending',
});

let createdColumn = new TableColumn<SecretInfoUI, Date | undefined>('Created At', {
  renderMapping: (deployment): Date | undefined => (deployment.CreatedAt ? new Date(deployment.CreatedAt) : undefined),
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment(b.CreatedAt).diff(moment(a.CreatedAt)),
});

let envColumn = new TableColumn<SecretInfoUI>('Environment', {
  renderer: SecretColumnEnvironment,
  comparator: (a, b): number => a.engineName.localeCompare(b.engineName),
});

const columns = [
  nameColumn,
  createdColumn,
  envColumn,
  new TableColumn<SecretInfoUI>('Actions', { align: 'right', renderer: SecretActions, overflow: true }),
];

const row = new TableRow<SecretInfoUI>({
  selectable(_): boolean {
    return true;
  },
});

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let bulkDeleteInProgress = $state(false);
async function bulkDeleteSecrets(): Promise<void> {
  const selected = secrets.filter(secret => secret.selected);

  try {
    bulkDeleteInProgress = true;
    await Promise.allSettled(selected.map(secret => window.removeSecret(secret.engineId, secret.Id)));
  } finally {
    bulkDeleteInProgress = false;
  }
}

function gotoCreateSecret(): void {
  handleNavigation({ page: NavigationPage.SECRET_CREATE });
}
</script>

<NavPage bind:searchTerm={$searchPattern} title="secrets">
  {#snippet additionalActions()}
    {#if providerConnections.length > 0}
      <Button onclick={gotoCreateSecret} icon={faPlusCircle} title="Create a secret">Create</Button>
    {/if}
  {/snippet}

  {#snippet bottomAdditionalActions()}
    <EnvironmentDropdown bind:selectedEnvironment={selectedEnvironment} />
    {#if selectedItemsNumber > 0}
      <Button
        onclick={(): void =>
          withBulkConfirmation(
            bulkDeleteSecrets,
            `delete ${selectedItemsNumber} secret${selectedItemsNumber > 1 ? 's' : ''}`,
            { title: 'Delete Secrets?', variant:'delete' }
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  {/snippet}

  {#snippet content()}
    <div class="flex min-w-full h-full">

      {#if providerConnections.length === 0}
        <NoContainerEngineEmptyScreen />
      {:else if secrets.length === 0}
        {#if $searchPattern}
          <FilteredEmptyScreen icon={SecretIcon} kind="secrets" bind:searchTerm={$searchPattern} />
        {:else}
          <SecretEmptyScreen />
        {/if}
      {:else}
        <Table
          kind="secrets"
          bind:selectedItemsNumber={selectedItemsNumber}
          data={secrets}
          columns={columns}
          row={row}
          key={(secret): string => `${secret.engineId}:${secret.Id}`}
          label={(secret): string => secret.Name}
          defaultSortColumn="Id">
        </Table>
      {/if}
    </div>
  {/snippet}
</NavPage>
