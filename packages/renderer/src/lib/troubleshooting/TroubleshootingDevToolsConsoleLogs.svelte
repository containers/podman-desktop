<script lang="ts">
import { faFileLines, faPaste } from '@fortawesome/free-regular-svg-icons';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';

import type { LogType } from '../../../../preload/src';
import NoLogIcon from '../ui/NoLogIcon.svelte';

let logs: {
  logType: LogType;
  date: Date;
  message: string;
}[] = [];

onMount(async () => {
  logs = await window.getDevtoolsConsoleLogs();
});

onDestroy(() => {});

function copyLogsToClipboard() {
  const logsText = logs.map(log => `${log.logType} : ${log.message}`).join('\n');
  window.clipboardWriteText(logsText);
}
</script>

<div class="flex flex-col w-full m-4 bg-charcoal-600 p-4 rounded-lg">
  <div class="flex flex-row align-middle items-center w-full mb-4">
    <Fa size="1.875x" class="pr-3 text-gray-700" icon={faFileLines} />
    <div class="text-xl">Logs</div>
    <div class="flex flex-1 justify-end">
      <button title="Copy To Clipboard" class="ml-5" on:click={() => copyLogsToClipboard()}
        ><Fa class="h-5 w-5 cursor-pointer text-xl text-purple-500 hover:text-purple-600" icon={faPaste} /></button>
    </div>
  </div>
  {#if logs.length > 0}
    <div class="h-full overflow-auto p-2 bg-charcoal-800">
      <ul aria-label="logs">
        {#each logs as log}
          <li>
            <div class="flex flex-row align-middle items-center">
              <div
                class="font-mono text-[10px] font-thin {log.logType === 'error' ? 'text-red-500' : ''} {log.logType ===
                'warn'
                  ? 'text-amber-400'
                  : ''}">
                {log.message}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <NoLogIcon />
  {/if}
</div>
