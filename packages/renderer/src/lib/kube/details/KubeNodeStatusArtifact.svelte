<script lang="ts">
import type { V1NodeStatus } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsSubtitle.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1NodeStatus | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Status</Title>
  </tr>
  {#if artifact.conditions}
    <tr>
      <Title>Conditions</Title>
    </tr>
    {#each artifact.conditions as condition}
      <tr>
        <Subtitle>{condition.reason}</Subtitle>
      </tr>
      <tr>
        <Cell>Type</Cell>
        <Cell>{condition.type}</Cell>
      </tr>
      <tr>
        <Cell>Status</Cell>
        <Cell>{condition.status}</Cell>
      </tr>
      <tr>
        <Cell>Reason</Cell>
        <Cell>{condition.reason}</Cell>
      </tr>
      <tr>
        <Cell>Message</Cell>
        <Cell>{condition.message}</Cell>
      </tr>
    {/each}
  {/if}
  {#if artifact.addresses}
    <tr>
      <Title>Addresses</Title>
    </tr>
    {#each artifact.addresses as address}
      <tr>
        <Cell>{address.type}</Cell>
        <Cell>{address.address}</Cell>
      </tr>
    {/each}
  {/if}
  {#if artifact.capacity}
    <tr>
      <Title>Capacity</Title>
    </tr>
    {#each Object.entries(artifact.capacity) as [key, value]}
      <tr>
        <Cell>{key}</Cell>
        <Cell>{value}</Cell>
      </tr>
    {/each}
  {/if}
  {#if artifact.allocatable}
    <tr>
      <Title>Allocatable</Title>
    </tr>
    {#each Object.entries(artifact.allocatable) as [key, value]}
      <tr>
        <Cell>{key}</Cell>
        <Cell>{value}</Cell>
      </tr>
    {/each}
  {/if}
{/if}
