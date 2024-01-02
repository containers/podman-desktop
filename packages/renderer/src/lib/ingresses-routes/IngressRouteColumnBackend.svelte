<script lang="ts">
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';
import { IngressRouteUtils } from './ingress-route-utils';

export let object: IngressUI | RouteUI;

const ingressRouteUtils = new IngressRouteUtils();
</script>

{#each ingressRouteUtils.getBackends(object) as backend}
  <div class="text-sm text-gray-500">{backend}</div>
{/each}
