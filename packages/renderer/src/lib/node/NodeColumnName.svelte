<script lang="ts">
import { meta, router } from 'tinro';

import { withFullscreenParam } from '/@/navigation';

import type { NodeUI } from './NodeUI';

export let object: NodeUI;

const query = meta().query;

function openDetails() {
  router.goto(withFullscreenParam(`/kubernetes/nodes/${encodeURI(object.name)}/summary`, !!query['fullscreen']));
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
