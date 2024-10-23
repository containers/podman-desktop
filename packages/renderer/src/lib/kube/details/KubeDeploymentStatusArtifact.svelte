<script lang="ts">
import type { V1DeploymentStatus } from '@kubernetes/client-node';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Table from '/@/lib/details/DetailsTable.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

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
    <tr>
      <td colspan="2">
        <Table>
          <tr>
            <th align="left">Type</th><th align="left">Status</th><th align="left">Updated</th><th align="left">Reason</th><th align="left">Message</th>
          </tr>
          {#each artifact.conditions as condition}
            <tr>
              <td>{condition.type}</td>
              <td>{condition.status}</td>
              <td>{humanizeDuration(moment().diff(condition.lastTransitionTime), { round: true, largest: 1 })}</td>
              <td>{condition.reason}</td>
              <td>{condition.message}</td>
            </tr>
          {/each}
        </Table>
      </td>
    </tr>
  {/if}
{/if}
