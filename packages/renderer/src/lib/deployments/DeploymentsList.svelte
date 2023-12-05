<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import type { Unsubscriber } from 'svelte/store';
import type { DeploymentUI } from './DeploymentUI';
import { filtered, searchPattern } from '../../stores/deployments';
import NavPage from '../ui/NavPage.svelte';
import Table from '../table/Table.svelte';
import { Column, Row } from '../table/table';
import DeploymentColumnStatus from './DeploymentColumnStatus.svelte';
import DeploymentColumnName from './DeploymentColumnName.svelte';
import DeploymentColumnConditions from './DeploymentColumnConditions.svelte';
import DeploymentColumnPods from './DeploymentColumnPods.svelte';
import { DeploymentUtils } from './deployment-utils';
import DeploymentColumnActions from './DeploymentColumnActions.svelte';
import moment from 'moment';
import Button from '../ui/Button.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import DeploymentEmptyScreen from './DeploymentEmptyScreen.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import SimpleColumn from '../table/SimpleColumn.svelte';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let deployments: DeploymentUI[] = [];

const deploymentUtils = new DeploymentUtils();

let deploymentsUnsubscribe: Unsubscriber;
onMount(async () => {
  deploymentsUnsubscribe = filtered.subscribe(value => {
    deployments = value.map(deployment => deploymentUtils.getDeploymentUI(deployment));
  });

  // compute refresh interval
  const interval = computeInterval();
  refreshTimeouts.push(setTimeout(refreshAge, interval));
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (deploymentsUnsubscribe) {
    deploymentsUnsubscribe();
  }
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedDeployments() {
  const selectedDeployments = deployments.filter(deployment => deployment.selected);

  if (selectedDeployments.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedDeployments.map(async deployment => {
        try {
          await window.kubernetesDeleteDeployment(deployment.name);
        } catch (e) {
          console.log('error while deleting deployment', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  deployments = deployments.map(deployment => {
    return { ...deployment, age: deploymentUtils.refreshAge(deployment) };
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshAge, newInterval));
}

function computeInterval(): number {
  // no deployments, no refresh
  if (deployments.length === 0) {
    return -1;
  }

  // do we have deployments that have been created in less than 1 minute
  // if so, need to update every second
  const deploymentsCreatedInLessThan1Mn = deployments.filter(volume => moment().diff(volume.created, 'minutes') < 1);
  if (deploymentsCreatedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for deployments created less than 1 hour
  const deploymentsCreatedInLessThan1Hour = deployments.filter(volume => moment().diff(volume.created, 'hours') < 1);
  if (deploymentsCreatedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for deployments created less than 1 day
  const deploymentsCreatedInLessThan1Day = deployments.filter(volume => moment().diff(volume.created, 'days') < 1);
  if (deploymentsCreatedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
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
  renderer: DeploymentColumnConditions,
});

let podsColumn = new Column<DeploymentUI>('Pods', {
  renderer: DeploymentColumnPods,
});

let ageColumn = new Column<DeploymentUI, string>('Age', {
  renderMapping: deployment => deployment.age,
  renderer: SimpleColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

const columns: Column<DeploymentUI, DeploymentUI | string>[] = [
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
  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedDeployments()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="deployment"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{deployments}"
      columns="{columns}"
      row="{row}"
      defaultSortColumn="Name">
    </Table>

    {#if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{DeploymentIcon}" kind="deployments" bind:searchTerm="{searchTerm}" />
      {:else}
        <DeploymentEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
