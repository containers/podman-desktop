<script lang="ts">
import type { V1NodeSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1NodeSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  {#if artifact.externalID}
    <tr>
      <Cell>External ID</Cell>
      <Cell>{artifact.externalID}</Cell>
    </tr>
  {/if}
  {#if artifact.podCIDRs}
    <tr>
      <Cell>Pod CIDRs</Cell>
      <Cell>
        {#each artifact.podCIDRs as cidr}
          <div>{cidr}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.providerID}
    <tr>
      <Cell>Provider ID</Cell>
      <Cell>{artifact.providerID}</Cell>
    </tr>
  {/if}
  {#if artifact.taints}
    <tr>
      <Title>Taints</Title>
      <Cell>
        <table>
          <tbody>
            {#each artifact.taints as taint}
              <tr>
                <Cell>{taint.key}</Cell>
                <Cell>Effect: {taint.effect}, Value: {taint.value ?? 'N/A'}</Cell>
              </tr>
            {/each}
          </tbody>
        </table>
      </Cell>
    </tr>
  {/if}
  <tr>
    <Cell>Unschedulable</Cell>
    <Cell>{artifact.unschedulable ? 'Yes' : 'No'}</Cell>
  </tr>
{/if}
