<script lang="ts">
import { faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { V1ContainerPort } from '@kubernetes/client-node';
import { Button, ErrorMessage } from '@podman-desktop/ui-svelte';

import { type PortMapping, type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

interface Props {
  port: V1ContainerPort;
  forwardConfig?: UserForwardConfig;
  podName?: string;
  namespace?: string;
}

let { port, forwardConfig, podName, namespace }: Props = $props();

let mapping: PortMapping | undefined = $derived(
  forwardConfig?.forwards.find(mapping => mapping.remotePort === port.containerPort),
);
let loading: boolean = $state(false);
let error: string | undefined = $state(undefined);

async function onForwardRequest(port: V1ContainerPort): Promise<void> {
  if (!podName) throw new Error('pod name is undefined');
  loading = true;
  error = undefined;

  // get a free port starting from 50k
  const freePort = await window.getFreePort(50_000);

  // snapshot the object as Proxy cannot be serialized
  const snapshot = $state.snapshot(port);
  try {
    await window.createKubernetesPortForward({
      displayName: `${podName}/${snapshot.name}`,
      name: podName,
      kind: WorkloadKind.POD,
      namespace: namespace ?? 'default',
      forward: {
        localPort: freePort,
        remotePort: snapshot.containerPort,
      },
    });
    error = undefined;
  } catch (err: unknown) {
    console.error(err);
    error = String(err);
  } finally {
    loading = false;
  }
}

async function openExternal(): Promise<void> {
  if (!mapping) return;
  return window.openExternal(`http://localhost:${mapping.localPort}`);
}

async function removePortForward(): Promise<void> {
  if (!mapping) return;
  if (!forwardConfig) return;
  loading = true;

  try {
    await window.deleteKubernetesPortForward(forwardConfig, mapping);
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}
</script>

<span aria-label="container port {port.containerPort}" class="flex gap-x-2 items-center">
  {port.containerPort}/{port.protocol}
  {#if mapping}
    <Button title="Open in browser" disabled={loading} icon={faSquareUpRight} on:click={openExternal.bind(undefined)} class="px-1 py-0.5" padding="0">
      Open
    </Button>
    <Button title="Remove port forward" disabled={loading} icon={faTrash} on:click={removePortForward.bind(undefined)} class="px-1 py-0.5" padding="0">
      Remove
    </Button>
  {:else}
    <Button title="Forward container port {port.containerPort}" disabled={loading} on:click={onForwardRequest.bind(undefined, port)} class="px-1 py-0.5" padding="0">
      Forward...
    </Button>
  {/if}
  {#if error}
     <ErrorMessage error={error} />
  {/if}
</span>
