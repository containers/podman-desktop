<script lang="ts">
import Link from '../ui/Link.svelte';
import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;

const ingressRouteUtils = new IngressRouteUtils();
</script>

{#each ingressRouteUtils.getHostPaths(object) as hostPath}
  <div class="text-sm text-gray-500 overflow-hidden text-ellipsis">
    {#if hostPath.url}
      <Link aria-label="{hostPath.label}" externalRef="{hostPath.url}">
        {hostPath.label}
      </Link>
    {:else}
      {hostPath.label}
    {/if}
  </div>
{/each}
