<script lang="ts">
import {
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onMount } from 'svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import { kubernetesCurrentContextNodesFiltered, nodeSearchPattern } from '/@/stores/kubernetes-contexts-state';

import NodeIcon from '../images/NodeIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import { NodeUtils } from './node-utils';
import NodeColumnName from './NodeColumnName.svelte';
import NodeColumnRoles from './NodeColumnRoles.svelte';
import NodeColumnStatus from './NodeColumnStatus.svelte';
import NodeEmptyScreen from './NodeEmptyScreen.svelte';
import type { NodeUI } from './NodeUI';

export let searchTerm = '';
$: nodeSearchPattern.set(searchTerm);

let nodes: NodeUI[] = [];

const nodeUtils = new NodeUtils();

onMount(() => {
  return kubernetesCurrentContextNodesFiltered.subscribe(value => {
    nodes = value.map(node => nodeUtils.getNodeUI(node));
  });
});

let table: Table;

let statusColumn = new TableColumn<NodeUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: NodeColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<NodeUI>('Name', {
  renderer: NodeColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let rolesColumn = new TableColumn<NodeUI>('Roles', {
  renderer: NodeColumnRoles,
  overflow: true,
  comparator: (a, b) => a.role.localeCompare(b.role),
});

let ageColumn = new TableColumn<NodeUI, Date | undefined>('Age', {
  renderMapping: node => node.created,
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

let versionColumn = new TableColumn<NodeUI, string>('Version', {
  renderMapping: node => node.version,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.version.localeCompare(b.version),
});

let osImageColumn = new TableColumn<NodeUI, string>('OS', {
  width: '1.5fr',
  renderMapping: node => node.osImage,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.osImage.localeCompare(b.osImage),
});

let kernelVersionColumn = new TableColumn<NodeUI, string>('Kernel', {
  renderMapping: node => node.kernelVersion,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.kernelVersion.localeCompare(b.kernelVersion),
});

const columns = [statusColumn, nameColumn, rolesColumn, versionColumn, osImageColumn, kernelVersionColumn, ageColumn];

const row = new TableRow<NodeUI>({});
</script>

<NavPage bind:searchTerm={searchTerm} title="nodes">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="node"
      bind:this={table}
      data={nodes}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (nodes = nodes)}>
    </Table>

    {#if $kubernetesCurrentContextNodesFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={NodeIcon} kind="nodes" bind:searchTerm={searchTerm} />
      {:else}
        <NodeEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
