<script lang="ts">
import { EmptyScreen, NavPage, Table, TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';

import NodeIcon from '/@/lib/images/KeyIcon.svelte';
import PortForwardActions from '/@/lib/kubernetes-port-forward/PortForwardActions.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import type { UserForwardConfig } from '/@api/kubernetes-port-forward-model';

const columns = [
  new TableColumn<UserForwardConfig, string>('Name', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => config.displayName,
  }),
  new TableColumn<UserForwardConfig, string>('Ports', {
    align: 'left',
    renderer: TableSimpleColumn,
    renderMapping: config => config.forwards.map(forward => `${forward.remotePort}->${forward.localPort}`).join(', '),
  }),
  new TableColumn<UserForwardConfig>('Actions', {
    align: 'right',
    renderer: PortForwardActions,
  }),
];

const row = new TableRow<UserForwardConfig>({ selectable: _deployment => true });
</script>

<NavPage searchEnabled={false} title="Port forward">
  <div class="flex min-w-full h-full" slot="content">
    {#if $kubernetesCurrentContextPortForwards.length > 0}
      <Table
        kind="deployment"
        data={$kubernetesCurrentContextPortForwards}
        columns={columns}
        row={row}
        defaultSortColumn="Name">
      </Table>
    {:else}
      <EmptyScreen icon={NodeIcon} title="No port forward"/>
    {/if}
  </div>
</NavPage>
