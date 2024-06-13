<script lang="ts">
import type { V1PodStatus } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsSubtitle.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1PodStatus | undefined;

if (artifact?.startTime) {
  artifact.startTime = new Date(artifact.startTime);
}
</script>

{#if artifact}
  <tr>
    <Title>Status</Title>
  </tr>
  <tr>
    <Cell>Phase</Cell>
    <Cell>{artifact?.phase}</Cell>
  </tr>
  <tr>
    <Cell>Pod IP</Cell>
    <Cell>{artifact?.podIP}</Cell>
  </tr>
  <tr>
    <Cell>Host IP</Cell>
    <Cell>{artifact?.hostIP}</Cell>
  </tr>
  <tr>
    <Cell>Start Time</Cell>
    <Cell>{artifact?.startTime}</Cell>
  </tr>

  <!-- If containerStatus and at least one in the array has a 'state' that's not undefined.
    as the "state" information is where the warning is (unable to pull image, etc.) -->
  {#if artifact.containerStatuses?.some(containerStatus => containerStatus.state)}
    <tr>
      <Title>Container Status</Title>
    </tr>
    {#each artifact.containerStatuses as containerStatus}
      {#if containerStatus.state}
        <tr>
          <Subtitle>{containerStatus.name}</Subtitle>
        </tr>
        {#if containerStatus.state.waiting}
          <tr>
            <Cell>Waiting</Cell>
            <Cell>{containerStatus.state.waiting.reason}</Cell>
          </tr>
          <tr>
            <Cell>Message</Cell>
            <Cell>{containerStatus.state.waiting.message}</Cell>
          </tr>
        {/if}
        {#if containerStatus.state.terminated}
          <tr>
            <Cell>Terminated</Cell>
            <Cell>{containerStatus.state.terminated.reason}</Cell>
          </tr>
          <tr>
            <Cell>Exit Code</Cell>
            <Cell>{containerStatus.state.terminated.exitCode}</Cell>
          </tr>
        {/if}
      {/if}
    {/each}
  {/if}
{/if}
