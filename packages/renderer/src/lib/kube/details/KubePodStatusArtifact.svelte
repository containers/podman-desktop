<script lang="ts">
import type { V1PodStatus } from '@kubernetes/client-node';

import Cell from './ui/Cell.svelte';
import Title from './ui/Title.svelte';

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
{/if}
