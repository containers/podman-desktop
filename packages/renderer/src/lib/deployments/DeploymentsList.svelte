<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { onMount } from 'svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import {
  deploymentSearchPattern,
  kubernetesCurrentContextDeploymentsFiltered,
} from '/@/stores/kubernetes-contexts-state';

import DeploymentIcon from '../images/DeploymentIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import DurationColumn from '../table/DurationColumn.svelte';
import SimpleColumn from '../table/SimpleColumn.svelte';
import { Column, Row } from '../table/table';
import Table from '../table/Table.svelte';
import Button from '../ui/Button.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import NavPage from '../ui/NavPage.svelte';
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

let statusColumn = new Column<DeploymentUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: DeploymentColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new Column<DeploymentUI>('Name', {
  width: '2fr',
  renderer: DeploymentColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let namespaceColumn = new Column<DeploymentUI, string>('Namespace', {
  renderMapping: deployment => deployment.namespace,
  renderer: SimpleColumn,
  comparator: (a, b) => a.namespace.localeCompare(b.namespace),
});

let conditionsColumn = new Column<DeploymentUI>('Conditions', {
  width: '2fr',
  overflow: true,
  renderer: DeploymentColumnConditions,
});

let podsColumn = new Column<DeploymentUI>('Pods', {
  renderer: DeploymentColumnPods,
});

let ageColumn = new Column<DeploymentUI, Date | undefined>('Age', {
  renderMapping: deployment => deployment.created,
  renderer: DurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

const columns: Column<DeploymentUI, DeploymentUI | string | Date | undefined>[] = [
  statusColumn,
  nameColumn,
  namespaceColumn,
  conditionsColumn,
  podsColumn,
  ageColumn,
  new Column<DeploymentUI>('Actions', { align: 'right', renderer: DeploymentColumnActions }),
];

const row = new Row<DeploymentUI>({ selectable: _deployment => true });
</script>

<NavPage bind:searchTerm="{searchTerm}" title="deployments">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedDeployments()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="deployment"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{deployments}"
      columns="{columns}"
      row="{row}"
      defaultSortColumn="Name"
      on:update="{() => (deployments = deployments)}">
    </Table>

    {#if $kubernetesCurrentContextDeploymentsFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen
          icon="{DeploymentIcon}"
          kind="deployments"
          searchTerm="{searchTerm}"
          on:resetFilter="{() => (searchTerm = '')}" />
      {:else}
        <DeploymentEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
