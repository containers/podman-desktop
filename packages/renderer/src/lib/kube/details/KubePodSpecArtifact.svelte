<script lang="ts">
import type { V1PodSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsSubtitle.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import Container from './KubeContainerArtifact.svelte';
import Volume from './KubeVolumeArtifact.svelte';

export let artifact: V1PodSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Node Name</Cell>
    <Cell>{artifact?.nodeName}</Cell>
  </tr>
  <tr>
    <Cell>Service Account</Cell>
    <Cell>{artifact?.serviceAccountName}</Cell>
  </tr>
  <tr>
    <Cell>Restart Policy</Cell>
    <Cell>{artifact?.restartPolicy}</Cell>
  </tr>
  <tr>
    <Cell>Containers</Cell>
    <Cell>{artifact?.containers.map(c => c.name).join(', ')}</Cell>
  </tr>

  {#if artifact.containers}
    <tr>
      <Title>Containers</Title>
    </tr>
    {#each artifact.containers as container}
      <tr>
        <Subtitle>{container.name}</Subtitle>
      </tr>
      <Container artifact={container} />
    {/each}
  {/if}

  {#if artifact.volumes}
    <tr>
      <Title>Volumes</Title>
    </tr>
    {#each artifact.volumes as volume}
      <Volume artifact={volume} />
    {/each}
  {/if}
{/if}
