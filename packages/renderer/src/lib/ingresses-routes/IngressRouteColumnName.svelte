<script lang="ts">
import { router } from 'tinro';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';
import { IngressRouteUtils } from './ingress-route-utils';

export let object: IngressUI | RouteUI;

function openDetails() {
  const ingressRouteUtils = new IngressRouteUtils();
  if (ingressRouteUtils.isIngress(object)) {
    router.goto(`/ingressesRoutes/ingress/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
  } else {
    router.goto(`/ingressesRoutes/route/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
  }
}
</script>

<button class="hover:cursor-pointer flex flex-col" on:click="{() => openDetails()}">
  <div class="text-sm text-gray-300">{object.name}</div>
</button>
