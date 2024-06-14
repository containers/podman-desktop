<script lang="ts">
import type { V1DeploymentSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1DeploymentSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Replicas</Cell>
    <Cell>{artifact.replicas}</Cell>
  </tr>
  {#if artifact.selector.matchLabels}
    <tr>
      <Cell>Selector</Cell>
      <Cell>
        {#each Object.entries(artifact.selector.matchLabels) as [key, value]}
          <div>{key}: {value}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.strategy}
    <tr>
      <Cell>Strategy</Cell>
      <Cell>{artifact.strategy.type}</Cell>
    </tr>
  {/if}
{/if}
