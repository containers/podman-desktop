<script lang="ts">
import type { V1Service } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';
import KubeServiceArtifact from '../kube/details/KubeServiceArtifact.svelte';
import KubeServiceStatusArtifact from '../kube/details/KubeServiceStatusArtifact.svelte';

export let service: V1Service | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error={kubeError} />
{/if}

<Table>
  {#if service}
    <KubeObjectMetaArtifact artifact={service.metadata} />
    <KubeServiceStatusArtifact artifact={service.status} />
    <KubeServiceArtifact artifact={service.spec} />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
