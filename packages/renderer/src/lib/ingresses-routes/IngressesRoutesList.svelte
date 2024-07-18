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
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import {
  ingressSearchPattern,
  kubernetesCurrentContextIngressesFiltered,
  kubernetesCurrentContextRoutesFiltered,
  routeSearchPattern,
} from '/@/stores/kubernetes-contexts-state';
import type { V1Route } from '/@api/openshift-types';

import { withBulkConfirmation } from '../actions/BulkActions';
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteColumnActions from './IngressRouteColumnActions.svelte';
import IngressRouteColumnBackend from './IngressRouteColumnBackend.svelte';
import IngressRouteColumnHostPath from './IngressRouteColumnHostPath.svelte';
import IngressRouteColumnName from './IngressRouteColumnName.svelte';
import IngressRouteColumnStatus from './IngressRouteColumnStatus.svelte';
import IngressRouteEmptyScreen from './IngressRouteEmptyScreen.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let searchTerm = '';
$: routeSearchPattern.set(searchTerm);
$: ingressSearchPattern.set(searchTerm);

let ingressesUI: IngressUI[] = [];
let routesUI: RouteUI[] = [];
let ingressesRoutesUI: (IngressUI | RouteUI)[] = [];

const ingressRouteUtils = new IngressRouteUtils();

let ingressesUnsubscribe: Unsubscriber;
let routesUnsubscribe: Unsubscriber;
onMount(() => {
  ingressesUnsubscribe = kubernetesCurrentContextIngressesFiltered.subscribe(value => {
    ingressesUI = value.map(ingress => ingressRouteUtils.getIngressUI(ingress));
    ingressesRoutesUI = [...ingressesUI, ...routesUI];
  });

  routesUnsubscribe = kubernetesCurrentContextRoutesFiltered.subscribe(value => {
    routesUI = value.map(route => ingressRouteUtils.getRouteUI(route as V1Route));
    ingressesRoutesUI = [...ingressesUI, ...routesUI];
  });
});

onDestroy(() => {
  // unsubscribe from the store
  ingressesUnsubscribe?.();
  routesUnsubscribe?.();
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedIngressesRoutes() {
  const selectedIngressesRoutes = ingressesRoutesUI.filter(ingressesRoutesUI => ingressesRoutesUI.selected);
  if (selectedIngressesRoutes.length === 0) {
    return;
  }

  // mark ingress or route for deletion
  bulkDeleteInProgress = true;
  selectedIngressesRoutes.forEach(ingressRoute => (ingressRoute.status = 'DELETING'));
  ingressesRoutesUI = ingressesRoutesUI;

  if (selectedIngressesRoutes.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedIngressesRoutes.map(async ingressRoute => {
        const isIngress = ingressRouteUtils.isIngress(ingressRoute);
        try {
          if (isIngress) {
            await window.kubernetesDeleteIngress(ingressRoute.name);
          } else {
            await window.kubernetesDeleteRoute(ingressRoute.name);
          }
        } catch (e) {
          console.error(`error while deleting ${isIngress ? 'ingress' : 'route'}`, e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<IngressUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: IngressRouteColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<IngressUI | RouteUI>('Name', {
  renderer: IngressRouteColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let pathColumn = new TableColumn<IngressUI | RouteUI>('Host/Path', {
  width: '1.5fr',
  renderer: IngressRouteColumnHostPath,
  comparator: (a, b) => compareHostPath(a, b),
});

let ageColumn = new TableColumn<IngressUI | RouteUI, Date | undefined>('Age', {
  renderMapping: ingressRoute => ingressRoute.created,
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

function compareHostPath(object1: IngressUI | RouteUI, object2: IngressUI | RouteUI): number {
  const hostPathObject1 = ingressRouteUtils.getHostPaths(object1)[0] ?? '';
  const hostPathObject2 = ingressRouteUtils.getHostPaths(object2)[0] ?? '';
  return hostPathObject1.label.localeCompare(hostPathObject2.label);
}

let backendColumn = new TableColumn<IngressUI | RouteUI>('Backend', {
  width: '1.5fr',
  renderer: IngressRouteColumnBackend,
  comparator: (a, b) => compareBackend(a, b),
});

function compareBackend(object1: IngressUI | RouteUI, object2: IngressUI | RouteUI): number {
  const backendObject1 = ingressRouteUtils.getBackends(object1)[0] ?? '';
  const backendObject2 = ingressRouteUtils.getBackends(object2)[0] ?? '';
  return backendObject1.localeCompare(backendObject2);
}

const columns = [
  statusColumn,
  nameColumn,
  pathColumn,
  backendColumn,
  ageColumn,
  new TableColumn<IngressUI | RouteUI>('Actions', { align: 'right', renderer: IngressRouteColumnActions }),
];

const row = new TableRow<IngressUI | RouteUI>({ selectable: _ingressRoute => true });
</script>

<NavPage bind:searchTerm={searchTerm} title="ingresses & routes">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click={() =>
          withBulkConfirmation(
            deleteSelectedIngressesRoutes,
            `delete ${selectedItemsNumber} Ingress${selectedItemsNumber > 1 ? 'es' : ''} / Route${selectedItemsNumber > 1 ? 's' : ''}`,
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
      kind="ingress & route"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={ingressesRoutesUI}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (ingressesRoutesUI = ingressesRoutesUI)}>
    </Table>

    {#if $kubernetesCurrentContextIngressesFiltered.length === 0 && $kubernetesCurrentContextRoutesFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={IngressRouteIcon} kind="ingresses or routes" bind:searchTerm={searchTerm} />
      {:else}
        <IngressRouteEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
