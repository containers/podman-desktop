<script lang="ts">
import { router } from 'tinro';

import { getPanelDetailColor } from '../color/color';

import type { VolumeInfoUI } from './VolumeInfoUI';

export let volume: VolumeInfoUI;

function openContainer(containerID: string) {
  router.goto(`/containers/${containerID}/logs`);
}
</script>

<div class="h-full" style="background-color: {getPanelDetailColor()}">
  <div class="flex py-4 flex-col">
    <div class="w-full">
      <table class="h-2 font-thin text-xs">
        <tr>
          <td class="px-2">Name</td>
          <td class="px-2 font-thin text-xs">{volume.name}</td>
        </tr>
        <tr>
          <td class="px-2">Size</td>
          <td class="px-2 font-thin text-xs">{volume.humanSize}</td>
        </tr>
        <tr>
          <td class="px-2">Created</td>
          <td class="px-2 font-thin text-xs">{volume.humanCreationDate}</td>
        </tr>
      </table>
    </div>
    {#if volume.containersUsage.length > 0}
      <div class="w-full my-4 p-2">
        <span class="font-bold text-xs">Containers using this volume:</span>
        {#each volume.containersUsage as container}
          <table class="h-2 font-thin text-xs">
            <tr class="cursor-pointer" on:click="{() => openContainer(container.id)}">
              <td class="px-2 font-thin text-xs">{container.names.join('')}</td>
              <td class="px-2 font-thin text-xs">{container.id}</td>
            </tr>
          </table>
        {/each}
      </div>
    {/if}
  </div>
</div>
