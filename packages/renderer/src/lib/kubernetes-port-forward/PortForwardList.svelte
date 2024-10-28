<script lang="ts">
import { EmptyScreen, NavPage, Table, TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';

import NodeIcon from '/@/lib/images/KeyIcon.svelte';
import PodNameColumn from '/@/lib/kubernetes-port-forward/PodNameColumn.svelte';
import type { PortForwardRow } from '/@/lib/kubernetes-port-forward/port-forward-row';
import PortForwardActions from '/@/lib/kubernetes-port-forward/PortForwardActions.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';

const columns = [
  new TableColumn<PortForwardRow, { name: string; namespace: string }>('Name', {
    align: 'left',
    renderer: PodNameColumn,
    renderMapping: config => ({ name: config.name, namespace: config.namespace }),
  }),
  new TableColumn<PortForwardRow, string>('Namespace', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => config.namespace,
  }),
  new TableColumn<PortForwardRow, string>('Kind', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => config.kind,
  }),
  new TableColumn<PortForwardRow, string>('Local Port', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => String(config.mapping.localPort),
  }),
  new TableColumn<PortForwardRow, string>('Remote Port', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => String(config.mapping.remotePort),
  }),
  new TableColumn<PortForwardRow>('Actions', {
    align: 'right',
    renderer: PortForwardActions,
  }),
];

const row = new TableRow<PortForwardRow>({});

let portForwardRows: PortForwardRow[] = $derived.by(() => {
  return $kubernetesCurrentContextPortForwards.reduce((accumulator, value) => {
    accumulator.push(
      ...value.forwards.map(forward => ({
        ...value,
        mapping: forward,
      })),
    );
    return accumulator;
  }, [] as PortForwardRow[]);
});
</script>

<NavPage searchEnabled={false} title="Port forward">
  <div class="flex min-w-full h-full" slot="content">
    {#if $kubernetesCurrentContextPortForwards.length > 0}
      <Table
        kind="deployment"
        data={portForwardRows}
        columns={columns}
        row={row}
        defaultSortColumn="Name">
      </Table>
    {:else}
      <EmptyScreen message="You may start a port forward from a pod summary page." icon={NodeIcon} title="No port forward"/>
    {/if}
  </div>
</NavPage>
