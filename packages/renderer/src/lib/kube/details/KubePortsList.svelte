<script lang="ts">
import Cell from '/@/lib/details/DetailsCell.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import type { UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

import type { KubePortInfo } from './kube-port';
import KubePort from './KubePort.svelte';

interface Props {
  ports?: KubePortInfo[];
  resourceName?: string;
  namespace?: string;
  kind: WorkloadKind;
}

let { ports, resourceName, namespace, kind }: Props = $props();

let forwardConfigs: Map<number, UserForwardConfig> = $derived(
  new Map(
    $kubernetesCurrentContextPortForwards
      .filter(forward => forward.kind === kind && forward.name === resourceName && forward.namespace === namespace)
      .map(config => [config.forward.remotePort, config]),
  ),
);
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port}
          <KubePort namespace={namespace} kind={kind} resourceName={resourceName} port={port} forwardConfig={forwardConfigs.get(port.value)}/>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}
