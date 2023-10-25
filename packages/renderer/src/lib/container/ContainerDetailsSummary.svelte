<script lang="ts">
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <div class="w-full">
    <table class="h-2">
      <tr>
        <td class="pt-2 pr-2">Id</td>
        <td class="pt-2 pr-2">{container.shortId}</td>
      </tr>
      <tr class:hidden="{!container.command}">
        <td class="pt-2 pr-2">Command</td>
        <td class="pt-2 pr-2">{container.command}</td>
      </tr>
      <tr>
        <td class="pt-2 pr-2">State</td>
        <td class="pt-2 pr-2">{container.state}</td>
      </tr>
      <tr>
        <td class="pt-2 pr-2">Ports</td>
        <td class="pt-2 pr-2" class:hidden="{container.hasPublicPort}">N/A</td>
        <td class="pt-2 pr-2" class:hidden="{!container.hasPublicPort}">{container.portsAsString}</td>
      </tr>
    </table>
  </div>
</div>
