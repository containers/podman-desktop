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

let userForwardConfig: UserForwardConfig | undefined = $derived(
  $kubernetesCurrentContextPortForwards.find(
    forward => forward.kind === kind && forward.name === resourceName && forward.namespace === namespace,
  ),
);
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port}
          <KubePort namespace={namespace} kind={kind} resourceName={resourceName} port={port} forwardConfig={userForwardConfig}/>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}
