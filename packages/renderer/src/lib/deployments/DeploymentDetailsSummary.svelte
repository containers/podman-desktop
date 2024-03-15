<script lang="ts">
import type { V1Deployment } from '@kubernetes/client-node';

import KubeDeploymentArtifact from '../kube/details/KubeDeploymentArtifact.svelte';
import KubeDeploymentStatusArtifact from '../kube/details/KubeDeploymentStatusArtifact.svelte';
import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let deployment: V1Deployment | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the 
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<div class="flex px-5 py-4 flex-col items-start h-full overflow-auto">
  {#if deployment}
    <table class="w-full">
      <tbody>
        <KubeObjectMetaArtifact artifact="{deployment.metadata}" />
        <KubeDeploymentStatusArtifact artifact="{deployment.status}" />
        <KubeDeploymentArtifact artifact="{deployment.spec}" />
      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
