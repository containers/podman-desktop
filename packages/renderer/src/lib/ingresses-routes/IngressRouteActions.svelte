<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';
import { IngressRouteUtils } from './ingress-route-utils';
import { createEventDispatcher } from 'svelte';

export let ingressRoute: IngressUI | RouteUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: IngressUI | RouteUI }>();

const ingressRouteUtils = new IngressRouteUtils();

async function deleteIngressRoute(): Promise<void> {
  ingressRoute.status = 'DELETING';
  dispatch('update', ingressRoute);

  if (ingressRouteUtils.isIngress(ingressRoute)) {
    await window.kubernetesDeleteIngress(ingressRoute.name);
  } else {
    await window.kubernetesDeleteRoute(ingressRoute.name);
  }
}
</script>

<ListItemButtonIcon
  title="{`Delete ${ingressRouteUtils.isIngress(ingressRoute) ? 'Ingress' : 'Route'}`}"
  onClick="{() => deleteIngressRoute()}"
  detailed="{detailed}"
  icon="{faTrash}" />
