<script lang="ts">
import { router } from 'tinro';

import type { PVCUI } from './PVCUI';

export let object: PVCUI;

function openDetails() {
  router.goto(`/persistentvolumeclaims/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="max-w-full overflow-hidden text-ellipsis text-[var(--pd-table-body-text-highlight)]">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
