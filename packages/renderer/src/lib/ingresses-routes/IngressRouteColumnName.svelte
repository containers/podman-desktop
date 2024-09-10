<script lang="ts">
import { meta, router } from 'tinro';

import { withFullscreenParam } from '/@/navigation';

import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;

const query = meta().query;

function openDetails() {
  const ingressRouteUtils = new IngressRouteUtils();
  if (ingressRouteUtils.isIngress(object)) {
    router.goto(
      withFullscreenParam(
        `/kubernetes/ingressesRoutes/ingress/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`,
        !!query['fullscreen'],
      ),
    );
  } else {
    router.goto(
      withFullscreenParam(
        `/kubernetes/ingressesRoutes/route/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`,
        !!query['fullscreen'],
      ),
    );
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
