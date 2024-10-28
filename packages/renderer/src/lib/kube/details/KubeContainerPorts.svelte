<script lang="ts">
import type { V1ContainerPort } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import KubeContainerPort from '/@/lib/kube/details/KubeContainerPort.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

interface Props {
  ports?: V1ContainerPort[];
  podName?: string;
  namespace?: string;
}

let { ports, podName, namespace }: Props = $props();

let userForwardConfig: UserForwardConfig | undefined = $derived(
  $kubernetesCurrentContextPortForwards.find(
    forward => forward.kind === WorkloadKind.POD && forward.name === podName && forward.namespace === namespace,
  ),
);
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port}
          <KubeContainerPort namespace={namespace} podName={podName} port={port} forwardConfig={userForwardConfig}/>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}
