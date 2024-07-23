<script lang="ts">
import type { V1Ingress } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';
import type { V1Route } from '/@api/openshift-types';

import KubeIngressArtifact from '../kube/details/KubeIngressArtifact.svelte';
import KubeIngressStatusArtifact from '../kube/details/KubeIngressStatusArtifact.svelte';
import KubeObjectMetaArtifact from '../kube/details/KubeObjectMetaArtifact.svelte';
import OpenshiftRouteArtifact from '../kube/details/OpenshiftRouteArtifact.svelte';

export let ingressRoute: V1Ingress | V1Route | undefined;
export let kubeError: string | undefined = undefined;

// Determine if the artifact is an Ingress or a Route
function isIngress(ingressRoute: V1Ingress | V1Route): ingressRoute is V1Ingress {
  return ingressRoute.kind === 'Ingress';
}
</script>

<!-- Show the kube error if we're unable to retrieve the data correctly, but we still want to show the
basic information -->
{#if kubeError}
  <ErrorMessage error={kubeError} />
{/if}

<Table>
  {#if ingressRoute}
    <KubeObjectMetaArtifact artifact={ingressRoute.metadata} />
    {#if isIngress(ingressRoute)}
      <KubeIngressStatusArtifact artifact={ingressRoute.status} />
      <KubeIngressArtifact artifact={ingressRoute.spec} />
    {:else}
      <!-- Routes are shown / structured quite differently than Kubernetes, so we will show these separate. -->
      <OpenshiftRouteArtifact artifact={ingressRoute} />
    {/if}
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</Table>
