<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';

import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;

const ingressRouteUtils = new IngressRouteUtils();
</script>

{#each ingressRouteUtils.getHostPaths(object) as hostPath}
  <div class="text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis">
    {#if hostPath.url}
      <Link
        aria-label={hostPath.label}
        on:click={() => {
          if (hostPath.url) {
            window.openExternal(hostPath.url);
          }
        }}>
        {hostPath.label}
      </Link>
    {:else}
      {hostPath.label}
    {/if}
  </div>
{/each}
