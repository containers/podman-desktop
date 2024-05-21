<script lang="ts">
import { router } from 'tinro';

import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

function displayContainersCount(containerGroup: ContainerGroupInfoUI) {
  let result = containerGroup.allContainersCount + ' container' + (containerGroup.allContainersCount > 1 ? 's' : '');
  if (containerGroup.containers.length !== containerGroup.allContainersCount) {
    result += ` (${containerGroup.allContainersCount - containerGroup.containers.length} filtered)`;
  }
  return result;
}

function openGroupDetails(containerGroup: ContainerGroupInfoUI) {
  if (!containerGroup.engineId) {
    return;
  }
  if (containerGroup.type === ContainerGroupInfoTypeUI.POD) {
    router.goto(`/pods/podman/${encodeURI(containerGroup.name)}/${encodeURIComponent(containerGroup.engineId)}/logs`);
  } else if (containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE) {
    router.goto(`/compose/details/${encodeURI(containerGroup.name)}/${encodeURI(containerGroup.engineId)}/logs`);
  }
}

function openContainerDetails(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/`);
}
</script>

{#if 'type' in object && (object.type === ContainerGroupInfoTypeUI.POD || object.type === ContainerGroupInfoTypeUI.COMPOSE)}
  <button
    class="flex flex-col text-sm text-gray-300 max-w-full"
    title="{object.type}"
    on:click="{() => openGroupDetails(object)}">
    <div class="max-w-full overflow-hidden text-ellipsis">
      {object.name} ({object.type})
    </div>
    <div class="text-xs font-extra-light text-gray-900">
      {displayContainersCount(object)}
    </div>
  </button>
{:else if 'state' in object}
  <button class="flex flex-col whitespace-nowrap max-w-full" on:click="{() => openContainerDetails(object)}">
    <div class="flex items-center max-w-full">
      <div class="max-w-full">
        <div class="flex flex-nowrap max-w-full">
          <div
            class="text-sm text-gray-300 overflow-hidden text-ellipsis group-hover:text-violet-400"
            title="{object.name}">
            {object.name}
          </div>
        </div>
        <div class="flex flex-nowrap text-xs font-extra-light text-gray-900 items-center max-w-full">
          <div>{object.state}</div>
          <div class="pl-2 max-w-fit overflow-hidden text-ellipsis">{object.displayPort}</div>
        </div>
      </div>
    </div>
  </button>
{/if}
