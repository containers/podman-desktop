<script lang="ts">
import type { V1ContainerPort } from '@kubernetes/client-node';
import { Button } from '@podman-desktop/ui-svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

interface Props {
  ports?: V1ContainerPort[];
  podName?: string;
}

let loading: boolean = $state(false);
let { ports, podName }: Props = $props();

function onForwardRequest(port: V1ContainerPort): Promise<void> {
  if (!podName) throw new Error('pod name is undefined');

  const snapshot = $state.snapshot(port);
  return window
    .createKubernetesPortForward({
      displayName: `${snapshot.name} forward`,
      name: podName,
      kind: WorkloadKind.POD,
      namespace: 'default',
      forwards: [
        {
          localPort: 55010,
          remotePort: snapshot.containerPort,
        },
      ],
    })
    .then((result: UserForwardConfig) => {
      console.log(result);
    })
    .finally(() => {
      loading = false;
    });
}
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port (port.containerPort)}
          <span class="flex gap-x-2">
            {port.containerPort}/{port.protocol} <Button inProgress={loading} disabled={loading} on:click={onForwardRequest.bind(undefined, port)} class="px-1 py-0.5" padding="0">Forward...</Button>
          </span>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}

