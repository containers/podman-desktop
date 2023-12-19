<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import type { Unsubscriber } from 'svelte/store';
import { filtered, searchPattern } from '../../stores/deployments';
import NavPage from '../ui/NavPage.svelte';
import Table from '../table/Table.svelte';
import { Column, Row } from '../table/table';
import IngressRouteColumnActions from './IngressColumnActions.svelte';
import Button from '../ui/Button.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import SimpleColumn from '../table/SimpleColumn.svelte';
import type { IngressUI } from './IngressUI';
import { IngressRouteUtils } from './ingress-route-utils';
import { ingresses } from '/@/stores/ingresses';
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import type { RouteUI } from './RouteUI';
import IngressRouteColumnName from './IngressRouteColumnName.svelte';
import IngressRouteEmptyScreen from './IngressRouteEmptyScreen.svelte';
import IngressRouteColumnHostPath from './IngressRouteColumnHostPath.svelte';
import IngressRouteColumnBackend from './IngressRouteColumnBackend.svelte';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let ingressesRoutesUI: (IngressUI | RouteUI)[] = [];

const ingressRouteUtils = new IngressRouteUtils();

let ingressesUnsubscribe: Unsubscriber;
let routesUnsubscribe: Unsubscriber;
onMount(async () => {
  ingressesUnsubscribe = ingresses.subscribe(value => {
    ingressesRoutesUI = value.map(ingress => ingressRouteUtils.getIngressUI(ingress));
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
          console.log(`error while deleting ${isIngress ? 'ingress' : 'route'}`, e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

let selectedItemsNumber: number;
let table: Table;

/* let statusColumn = new Column<IngressUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: DeploymentColumnStatus,
  comparator: () => 1, //a.status.localeCompare(b.status),
}); */

let nameColumn = new Column<IngressUI | RouteUI>('Name', {
  width: '2fr',
  renderer: IngressRouteColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let namespaceColumn = new Column<IngressUI | RouteUI, string>('Namespace', {
  renderMapping: ingressRoute => ingressRoute.namespace,
  renderer: SimpleColumn,
  comparator: (a, b) => a.namespace.localeCompare(b.namespace),
});

let pathColumn = new Column<IngressUI | RouteUI, string>('Host/Path', {
  renderer: IngressRouteColumnHostPath,
});

let backendColumn = new Column<IngressUI | RouteUI, string>('Backend', {
  renderer: IngressRouteColumnBackend,
});

const columns: Column<IngressUI | RouteUI, IngressUI | RouteUI | string>[] = [
  //statusColumn,
  nameColumn,
  namespaceColumn,
  pathColumn,
  backendColumn,
  new Column<IngressUI | RouteUI>('Actions', { align: 'right', renderer: IngressRouteColumnActions }),
];

const row = new Row<IngressUI | RouteUI>({ selectable: _ingressRoute => true });
</script>

<NavPage bind:searchTerm="{searchTerm}" title="Ingresses & Routes">
  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedIngressesRoutes()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="ingress & route"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{ingressesRoutesUI}"
      columns="{columns}"
      row="{row}"
      defaultSortColumn="Name">
    </Table>

    {#if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{IngressRouteIcon}" kind="ingresses && routes" bind:searchTerm="{searchTerm}" />
      {:else}
        <IngressRouteEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
