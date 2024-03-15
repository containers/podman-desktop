<script lang="ts">
import type { V1PodSpec } from '@kubernetes/client-node';

import Container from './KubeContainerArtifact.svelte';
import Volume from './KubeVolumeArtifact.svelte';
import Cell from './ui/Cell.svelte';
import Subtitle from './ui/Subtitle.svelte';
import Title from './ui/Title.svelte';

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
      <Container artifact="{container}" />
    {/each}
  {/if}

  {#if artifact.volumes}
    <tr>
      <Title>Volumes</Title>
    </tr>
    {#each artifact.volumes as volume}
      <Volume artifact="{volume}" />
    {/each}
  {/if}
{/if}
