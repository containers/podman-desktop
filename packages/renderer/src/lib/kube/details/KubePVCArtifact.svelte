<script lang="ts">
import type { V1PersistentVolumeClaimSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1PersistentVolumeClaimSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  {#if artifact.accessModes}
    <tr>
      <Cell>Access Modes</Cell>
      <Cell>
        {#each artifact.accessModes as mode}
          <div>{mode}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.storageClassName}
    <tr>
      <Cell>Storage Class Name</Cell>
      <Cell>{artifact.storageClassName}</Cell>
    </tr>
  {/if}
  {#if artifact.volumeMode}
    <tr>
      <Cell>Volume Mode</Cell>
      <Cell>{artifact.volumeMode}</Cell>
    </tr>
  {/if}
  {#if artifact.resources?.requests}
    <tr>
      <Cell>Requests</Cell>
      {#if artifact.resources.requests}
        {#each Object.entries(artifact.resources.requests) as [resourceType, quantity]}
          <tr>
            <Cell>{resourceType}: {quantity}</Cell>
          </tr>
        {/each}
      {/if}
    </tr>
  {/if}
  {#if artifact.resources?.limits}
    <tr>
      <Cell>Limits</Cell>
      {#each Object.entries(artifact.resources.limits) as [resourceType, quantity]}
        <tr>
          <Cell>{resourceType}: {quantity}</Cell>
        </tr>
      {/each}
    </tr><tr> </tr>{/if}

  {#if artifact.selector}
    <tr>
      <Title>Selector</Title>
      {#if artifact.selector.matchLabels}
        {#each Object.entries(artifact.selector.matchLabels) as [label, value]}
          <tr>
            <Cell>Match Label: {label}</Cell>
            <Cell>{value}</Cell>
          </tr>
        {/each}
      {/if}
      {#if artifact.selector.matchExpressions}
        {#each artifact.selector.matchExpressions as expression}
          {#if expression.values}
            <tr>
              <Cell>Expression: {expression.key} {expression.operator}</Cell>
              <Cell>{expression.values.join(', ')}</Cell>
            </tr>
          {/if}
        {/each}
      {/if}
    </tr>
  {/if}
{/if}
