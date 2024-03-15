<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { onMount } from 'svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import { kubernetesCurrentContextServicesFiltered, serviceSearchPattern } from '/@/stores/kubernetes-contexts-state';

import ServiceIcon from '../images/ServiceIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import DurationColumn from '../table/DurationColumn.svelte';
import SimpleColumn from '../table/SimpleColumn.svelte';
import { Column, Row } from '../table/table';
import Table from '../table/Table.svelte';
import Button from '../ui/Button.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import NavPage from '../ui/NavPage.svelte';
import { ServiceUtils } from './service-utils';
import ServiceColumnActions from './ServiceColumnActions.svelte';
import ServiceColumnName from './ServiceColumnName.svelte';
import ServiceColumnStatus from './ServiceColumnStatus.svelte';
import ServiceColumnType from './ServiceColumnType.svelte';
import ServiceEmptyScreen from './ServiceEmptyScreen.svelte';
import type { ServiceUI } from './ServiceUI';

export let searchTerm = '';
$: serviceSearchPattern.set(searchTerm);

let services: ServiceUI[] = [];

const serviceUtils = new ServiceUtils();

onMount(() => {
  return kubernetesCurrentContextServicesFiltered.subscribe(value => {
    services = value.map(service => serviceUtils.getServiceUI(service));
  });
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedServices() {
  const selectedServices = services.filter(service => service.selected);
  if (selectedServices.length === 0) {
    return;
  }

  // mark services for deletion
  bulkDeleteInProgress = true;
  selectedServices.forEach(service => (service.status = 'DELETING'));
  services = services;

  await Promise.all(
    selectedServices.map(async service => {
      try {
        await window.kubernetesDeleteService(service.name);
      } catch (e) {
        console.error('error while deleting service', e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new Column<ServiceUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: ServiceColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new Column<ServiceUI>('Name', {
  width: '1fr',
  renderer: ServiceColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let namespaceColumn = new Column<ServiceUI, string>('Namespace', {
  renderMapping: service => service.namespace,
  renderer: SimpleColumn,
  comparator: (a, b) => a.namespace.localeCompare(b.namespace),
});

let typeColumn = new Column<ServiceUI>('Type', {
  renderer: ServiceColumnType,
  comparator: (a, b) => a.type.localeCompare(b.type),
});

let clusterIPColumn = new Column<ServiceUI, string>('Cluster IP', {
  renderMapping: service => service.clusterIP,
  renderer: SimpleColumn,
  comparator: (a, b) => a.clusterIP.localeCompare(b.clusterIP),
});

let portsColumn = new Column<ServiceUI, string>('Ports', {
  renderMapping: service => service.ports,
  renderer: SimpleColumn,
  comparator: (a, b) => a.ports.localeCompare(b.ports),
});

let ageColumn = new Column<ServiceUI, Date | undefined>('Age', {
  renderMapping: service => service.created,
  renderer: DurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

const columns: Column<ServiceUI, ServiceUI | string | Date | undefined>[] = [
  statusColumn,
  nameColumn,
  namespaceColumn,
  typeColumn,
  clusterIPColumn,
  portsColumn,
  ageColumn,
  new Column<ServiceUI>('Actions', { align: 'right', renderer: ServiceColumnActions }),
];

const row = new Row<ServiceUI>({ selectable: _service => true });
</script>

<NavPage bind:searchTerm="{searchTerm}" title="services">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedServices()}"
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
      kind="service"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{services}"
      columns="{columns}"
      row="{row}"
      on:update="{() => (services = services)}">
    </Table>

    {#if $kubernetesCurrentContextServicesFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{ServiceIcon}" kind="services" bind:searchTerm="{searchTerm}" />
      {:else}
        <ServiceEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
