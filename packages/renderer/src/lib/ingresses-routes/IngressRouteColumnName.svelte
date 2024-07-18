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

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
