<script lang="ts">
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { EmptyScreen, NavPage, Table, TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';

import PortForwardActions from '/@/lib/kubernetes-port-forward/PortForwardActions.svelte';
import PortForwardIcon from '/@/lib/kubernetes-port-forward/PortForwardIcon.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import type { ForwardConfig } from '/@api/kubernetes-port-forward-model';

import PodNameColumn from './PortForwardNameColumn.svelte';

const columns = [
  new TableColumn<ForwardConfig>('Status', {
    align: 'center',
    width: '70px',
    renderer: PortForwardIcon,
  }),
  new TableColumn<ForwardConfig>('Name', {
    align: 'left',
    renderer: PodNameColumn,
  }),
  new TableColumn<ForwardConfig, string>('Type', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => config.kind,
  }),
  new TableColumn<ForwardConfig, string>('Local Port', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => String(config.forward.localPort),
  }),
  new TableColumn<ForwardConfig, string>('Remote Port', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => String(config.forward.remotePort),
  }),
  new TableColumn<ForwardConfig>('Actions', {
    align: 'right',
    renderer: PortForwardActions,
  }),
];

const row = new TableRow<ForwardConfig>({});
</script>

<NavPage searchEnabled={false} title="Port forwarding">
  <div class="flex min-w-full h-full" slot="content">
    {#if $kubernetesCurrentContextPortForwards.length > 0}
      <Table
        kind="port"
        data={$kubernetesCurrentContextPortForwards}
        columns={columns}
        row={row}
        defaultSortColumn="Name">
      </Table>
    {:else}
      <EmptyScreen message="Start forwarding ports from the Pod Details > Summary tab" icon={faEthernet} title="No port forwarding configured"/>
    {/if}
  </div>
</NavPage>
