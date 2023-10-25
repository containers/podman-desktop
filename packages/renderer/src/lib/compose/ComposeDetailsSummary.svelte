<script lang="ts">
import { router } from 'tinro';

import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;

function openContainer(containerID: string) {
  router.goto(`/containers/${containerID}/logs`);
}
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <div class="w-full">
    <table>
      <tr>
        <td class="pt-2 pr-2">Name:</td>
        <td class="pt-2 pr-2">{compose.name}</td>
      </tr>
    </table>
  </div>
  {#if compose.containers.length > 0}
    <div class="w-full my-12">
      <span>Containers using this Compose group:</span>
      <table>
        {#each compose.containers as container}
          <tr class="cursor-pointer" on:click="{() => openContainer(container.id)}">
            <td class="pt-2 pr-2">{container.name}</td>
            <td class="pt-2 pr-2">{container.id}</td>
          </tr>
        {/each}
      </table>
    </div>
  {/if}
</div>
