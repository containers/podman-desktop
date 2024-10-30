<script lang="ts">
import type { V1Container } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import { WorkloadKind } from '/@api/kubernetes-port-forward-model';

import KubePortsList from './KubePortsList.svelte';

interface Props {
  artifact?: V1Container;
  podName?: string;
  namespace?: string;
}
let { artifact, podName, namespace }: Props = $props();
</script>

{#if artifact}
  <tr>
    <Cell>Name</Cell>
    <Cell>{artifact.name}</Cell>
  </tr>
  <tr>
    <Cell>Image</Cell>
    <Cell>{artifact.image}</Cell>
  </tr>
  <tr>
    <Cell>Image Pull Policy</Cell>
    <Cell>{artifact.imagePullPolicy}</Cell>
  </tr>
  <KubePortsList namespace={namespace} resourceName={podName} kind={WorkloadKind.POD} ports={artifact.ports?.map((port) => ({
    name: port.name,
    value: port.containerPort,
    protocol: port.protocol,
    displayValue: `${port.name ? port.name + ':' : ''}${port.containerPort}/${port.protocol}`,
  }))}/>
  {#if artifact.env}
    <tr>
      <Cell>Environment Variables</Cell>
      <Cell>
        {#each artifact.env ? artifact.env.map(e => `${e.name}: ${e.value}`) : [] as env}
          <div>{env}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.volumeMounts}
    <tr>
      <Cell>Volume Mounts</Cell>
      <Cell>{artifact.volumeMounts?.map(vm => vm.name).join(', ') || ''}</Cell>
    </tr>
  {/if}
{/if}
