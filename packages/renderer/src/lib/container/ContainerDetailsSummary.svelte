<script lang="ts">
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <div class="w-full">
    <table class="h-2">
      <tbody>
        <tr>
          <td class="pr-2">Id</td>
          <td>{container.shortId}</td>
        </tr>
        <tr class:hidden="{!container.command}">
          <td class="pr-2">Command</td>
          <td>{container.command}</td>
        </tr>
        <tr>
          <td class="pr-2">State</td>
          <td>{container.state}</td>
        </tr>
        <tr>
          <td class="pr-2">Ports</td>
          <td class:hidden="{container.hasPublicPort}">N/A</td>
          <td class:hidden="{!container.hasPublicPort}">{container.portsAsString}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
