<script lang="ts">
import { router } from 'tinro';

import type { ContainerGroupInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

export let object: ContainerGroupInfoUI;

function displayContainersCount(containerGroup: ContainerGroupInfoUI): string {
  let result = containerGroup.allContainersCount + ' container' + (containerGroup.allContainersCount > 1 ? 's' : '');
  if (containerGroup.containers.length !== containerGroup.allContainersCount) {
    result += ` (${containerGroup.allContainersCount - containerGroup.containers.length} filtered)`;
  }
  return result;
}

function openGroupDetails(containerGroup: ContainerGroupInfoUI): void {
  if (!containerGroup.engineId) {
    return;
  }
  if (containerGroup.type === ContainerGroupInfoTypeUI.POD) {
    router.goto(`/pods/podman/${encodeURI(containerGroup.name)}/${encodeURIComponent(containerGroup.engineId)}/logs`);
  } else if (containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE) {
    router.goto(`/compose/details/${encodeURI(containerGroup.name)}/${encodeURI(containerGroup.engineId)}/logs`);
  }
}
</script>

<button
  class="flex flex-col text-[var(--pd-table-body-text-highlight)] max-w-full"
  title={object.type}
  on:click={() => openGroupDetails(object)}>
  <div class="max-w-full overflow-hidden text-ellipsis">
    {object.name} ({object.type})
  </div>
  <div class="text-sm font-extra-light text-[var(--pd-table-body-text)]">
    {displayContainersCount(object)}
  </div>
</button>
