<script lang="ts">
import type { V1Route } from '@desktop-framework/api';
import type { V1Ingress } from '@kubernetes/client-node';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import Table from '/@/lib/details/DetailsTable.svelte';
import KubeIngressArtifact from '/@/lib/kube/details/KubeIngressArtifact.svelte';
import KubeIngressStatusArtifact from '/@/lib/kube/details/KubeIngressStatusArtifact.svelte';
import KubeObjectMetaArtifact from '/@/lib/kube/details/KubeObjectMetaArtifact.svelte';
import OpenshiftRouteArtifact from '/@/lib/kube/details/OpenshiftRouteArtifact.svelte';

interface Props {
  ingressRoute?: V1Ingress | V1Route;
  kubeError?: string;
}

let { ingressRoute, kubeError }: Props = $props();

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
    <p class="text-[var(--pd-state-info)] font-medium">Loading...</p>
  {/if}
</Table>
