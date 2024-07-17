<script lang="ts">
import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';

import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';
import KubePVCArtifact from '../kube/details/KubePVCArtifact.svelte';
import KubePVCStatusArtifact from '../kube/details/KubePVCStatusArtifact.svelte';

export let pvc: V1PersistentVolumeClaim | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error={kubeError} />
{/if}

<Table>
  {#if pvc}
    <KubeObjectMetaArtifact artifact={pvc.metadata} />
    <KubePVCStatusArtifact artifact={pvc.status} />
    <KubePVCArtifact artifact={pvc.spec} />
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
