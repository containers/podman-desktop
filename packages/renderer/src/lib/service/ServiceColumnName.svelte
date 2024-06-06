<script lang="ts">
import { router } from 'tinro';

import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;

function openDetails() {
  router.goto(`/services/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click="{() => openDetails()}">
  <div class="text-sm text-gray-300 max-w-full overflow-hidden text-ellipsis">{object.name}</div>
  {#if object.loadBalancerIPs}
    <div class="text-xs text-violet-400">{object.loadBalancerIPs}</div>
  {/if}
</button>
