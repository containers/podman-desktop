<script lang="ts">
import type { V1DeploymentSpec } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsSubtitle.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';
import { WorkloadKind } from '/@api/kubernetes-port-forward-model';

import Container from './KubeContainerArtifact.svelte';

interface Props {
  artifact?: V1DeploymentSpec;
  deploymentName?: string;
  namespace?: string;
}
let { artifact, deploymentName, namespace }: Props = $props();
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  <tr>
    <Cell>Replicas</Cell>
    <Cell>{artifact.replicas}</Cell>
  </tr>
  {#if artifact.selector.matchLabels}
    <tr>
      <Cell>Selector</Cell>
      <Cell>
        {#each Object.entries(artifact.selector.matchLabels) as [key, value]}
          <div>{key}: {value}</div>
        {/each}
      </Cell>
    </tr>
  {/if}
  {#if artifact.strategy}
    <tr>
      <Cell>Strategy</Cell>
      <Cell>{artifact.strategy.type}</Cell>
    </tr>
  {/if}
  {#if artifact.template.spec?.containers}
    <tr>
      <Title>Containers</Title>
    </tr>
    {#each artifact.template.spec?.containers as container}
      <tr>
        <Subtitle>{container.name}</Subtitle>
      </tr>
      <Container kind={WorkloadKind.DEPLOYMENT} namespace={namespace} resourceName={deploymentName} artifact={container} />
    {/each}
  {/if}

{/if}
