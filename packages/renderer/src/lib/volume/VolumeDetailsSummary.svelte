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
      <tbody>
        <tr>
          <td class="pr-2">Name:</td>
          <td>{volume.name}</td>
        </tr>
        <tr>
          <td class="pr-2">Size:</td>
          <td>{volume.humanSize}</td>
        </tr>
        <tr>
          <td class="pr-2">Age:</td>
          <td>{volume.age}</td>
        </tr>
      </tbody>
    </table>
  </div>
  {#if volume.containersUsage.length > 0}
    <div class="w-full mt-12">
      <span>Containers using this volume:</span>
      {#each volume.containersUsage as container}
        <table>
          <tbody>
            <tr class="cursor-pointer" on:click="{() => openContainer(container.id)}">
              <td class="pr-2">{container.names.join('')}</td>
              <td>{container.id}</td>
            </tr>
          </tbody>
        </table>
      {/each}
    </div>
  {/if}
</div>
