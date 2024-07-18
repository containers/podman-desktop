<script lang="ts">
import type { V1Node } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeNodeArtifact from '../kube/details/KubeNodeArtifact.svelte';
import KubeNodeStatusArtifact from '../kube/details/KubeNodeStatusArtifact.svelte';
import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';

export let node: V1Node | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error={kubeError} />
{/if}

<Table>
  {#if node}
    <KubeObjectMetaArtifact artifact={node.metadata} />
    <KubeNodeStatusArtifact artifact={node.status} />
    <KubeNodeArtifact artifact={node.spec} />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
