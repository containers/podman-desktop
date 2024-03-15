<script lang="ts">
import { router } from 'tinro';

import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

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
