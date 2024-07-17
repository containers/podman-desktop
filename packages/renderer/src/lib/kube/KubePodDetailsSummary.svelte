<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeObjectMetaArtifact from './details/KubeObjectMetaArtifact.svelte';
import KubePodSpecArtifact from './details/KubePodSpecArtifact.svelte';
import KubePodStatusArtifact from './details/KubePodStatusArtifact.svelte';

export let pod: V1Pod | undefined;
</script>

<Table>
  {#if pod}
    <KubeObjectMetaArtifact artifact={pod.metadata} />
    <KubePodStatusArtifact artifact={pod.status} />
    <KubePodSpecArtifact artifact={pod.spec} />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
