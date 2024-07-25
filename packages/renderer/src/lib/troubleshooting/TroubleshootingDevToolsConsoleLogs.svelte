<script lang="ts">
import { faFileLines, faPaste } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
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

<div class="flex flex-col w-full m-4 p-4 rounded-lg bg-[var(--pd-content-card-bg)]">
  <div class="flex flex-row align-middle items-center w-full mb-4">
    <Fa size="1.875x" class="pr-3" icon={faFileLines} />
    <div class="text-xl">Logs</div>
    <div class="flex flex-1 justify-end">
      <Button title="Copy To Clipboard" class="ml-5" on:click={() => copyLogsToClipboard()} type="link"
        ><Fa class="h-5 w-5 cursor-pointer text-xl text-[var(--pd-button-primary-bg)]" icon={faPaste} /></Button>
    </div>
  </div>
  {#if logs.length > 0}
    <div class="h-full overflow-auto p-2 bg-[var(--pd-invert-content-card-bg)]">
      <ul aria-label="logs">
        {#each logs as log}
          <li>
            <div class="flex flex-row align-middle items-center">
              <div
                class="font-mono text-[10px] font-thin {log.logType === 'error'
                  ? 'text-[var(--pd-state-error)]'
                  : ''} {log.logType === 'warn' ? 'text-[var(--pd-state-warning)]' : ''}">
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
