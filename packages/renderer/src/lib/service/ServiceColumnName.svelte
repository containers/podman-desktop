<script lang="ts">
import { meta, router } from 'tinro';

import { withFullscreenParam } from '/@/navigation';

import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;

const query = meta().query;

function openDetails() {
  router.goto(
    withFullscreenParam(
      `/kubernetes/services/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`,
      !!query['fullscreen'],
    ),
  );
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.loadBalancerIPs}
      <div class="text-[var(--pd-table-body-text-sub-secondary)]">{object.loadBalancerIPs}</div>
    {/if}
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
