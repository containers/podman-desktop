<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let ingressRoute: IngressUI | RouteUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: IngressUI | RouteUI }>();
export let onUpdate: (update: IngressUI | RouteUI) => void = update => {
  dispatch('update', update);
};
const ingressRouteUtils = new IngressRouteUtils();

async function deleteIngressRoute(): Promise<void> {
  ingressRoute.status = 'DELETING';
  onUpdate(ingressRoute);

  if (ingressRouteUtils.isIngress(ingressRoute)) {
    await window.kubernetesDeleteIngress(ingressRoute.name);
  } else {
    await window.kubernetesDeleteRoute(ingressRoute.name);
  }
}
</script>

<ListItemButtonIcon
  title={`Delete ${ingressRouteUtils.isIngress(ingressRoute) ? 'Ingress' : 'Route'}`}
  onClick={() => deleteIngressRoute()}
  detailed={detailed}
  icon={faTrash} />
