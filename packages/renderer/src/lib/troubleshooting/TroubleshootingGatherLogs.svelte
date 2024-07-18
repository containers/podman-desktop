<script lang="ts">
import { faFileLines, faScroll } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import { Uri } from '../uri/Uri';

let logs: string[] = [];

// Save files as a zip file (we first ask the user for the dialog, and then save the files to the filepath)
async function saveLogsAsZip() {
  const defaultUri = await window.troubleshootingGenerateLogFileUri('podman-desktop', 'zip');
  const filePath = await window.saveDialog({ title: 'Save Logs as .zip', defaultUri });
  if (filePath) {
    const filePathUri = Uri.revive(filePath);
    logs = await window.troubleshootingSaveLogs(filePathUri.fsPath);
  }
}
</script>

<div class="flex flex-col w-full m-4 bg-charcoal-600 p-4 rounded-lg">
  <div class="flex flex-row align-middle items-center w-full">
    <Fa size="1.875x" class="pr-3 text-gray-700" icon={faFileLines} />
    <div class="text-xl">Gather Log Files</div>
    <div class="flex flex-1 justify-end"></div>
  </div>
  <div class="mt-4">Bundle all available logs into a .zip</div>
  <div class="mt-4">
    <Button
      on:click={() => {
        saveLogsAsZip();
      }}
      title="Collect logs for must gather tool"
      icon={faScroll}>Collect and save logs as .zip</Button>
  </div>
  {#if logs.length > 0}
    <div class="h-full overflow-auto p-2 bg-charcoal-800 mt-3">
      <ul aria-label="logs">
        {#each logs as log}
          <li>
            <div class="flex flex-row align-middle items-center">
              <div class="font-mono text-[10px] font-thin">
                {log} generated
              </div>
            </div>
          </li>
        {/each}
        <li>
          <div class="flex flex-row align-middle items-center mt-2">
            <div class="font-mono text-[10px] font-thin">
              {logs.length} logs collected and bundled as a .zip
            </div>
          </div>
        </li>
      </ul>
    </div>
  {/if}
</div>
