<script lang="ts">
import { ContainerGroupInfoTypeUI } from '../container/ContainerInfoUI';
import { PodGroupInfoTypeUI } from '../pod/PodInfoUI';
import Tooltip from './Tooltip.svelte';

// Name of the provider (e.g. podman, docker, kubernetes)
export let provider = '';

// Only used for Kubernetes-like distros
export let context = '';

// Each provider has a colour associated to it within tailwind, this is a map of those colours.
// bg-purple-600 = podman
// bg-sky-300 = docker
// bg-sky-600 = kubernetes
// bg-gray-900 = unknown
function getProviderColour(providerName: string): string {
  switch (providerName?.toLowerCase()) {
    case ContainerGroupInfoTypeUI.PODMAN:
      return 'bg-purple-600';
    case ContainerGroupInfoTypeUI.DOCKER:
      return 'bg-sky-400';
    case PodGroupInfoTypeUI.KUBERNETES:
      return 'bg-sky-600';
    default:
      return 'bg-gray-900';
  }
}
</script>

<div class="flex items-center bg-charcoal-500 p-1 rounded-md">
  <div class="w-2 h-2 {getProviderColour(provider)} rounded-full mr-1"></div>
  <span class="text-xs capitalize">
    <!-- If Kubernetes, show the context via the tooltip / hover, else just provider the name.-->
    {#if provider === 'Kubernetes'}
      <Tooltip tip="{context}" top>{provider}</Tooltip>
    {:else}
      {provider}
    {/if}
  </span>
</div>
