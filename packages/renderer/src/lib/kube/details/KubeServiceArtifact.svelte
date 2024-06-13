<script lang="ts">
import type { V1ServiceSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1ServiceSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Type</Cell>
    <Cell>{artifact?.type}</Cell>
  </tr>
  <tr>
    <Cell>Cluster IP</Cell>
    <Cell>{artifact?.clusterIP}</Cell>
  </tr>
  {#if artifact?.externalIPs}
    <tr>
      <Cell>External IPs</Cell>
      <Cell>{artifact?.externalIPs?.join(', ') || ''}</Cell>
    </tr>
  {/if}
  <tr>
    <Cell>Session Affinity</Cell>
    <Cell>{artifact?.sessionAffinity}</Cell>
  </tr>
  {#if artifact.ports}
    <tr>
      <Cell>Ports</Cell>
      <Cell>
        {#each artifact.ports as port}
          <div>
            {port.name ? port.name + ':' : ''}{port.port}{port.nodePort ? ':' + port.nodePort : ''}/{port.protocol}
          </div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.selector}
    <tr>
      <Cell>Selectors</Cell>
      <Cell>
        {#each Object.entries(artifact.selector) as [key, value]}
          <div>{key}: {value}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
{/if}
