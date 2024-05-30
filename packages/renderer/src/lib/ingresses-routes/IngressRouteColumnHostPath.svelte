<script lang="ts">
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@podman-desktop/ui-svelte';
import { Fa } from 'svelte-fa';

import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;

const ingressRouteUtils = new IngressRouteUtils();
</script>

{#each ingressRouteUtils.getHostPaths(object) as hostPath}
  <div
    class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500 overflow-hidden text-ellipsis">
    {#if hostPath.url}
      <Link
        aria-label="{hostPath.label}"
        on:click="{() => {
          if (hostPath.url) {
            window.openExternal(hostPath.url);
          }
        }}">
        <span class="flex items-center gap-1">
          <Fa icon="{faExternalLinkAlt}" class="text-xs" />
          {hostPath.label}
        </span>
      </Link>
    {:else}
      {hostPath.label}
    {/if}
  </div>
{/each}
