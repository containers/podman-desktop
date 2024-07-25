<script lang="ts">
import { router } from 'tinro';

import type { NodeUI } from './NodeUI';

export let object: NodeUI;

function openDetails() {
  router.goto(`/nodes/${encodeURI(object.name)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
