<script lang="ts">
import { router } from 'tinro';

import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

function openDetails() {
  router.goto(`/deployments/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click="{() => openDetails()}">
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
