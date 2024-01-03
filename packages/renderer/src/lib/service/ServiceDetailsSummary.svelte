<script lang="ts">
import type { V1Service } from '@kubernetes/client-node';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import type { ServiceUI } from './ServiceUI';
import ServiceColumnType from './ServiceColumnType.svelte';

export let serviceUI: ServiceUI;
export let service: V1Service | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the 
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  {#if service}
    <table class="w-full">
      <tbody>
        <tr>
          <td class="pr-2">Name</td>
          <td>{service.metadata?.name}</td>
        </tr>
        <tr>
          <td class="pr-2">Namespace</td>
          <td>{service.metadata?.namespace}</td>
        </tr>
        <tr>
          <td class="pr-2">Created</td>
          <td>{service.metadata?.creationTimestamp}</td>
        </tr>
        <tr>
          <td class="pr-2">Type</td>
          <td><div class="flex flex-row"><ServiceColumnType object="{serviceUI}" /></div></td>
        </tr>
        <tr>
          <td class="pr-2">Cluster IP</td>
          <td>{serviceUI.clusterIP}</td>
        </tr>
        <tr>
          <td class="pr-2">Ports</td>
          <td>{serviceUI.ports}</td>
        </tr>
      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
