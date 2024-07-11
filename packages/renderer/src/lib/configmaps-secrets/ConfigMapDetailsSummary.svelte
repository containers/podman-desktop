<script lang="ts">
import type { V1ConfigMap } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeConfigMapArtifact from '../kube/details/KubeConfigMapArtifact.svelte';
import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';

export let configMap: V1ConfigMap | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<Table>
  {#if configMap}
    <KubeObjectMetaArtifact artifact="{configMap.metadata}" />
    <KubeConfigMapArtifact artifact="{configMap}" />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
