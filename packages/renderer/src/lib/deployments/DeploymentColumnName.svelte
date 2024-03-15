<script lang="ts">
import { router } from 'tinro';

import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

function openDetails() {
  router.goto(`/deployments/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex flex-col" on:click="{() => openDetails()}">
  <div class="text-sm text-gray-300">{object.name}</div>
</button>
