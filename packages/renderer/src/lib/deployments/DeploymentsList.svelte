<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onMount } from 'svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import {
  deploymentSearchPattern,
  kubernetesCurrentContextDeploymentsFiltered,
} from '/@/stores/kubernetes-contexts-state';

import { withBulkConfirmation } from '../actions/BulkActions';
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import { DeploymentUtils } from './deployment-utils';
import DeploymentColumnActions from './DeploymentColumnActions.svelte';
import DeploymentColumnConditions from './DeploymentColumnConditions.svelte';
import DeploymentColumnName from './DeploymentColumnName.svelte';
import DeploymentColumnPods from './DeploymentColumnPods.svelte';
import DeploymentColumnStatus from './DeploymentColumnStatus.svelte';
import DeploymentEmptyScreen from './DeploymentEmptyScreen.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let searchTerm = '';
$: deploymentSearchPattern.set(searchTerm);

let deployments: DeploymentUI[] = [];

const deploymentUtils = new DeploymentUtils();

onMount(() => {
  return kubernetesCurrentContextDeploymentsFiltered.subscribe(value => {
    deployments = value.map(deployment => deploymentUtils.getDeploymentUI(deployment));
  });
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedDeployments() {
  const selectedDeployments = deployments.filter(deployment => deployment.selected);
  if (selectedDeployments.length === 0) {
    return;
  }

  // mark deployments for deletion
  bulkDeleteInProgress = true;
  selectedDeployments.forEach(image => (image.status = 'DELETING'));
  deployments = deployments;

  await Promise.all(
    selectedDeployments.map(async deployment => {
      try {
        await window.kubernetesDeleteDeployment(deployment.name);
      } catch (e) {
        console.error('error while deleting deployment', e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<DeploymentUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: DeploymentColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<DeploymentUI>('Name', {
  renderer: DeploymentColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let conditionsColumn = new TableColumn<DeploymentUI>('Conditions', {
  width: '2fr',
  overflow: true,
  renderer: DeploymentColumnConditions,
});

let podsColumn = new TableColumn<DeploymentUI>('Pods', {
  renderer: DeploymentColumnPods,
});

let ageColumn = new TableColumn<DeploymentUI, Date | undefined>('Age', {
  renderMapping: deployment => deployment.created,
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

const columns = [
  statusColumn,
  nameColumn,
  conditionsColumn,
  podsColumn,
  ageColumn,
  new TableColumn<DeploymentUI>('Actions', { align: 'right', renderer: DeploymentColumnActions }),
];

const row = new TableRow<DeploymentUI>({ selectable: _deployment => true });
</script>

<NavPage bind:searchTerm={searchTerm} title="deployments">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click={() =>
          withBulkConfirmation(
            deleteSelectedDeployments,
            `delete ${selectedItemsNumber} deployment${selectedItemsNumber > 1 ? 's' : ''}`,
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="deployment"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={deployments}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (deployments = deployments)}>
    </Table>

    {#if $kubernetesCurrentContextDeploymentsFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen
          icon={DeploymentIcon}
          kind="deployments"
          searchTerm={searchTerm}
          on:resetFilter={() => (searchTerm = '')} />
      {:else}
        <DeploymentEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
