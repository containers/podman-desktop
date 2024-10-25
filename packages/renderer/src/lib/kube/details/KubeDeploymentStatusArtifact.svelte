<script lang="ts">
import type { V1DeploymentStatus } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import ConditionsTable from './ConditionsTable.svelte';

export let artifact: V1DeploymentStatus | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Status</Title>
  </tr>
  <tr>
    <Cell>Replicas</Cell>
    <Cell>
      Desired: {artifact.replicas ?? 'N/A'}, Updated: {artifact.updatedReplicas ?? 'N/A'}, Total: {artifact.replicas ??
        'N/A'}, Available: {artifact.availableReplicas ?? 'N/A'}, Unavailable: {artifact.unavailableReplicas ?? 'N/A'}
    </Cell>
  </tr>
  {#if artifact.conditions}
    <tr>
      <Title>Conditions</Title>
    </tr>
    <ConditionsTable conditions={artifact.conditions} />
  {/if}
{/if}
