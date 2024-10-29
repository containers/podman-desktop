<script lang="ts">
import type { V1Deployment } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Table from '/@/lib/details/DetailsTable.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

import type { EventUI } from '../events/EventUI';
import EventsTable from '../kube/details/EventsTable.svelte';
import KubeDeploymentArtifact from '../kube/details/KubeDeploymentArtifact.svelte';
import KubeDeploymentStatusArtifact from '../kube/details/KubeDeploymentStatusArtifact.svelte';
import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';

export let deployment: V1Deployment | undefined;
export let kubeError: string | undefined = undefined;
export let events: EventUI[];
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error={kubeError} />
{/if}

<Table>
  {#if deployment}
    <KubeObjectMetaArtifact artifact={deployment.metadata} />
    <KubeDeploymentStatusArtifact artifact={deployment.status} />
    <KubeDeploymentArtifact artifact={deployment.spec} />
  {:else}
    <p class="text-[var(--pd-state-info)] font-medium">Loading ...</p>
  {/if}
  <tr>
    <Title>Events</Title>
  </tr>
  {#if events.length}
    <EventsTable events={events} />
  {:else}
    <tr><Cell>No events</Cell></tr>
  {/if}
</Table>
