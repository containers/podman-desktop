<script lang="ts">
import { onMount, onDestroy } from 'svelte';

import NoLogIcon from '../ui/NoLogIcon.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faFileLines, faPaste } from '@fortawesome/free-regular-svg-icons';
import type { LogType } from '../../../../preload/src';

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

<div class="flex flex-col bg-zinc-700 m-4 p-4 mb-10">
  <div class="flex flex-row align-middle items-center w-full">
    <Fa size="40" icon="{faFileLines}" />
    <div class="mx-2 text-xl">Logs</div>
    <div class="flex flex-1 justify-end">
      <button title="Copy To Clipboard" class="ml-5" on:click="{() => copyLogsToClipboard()}"
        ><Fa class="h-5 w-5 cursor-pointer text-xl text-purple-500 hover:text-purple-600" icon="{faPaste}" /></button>
    </div>
  </div>
  {#if logs.length > 0}
    <div class="h-40 overflow-auto m-2 p-2">
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
