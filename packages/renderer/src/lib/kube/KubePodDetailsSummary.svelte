<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';

import Table from '/@/lib/details/DetailsTable.svelte';

import type { EventUI } from '../events/EventUI';
import KubeEventsArtifact from './details/KubeEventsArtifact.svelte';
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
    <KubeEventsArtifact events={events} />
  {:else}
    <p class="text-[var(--pd-state-info)] font-medium">Loading ...</p>
  {/if}
</Table>
