<script lang="ts">
import type { V1Container } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';

export let artifact: V1Container | undefined;
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
  {#if artifact.ports}
    <tr>
      <Cell>Ports</Cell>
      <Cell>{artifact.ports?.map(port => `${port.containerPort}/${port.protocol}`).join(', ') || ''}</Cell>
    </tr>
  {/if}
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
