<script lang="ts">
import { router } from 'tinro';

import type { NodeUI } from './NodeUI';

export let object: NodeUI;

function openDetails() {
  router.goto(`/nodes/${encodeURI(object.name)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col" on:click="{() => openDetails()}">
  <div class="text-sm text-gray-300">{object.name}</div>
</button>
