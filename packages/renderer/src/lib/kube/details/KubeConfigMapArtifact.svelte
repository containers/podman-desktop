<script lang="ts">
import type { V1ConfigMap } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import Subtitle from '../../details/DetailsSubtitle.svelte';

export let artifact: V1ConfigMap | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Immutable</Cell>
    <Cell>{artifact.immutable ? 'Yes' : 'No'}</Cell>
  </tr>
  {#if artifact.binaryData}
    <tr>
      <Cell>Binary Data</Cell>
      <Cell>
        {#each Object.entries(artifact.binaryData) as [key, value]}
          <div>{key}: {value.length} bytes</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.data}
    <tr>
      <Subtitle>Data</Subtitle>
    </tr>
    {#each Object.entries(artifact.data) as [key, value]}
      <tr>
        <Cell>{key}</Cell>
        <Cell>{value}</Cell>
      </tr>
    {/each}
  {/if}
{/if}
