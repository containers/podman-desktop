<script lang="ts">
import type { LogType } from '@desktop-framework/api';
import { faFileLines, faPaste } from '@fortawesome/free-regular-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';

import NoLogIcon from '/@/lib/ui/NoLogIcon.svelte';

const TIMESTAMPS_CONFIG_KEY = 'troubleshooting.logsTimestamps';

let logs: {
  logType: LogType;
  date: Date;
  message: string;
}[] = $state([]);

let showTimestamps = $state(false);

onMount(async () => {
  logs = await window.getDevtoolsConsoleLogs();
  showTimestamps = (await window.getConfigurationValue<boolean>(TIMESTAMPS_CONFIG_KEY)) ?? false;
});

onDestroy(() => {});

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

async function copyLogsToClipboard(): Promise<void> {
  const logsText = logs
    .map(log =>
      showTimestamps
        ? `${formatTimestamp(log.date)} ${log.logType} : ${log.message}`
        : `${log.logType} : ${log.message}`,
    )
    .join('\n');
  await window.clipboardWriteText(logsText);
}
</script>

<div class="flex flex-col w-full m-4 p-4 rounded-lg bg-[var(--pd-content-card-bg)]">
  <div class="flex flex-row align-middle items-center w-full mb-4">
    <Icon size="1.875x" class="pr-3" icon={faFileLines} />
    <div class="text-xl">Logs</div>
    <div class="flex flex-1 justify-end items-center gap-1">
      <Button title="Toggle Timestamps" pressed={showTimestamps} on:click={async (): Promise<void> => { showTimestamps = !showTimestamps; await window.updateConfigurationValue(TIMESTAMPS_CONFIG_KEY, showTimestamps); }} type="link"
        ><Icon class="h-5 w-5 cursor-pointer text-xl {showTimestamps ? 'text-(--pd-action-button-primary-text)' : 'text-(--pd-content-text)'}" icon={faClock} /></Button>
      <Button title="Copy To Clipboard" on:click={async (): Promise<void> => await copyLogsToClipboard()} type="link"
        ><Icon class="h-5 w-5 cursor-pointer text-xl text-(--pd-action-button-primary-text)" icon={faPaste} /></Button>
    </div>
  </div>
  {#if logs.length > 0}
    <div class="h-full overflow-auto p-2 bg-[var(--pd-invert-content-card-bg)]">
      <ul aria-label="logs">
        {#each logs as log, index (index)}
          <li class="py-[3px] px-1 rounded-sm {index % 2 === 0 ? 'bg-(--pd-invert-content-table-row-stripe)' : ''}">
            <div class="flex flex-row items-start gap-2">
              {#if showTimestamps}
                <span
                  class="font-mono text-[10px] font-thin shrink-0 {log.logType === 'error'
                    ? 'text-[var(--pd-state-error)]'
                    : ''} {log.logType === 'warn' ? 'text-[var(--pd-state-warning)]' : 'text-[var(--pd-content-text)]'}">
                  {formatTimestamp(log.date)}
                </span>
              {/if}
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
