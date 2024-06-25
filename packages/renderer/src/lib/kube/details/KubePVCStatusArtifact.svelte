<script lang="ts">
import type { V1PersistentVolumeClaimStatus } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1PersistentVolumeClaimStatus | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Status</Title>
  </tr>
  {#if artifact.phase}
    <tr>
      <Cell>Phase</Cell>
      <Cell>{artifact.phase}</Cell>
    </tr>
  {/if}
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
  {#if artifact.capacity}
    <tr>
      <Cell>Capacity</Cell>
      <Cell>
        <table>
          <tbody>
            {#each Object.entries(artifact.capacity) as [resource, quantity]}
              <tr>
                <Cell>{resource}: {quantity}</Cell>
              </tr>
            {/each}
          </tbody>
        </table>
      </Cell>
    </tr>
  {/if}
  {#if artifact.conditions}
    <tr>
      <Title>Conditions</Title>
      <Cell>
        <table>
          <tbody>
            {#each artifact.conditions as condition}
              <tr>
                <Cell>Type: {condition.type}</Cell>
                <Cell
                  >Status: {condition.status}, LastProbeTime: {condition.lastProbeTime
                    ? condition.lastProbeTime
                    : 'N/A'}, LastTransitionTime: {condition.lastTransitionTime
                    ? condition.lastTransitionTime
                    : 'N/A'}</Cell>
              </tr>
            {/each}
          </tbody>
        </table>
      </Cell>
    </tr>
  {/if}
{/if}
