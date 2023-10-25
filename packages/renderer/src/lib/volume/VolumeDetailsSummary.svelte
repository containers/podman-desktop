<script lang="ts">
import { router } from 'tinro';

import type { VolumeInfoUI } from './VolumeInfoUI';

export let volume: VolumeInfoUI;

function openContainer(containerID: string) {
  router.goto(`/containers/${containerID}/logs`);
}
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <div class="w-full">
    <table>
      <tr>
        <td class="pt-2 pr-2">Name:</td>
        <td class="pt-2 pr-2">{volume.name}</td>
      </tr>
      <tr>
        <td class="pt-2 pr-2">Size:</td>
        <td class="pt-2 pr-2">{volume.humanSize}</td>
      </tr>
      <tr>
        <td class="pt-2 pr-2">Age:</td>
        <td class="pt-2 pr-2">{volume.age}</td>
      </tr>
    </table>
  </div>
  {#if volume.containersUsage.length > 0}
    <div class="w-full mt-12">
      <span>Containers using this volume:</span>
      {#each volume.containersUsage as container}
        <table>
          <tr class="cursor-pointer" on:click="{() => openContainer(container.id)}">
            <td class="pt-2 pr-2">{container.names.join('')}</td>
            <td class="pt-2 pr-2">{container.id}</td>
          </tr>
        </table>
      {/each}
    </div>
  {/if}
</div>
