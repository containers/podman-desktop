<script lang="ts">
import { faQuestionCircle, faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { PortMapping, UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

import type { KubePortInfo } from './kube-port';

interface Props {
  port: KubePortInfo;
  forwardConfig?: UserForwardConfig;
  resourceName?: string;
  namespace?: string;
  kind: WorkloadKind;
}

let { port, forwardConfig, resourceName, namespace, kind }: Props = $props();

let mapping: PortMapping | undefined = $derived(forwardConfig?.forward);
let loading: boolean = $state(false);
let error: string | undefined = $state(undefined);

async function onForwardRequest(port: KubePortInfo): Promise<void> {
  if (!resourceName) throw new Error('pod name is undefined');
  loading = true;
  error = undefined;

  // get a free port starting from 50k
  const freePort = await window.getFreePort(50_000);

  // snapshot the object as Proxy cannot be serialized
  const snapshot: KubePortInfo = $state.snapshot(port);
  try {
    await window.createKubernetesPortForward({
      displayName: `${resourceName}/${snapshot.name}`,
      name: resourceName,
      kind: kind,
      namespace: namespace ?? 'default',
      forward: {
        localPort: freePort,
        remotePort: snapshot.value,
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
    await window.deleteKubernetesPortForward(forwardConfig);
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}
</script>

<span aria-label="port {port.value}" class="flex gap-x-2 items-center">
  {port.displayValue}
  {#if mapping}
    <Button
      title="Open in browser"
      disabled={loading}
      icon={faSquareUpRight}
      on:click={openExternal.bind(undefined)}
      class="px-1 py-0.5"
      padding="0">
      Open
    </Button>
    <Button
      title="Remove port forward"
      disabled={loading}
      icon={faTrash}
      on:click={removePortForward.bind(undefined)}
      class="px-1 py-0.5"
      padding="0">
      Remove
    </Button>
  {:else if (port.protocol ?? 'TCP') === 'TCP'}
    <Button
      title="Forward port {port.value}"
      disabled={loading}
      on:click={onForwardRequest.bind(undefined, port)}
      class="px-1 py-0.5"
      padding="0">
      Forward...
    </Button>
  {:else}
    <Tooltip class="w-min" tip={`${port.protocol} cannot be forwarded.`}>
      <Fa size="1.1x" class="cursor-pointer" icon={faQuestionCircle} />
    </Tooltip>
  {/if}
  {#if error}
    <ErrorMessage error={error} />
  {/if}
</span>
