<script lang="ts">
import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;

const ingressRouteUtils = new IngressRouteUtils();
</script>

{#each ingressRouteUtils.getBackends(object) as backend}
  <div class="text-[var(--pd-table-body-text)]">{backend}</div>
{/each}
