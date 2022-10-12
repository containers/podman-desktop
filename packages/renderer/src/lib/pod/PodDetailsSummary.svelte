<script lang="ts">
import { router } from 'tinro';

import { getPanelDetailColor } from '../color/color';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;

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
          <td class="px-2 font-thin text-xs">{pod.name}</td>
        </tr>
        <tr>
          <td class="px-2">Size</td>
          <td class="px-2 font-thin text-xs">{pod.id}</td>
        </tr>
        <tr>
          <td class="px-2">Created</td>
          <td class="px-2 font-thin text-xs">{pod.humanCreationDate}</td>
        </tr>
      </table>
    </div>
    {#if pod.containers.length > 0}
      <div class="w-full my-4 p-2">
        <span class="font-bold text-xs">Containers using this pod:</span>
        <table class="h-2 font-thin text-xs">
          {#each pod.containers as container}
            <tr class="cursor-pointer" on:click="{() => openContainer(container.Id)}">
              <td class="px-2 font-thin text-xs">{container.Names}</td>
              <td class="px-2 font-thin text-xs">{container.Id}</td>
            </tr>
          {/each}
        </table>
      </div>
    {/if}
  </div>
</div>
