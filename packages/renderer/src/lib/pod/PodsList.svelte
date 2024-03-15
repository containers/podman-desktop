<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import { filtered, podsInfos, searchPattern } from '../../stores/pods';
import { providerInfos } from '../../stores/providers';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Prune from '../engine/Prune.svelte';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import PodIcon from '../images/PodIcon.svelte';
import KubePlayButton from '../kube/KubePlayButton.svelte';
import { Column, Row } from '../table/table';
import Table from '../table/Table.svelte';
import Button from '../ui/Button.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import NavPage from '../ui/NavPage.svelte';
import { PodUtils } from './pod-utils';
import PodColumnActions from './PodColumnActions.svelte';
import PodColumnAge from './PodColumnAge.svelte';
import PodColumnContainers from './PodColumnContainers.svelte';
import PodColumnEnvironment from './PodColumnEnvironment.svelte';
import PodColumnName from './PodColumnName.svelte';
import PodColumnStatus from './PodColumnStatus.svelte';
import PodEmptyScreen from './PodEmptyScreen.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let pods: PodInfoUI[] = [];
let enginesList: EngineInfoUI[];

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

const podUtils = new PodUtils();

let podsUnsubscribe: Unsubscriber;
onMount(async () => {
  podsUnsubscribe = filtered.subscribe(value => {
    const computedPods = value.map((podInfo: PodInfo) => podUtils.getPodInfoUI(podInfo)).flat();

    // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
    const engines = computedPods.map(container => {
      return {
        name: container.engineName,
        id: container.engineId,
      };
    });

    // Remove duplicates from engines by name
    // Set the engines to the global variable for the Prune functionality button
    enginesList = engines.filter((engine, index, self) => index === self.findIndex(t => t.name === engine.name));

    // update selected items based on current selected items
    computedPods.forEach(pod => {
      const matchingPod = pods.find(currentPod => currentPod.id === pod.id && currentPod.engineId === pod.engineId);
      if (matchingPod) {
        pod.selected = matchingPod.selected;
      }
    });
    pods = computedPods;

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
  if (podsUnsubscribe) {
    podsUnsubscribe();
  }
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedPods() {
  const selectedPods = pods.filter(pod => pod.selected);
  if (selectedPods.length === 0) {
    return;
  }

  // mark pods for deletion
  bulkDeleteInProgress = true;
  selectedPods.forEach(pod => (pod.status = 'DELETING'));
  pods = pods;

  await Promise.all(
    selectedPods.map(async pod => {
      try {
        if (pod.kind === 'podman') {
          await window.removePod(pod.engineId, pod.id);
        } else {
          await window.kubernetesDeletePod(pod.name);
        }
      } catch (e) {
        console.error('error while removing pod', e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  for (const podInfo of pods) {
    podInfo.age = podUtils.refreshAge(podInfo);
  }
  pods = pods;

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshAge, newInterval));
}

function computeInterval(): number {
  // no pods, no refresh
  if (pods.length === 0) {
    return -1;
  }

  // do we have pods that have been created in less than 1 minute
  // if so, need to update every second
  const podsCreatedInLessThan1Mn = pods.filter(pod => moment().diff(pod.created, 'minutes') < 1);
  if (podsCreatedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for pods created less than 1 hour
  const podsCreatedInLessThan1Hour = pods.filter(volume => moment().diff(volume.created, 'hours') < 1);
  if (podsCreatedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for pods created less than 1 day
  const podsCreatedInLessThan1Day = pods.filter(volume => moment().diff(volume.created, 'days') < 1);
  if (podsCreatedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new Column<PodInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: PodColumnStatus,
  comparator: (a, b) => b.status.localeCompare(a.status),
});

let nameColumn = new Column<PodInfoUI>('Name', {
  width: '2fr',
  renderer: PodColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let envColumn = new Column<PodInfoUI>('Environment', {
  renderer: PodColumnEnvironment,
  comparator: (a, b) => a.kind.localeCompare(b.kind),
});

let containersColumn = new Column<PodInfoUI>('Containers', {
  renderer: PodColumnContainers,
  comparator: (a, b) => a.containers.length - b.containers.length,
  initialOrder: 'descending',
  overflow: true,
});

let ageColumn = new Column<PodInfoUI>('Age', {
  renderer: PodColumnAge,
  comparator: (a, b) => moment().diff(a.created) - moment().diff(b.created),
});

const columns: Column<PodInfoUI>[] = [
  statusColumn,
  nameColumn,
  envColumn,
  containersColumn,
  ageColumn,
  new Column<PodInfoUI>('Actions', { align: 'right', width: '150px', renderer: PodColumnActions, overflow: true }),
];

const row = new Row<PodInfoUI>({ selectable: _pod => true });
</script>

<NavPage bind:searchTerm="{searchTerm}" title="pods">
  <svelte:fragment slot="additional-actions">
    {#if $podsInfos.length > 0}
      <Prune type="pods" engines="{enginesList}" />
    {/if}
    {#if providerPodmanConnections.length > 0}
      <KubePlayButton />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedPods()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <svelte:fragment slot="tabs">
    <Button
      type="tab"
      on:click="{() => {
        searchTerm = searchTerm
          .split(' ')
          .filter(pattern => pattern !== 'is:running' && pattern !== 'is:stopped')
          .join(' ');
      }}"
      selected="{!searchTerm.includes('is:stopped') && !searchTerm.includes('is:running')}">All</Button>
    <Button
      type="tab"
      on:click="{() => {
        let temp = searchTerm
          .trim()
          .split(' ')
          .filter(term => term !== 'is:stopped')
          .join(' ')
          .trim();
        searchTerm = temp ? `${temp} is:running` : 'is:running';
      }}"
      selected="{searchTerm.includes('is:running')}">Running</Button>
    <Button
      type="tab"
      on:click="{() => {
        let temp = searchTerm
          .trim()
          .split(' ')
          .filter(term => term !== 'is:running')
          .join(' ')
          .trim();
        searchTerm = temp ? `${temp} is:stopped` : 'is:stopped';
      }}"
      selected="{searchTerm.includes('is:stopped')}">Stopped</Button>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="pod"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{pods}"
      columns="{columns}"
      row="{row}"
      on:update="{() => (pods = pods)}">
    </Table>

    {#if $filtered.length === 0 && providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen
          icon="{PodIcon}"
          kind="pods"
          bind:searchTerm="{searchTerm}"
          on:resetFilter="{e => {
            searchTerm = podUtils.filterResetSearchTerm(searchTerm);
            e.preventDefault();
          }}" />
      {:else}
        <PodEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
