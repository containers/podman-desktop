<script lang="ts">
import type { V1Ingress } from '@kubernetes/client-node';
import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';
import IngressRouteColumnHostPath from './IngressRouteColumnHostPath.svelte';
import IngressRouteColumnBackend from './IngressRouteColumnBackend.svelte';

export let ingressRouteUI: IngressUI | RouteUI;
export let ingressRoute: V1Ingress | V1Route | undefined;
export let kubeError: string | undefined = undefined;
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the 
basic information -->
{#if kubeError}
  <ErrorMessage error="{kubeError}" />
{/if}

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  {#if ingressRoute}
    <table class="w-full">
      <tbody>
        <tr>
          <td class="pr-2">Name</td>
          <td>{ingressRoute.metadata?.name}</td>
        </tr>
        <tr>
          <td class="pr-2">Namespace</td>
          <td>{ingressRoute.metadata?.namespace}</td>
        </tr>
        <tr>
          <td class="pr-2">Host/Path</td>
          <td><IngressRouteColumnHostPath object="{ingressRouteUI}" /></td>
        </tr>
        <tr>
          <td class="pr-2">Backend</td>
          <td><IngressRouteColumnBackend object="{ingressRouteUI}" /></td>
        </tr>
      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
