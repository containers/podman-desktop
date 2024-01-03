<script lang="ts">
import type { V1Deployment } from '@kubernetes/client-node';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import DeploymentColumnConditions from './DeploymentColumnConditions.svelte';
import type { DeploymentUI } from './DeploymentUI';
import DeploymentColumnPods from './DeploymentColumnPods.svelte';

export let deploymentUI: DeploymentUI;
export let deployment: V1Deployment | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the 
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  {#if deployment}
    <table class="w-full">
      <tbody>
        <tr>
          <td class="pr-2">Name</td>
          <td>{deployment.metadata?.name}</td>
        </tr>
        <tr>
          <td class="pr-2">Namespace</td>
          <td>{deployment.metadata?.namespace}</td>
        </tr>
        <tr>
          <td class="pr-2">Created</td>
          <td>{deployment.metadata?.creationTimestamp}</td>
        </tr>
        <tr>
          <td class="pr-2">Conditions</td>
          <td><DeploymentColumnConditions object="{deploymentUI}" /></td>
        </tr>
        <tr>
          <td class="pr-2">Pods</td>
          <td><DeploymentColumnPods object="{deploymentUI}" /></td>
        </tr>
      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
