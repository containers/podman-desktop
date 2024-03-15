<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';

import KubeObjectMetaArtifact from './details/KubeObjectMetaArtifact.svelte';
import KubePodSpecArtifact from './details/KubePodSpecArtifact.svelte';
import KubePodStatusArtifact from './details/KubePodStatusArtifact.svelte';

export let pod: V1Pod | undefined;
</script>

<div class="flex px-5 py-4 flex-col items-start h-full overflow-auto">
  {#if pod}
    <table class="w-full">
      <tbody>
        <KubeObjectMetaArtifact artifact="{pod.metadata}" />
        <KubePodStatusArtifact artifact="{pod.status}" />
        <KubePodSpecArtifact artifact="{pod.spec}" />
      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
