<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Table from '/@/lib/details/DetailsTable.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import type { EventUI } from '../events/EventUI';
import EventsTable from './details/EventsTable.svelte';
import KubeObjectMetaArtifact from './details/KubeObjectMetaArtifact.svelte';
import KubePodSpecArtifact from './details/KubePodSpecArtifact.svelte';
import KubePodStatusArtifact from './details/KubePodStatusArtifact.svelte';

export let pod: V1Pod | undefined;
export let events: EventUI[];
</script>

<Table>
  {#if pod}
    <KubeObjectMetaArtifact artifact={pod.metadata} />
    <KubePodStatusArtifact artifact={pod.status} />
    <KubePodSpecArtifact podName={pod.metadata?.name} namespace={pod.metadata?.namespace} artifact={pod.spec} />
    <tr>
      <Title>Events</Title>
    </tr>
    {#if events?.length}
      <EventsTable events={events} />
    {:else}
      <tr><Cell>No events</Cell></tr>
    {/if}
  {:else}
    <p class="text-[var(--pd-state-info)] font-medium">Loading ...</p>
  {/if}
</Table>
