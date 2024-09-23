<script lang="ts">
import { onMount } from 'svelte';

import { kubernetesContexts } from '../../stores/kubernetes-contexts';
import { ContainerGroupInfoTypeUI } from '../container/ContainerInfoUI';
import { PodGroupInfoTypeUI } from '../pod/PodInfoUI';
import Label from './Label.svelte';

// Name of the provider (e.g. podman, docker, kubernetes)
export let provider = '';

// Kubernetes context or container engine id
export let context = '';

// display name
let name = '';

function matchingURL(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) {
    return false;
  }

  // match across localhost urls
  a = a.replace('127.0.0.1', 'localhost');
  b = b.replace('127.0.0.1', 'localhost');

  return a === b;
}

onMount(async () => {
  // start by using the provider (type)
  name = provider;
  if (context) {
    const providerInfos = await window.getProviderInfos();
    if (provider === 'kubernetes') {
      // try to find a provider whose api endpoint matches the current context
      const currentContext = $kubernetesContexts.find(context => context.currentContext);
      const server = currentContext?.clusterInfo?.server;
      providerInfos.forEach(pr => {
        const conn = pr.kubernetesConnections?.find(conn => matchingURL(conn.endpoint.apiURL, server));
        if (conn) {
          name = pr.name;
        }
      });
    } else {
      // find the matching provider
      const providerId = context.substring(0, context.indexOf('.'));
      const prov = providerInfos.find(p => p.id === providerId);
      if (prov) {
        // use the provider name
        name = prov.name;
        if (prov.containerConnections?.length > 1) {
          // more than 1 connection, use the connection (instance) name, which is just the second part of the context
          name = context.substring(context.indexOf('.') + 1);
        }
      }
    }
  }
});

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

<Label tip={provider === 'Kubernetes' ? context : ''} name={name} capitalize>
  <div class="w-2 h-2 {getProviderColour(provider)} rounded-full"></div>
</Label>
