<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import { extensionInfos } from '../stores/extensions';
import type { ExtensionInfo } from '../../../main/src/plugin/api/extension-info';

let extensions = [];
onMount(async () => {
  extensionInfos.subscribe(value => {
    extensions = value;
  });
});

async function stopExtension(extension: ExtensionInfo) {
  console.log('stopping extension...');
  await window.stopExtension(extension.id);
  window.dispatchEvent(new CustomEvent('extension-stopped', { detail: extension }));
}
async function startExtension(extension: ExtensionInfo) {
  console.log('starting extension...');
  await window.startExtension(extension.id);
  window.dispatchEvent(new CustomEvent('extension-started', { detail: extension }));
  console.log('extension started');
}

function getColorForState(extensionInfo: ExtensionInfo): string {
  if (extensionInfo.state === 'active') {
    return 'text-emerald-500';
  }
  return 'text-gray-700';
}
</script>

<div class="flex flex-col">
  <div class="shadow overflow-hidden border-b border-gray-600 sm">
    <table class="min-w-full divide-y divide-gray-800">
      <tbody class="bg-gray-800 divide-y divide-gray-200">
        {#each extensions as extension}
          <tr>
            <td class="px-6 py-2 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 py-3">
                  <Fa class="h-10 w-10 rounded-full {getColorForState(extension)}" icon="{faPuzzlePiece}" />
                </div>
                <div class="ml-4">
                  <div class="flex flex-row">
                    <div class="text-sm text-gray-200">{extension.name}</div>
                    <div class="pl-2 text-sm text-violet-400">{extension.publisher}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-500">
                    <div>{extension.version}</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap">
              <div class="flex flex-row justify-end">
                <button
                  title="Start extension"
                  on:click="{() => startExtension(extension)}"
                  hidden
                  class:block="{extension?.state !== 'active'}"
                  ><Fa
                    class="cursor-pointer h-10 w-10 rounded-full text-3xl text-sky-800"
                    icon="{faPlayCircle}" /></button>
                <button
                  title="Stop extension"
                  on:click="{() => stopExtension(extension)}"
                  hidden
                  class:block="{extension?.state === 'active'}"
                  ><Fa
                    class="cursor-pointer h-10 w-10 rounded-full text-3xl text-sky-800"
                    icon="{faStopCircle}" /></button>
                <!--<span><Fa class="h-10 w-10 rounded-full text-3xl text-sky-800" icon={faTrash} /></span>-->
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
