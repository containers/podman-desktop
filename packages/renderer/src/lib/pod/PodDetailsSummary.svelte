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
  <div class="flex px-5 py-4 flex-col">
    <div class="w-full">
      <table>
        <tr>
          <td class="pt-2 pr-2">Name:</td>
          <td class="pt-2 pr-2">{pod.name}</td>
        </tr>
        <tr>
          <td class="pt-2 pr-2">Id:</td>
          <td class="pt-2 pr-2">{pod.id}</td>
        </tr>
      </table>
    </div>
    {#if pod.containers.length > 0}
      <div class="w-full my-12">
        <span>Containers using this pod:</span>
        <table>
          {#each pod.containers as container}
            <tr class="cursor-pointer" on:click="{() => openContainer(container.Id)}">
              <td class="pt-2 pr-2">{container.Names}</td>
              <td class="pt-2 pr-2">{container.Id}</td>
            </tr>
          {/each}
        </table>
      </div>
    {/if}
  </div>
</div>
