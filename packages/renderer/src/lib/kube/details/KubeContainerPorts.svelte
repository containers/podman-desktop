<script lang="ts">
import { faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { V1ContainerPort } from '@kubernetes/client-node';
import { Button } from '@podman-desktop/ui-svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

interface Props {
  ports?: V1ContainerPort[];
  podName?: string;
  namespace?: string;
}

let loading: boolean = $state(false);
let { ports, podName, namespace }: Props = $props();

let userForwardConfig: UserForwardConfig | undefined = $derived(
  $kubernetesCurrentContextPortForwards.find(
    forward => forward.kind === WorkloadKind.POD && forward.name === podName && forward.namespace === namespace,
  ),
);

let portsMapping: Map<number, number> = $derived.by(() => {
  return new Map<number, number>((userForwardConfig?.forwards ?? []).map(value => [value.remotePort, value.localPort]));
});

async function onForwardRequest(port: V1ContainerPort): Promise<void> {
  if (!podName) throw new Error('pod name is undefined');
  loading = true;

  // get a free port starting from 50k
  const freePort = await window.getFreePort(50_000);

  // snapshot the object as Proxy cannot be serialized
  const snapshot = $state.snapshot(port);
  try {
    await window.createKubernetesPortForward({
      displayName: `${snapshot.name} forward`,
      name: podName,
      kind: WorkloadKind.POD,
      namespace: namespace ?? 'default',
      forwards: [
        {
          localPort: freePort,
          remotePort: snapshot.containerPort,
        },
      ],
    });
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}

async function openExternal(localPort?: number): Promise<void> {
  if (!localPort) return;
  return window.openExternal(`http://localhost:${localPort}`);
}

async function removePortForward(): Promise<void> {
  if (!userForwardConfig) return;
  loading = true;

  try {
    await window.deleteKubernetesPortForward(userForwardConfig);
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port (port.containerPort)}
          <span class="flex gap-x-2 items-center">
            {port.containerPort}/{port.protocol}
            {#if portsMapping.has(port.containerPort)}
              <Button title="Open in browser" icon={faSquareUpRight} on:click={openExternal.bind(undefined, portsMapping.get(port.containerPort))} class="px-1 py-0.5" padding="0">
                Open
              </Button>
              <Button title="Remove port forward" icon={faTrash} on:click={removePortForward.bind(undefined)} class="px-1 py-0.5" padding="0">
                Remove
              </Button>
            {:else}
              <Button title="Forward container port {port.containerPort}" inProgress={loading} disabled={loading} on:click={onForwardRequest.bind(undefined, port)} class="px-1 py-0.5" padding="0">
                Forward...
              </Button>
            {/if}
          </span>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}

