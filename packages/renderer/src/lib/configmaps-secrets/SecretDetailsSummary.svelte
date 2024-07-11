<script lang="ts">
import type { V1Secret } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';
import KubeSecretArtifact from '../kube/details/KubeSecretArtifact.svelte';

export let secret: V1Secret | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<Table>
  {#if secret}
    <KubeObjectMetaArtifact artifact="{secret.metadata}" />
    <KubeSecretArtifact artifact="{secret}" />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
