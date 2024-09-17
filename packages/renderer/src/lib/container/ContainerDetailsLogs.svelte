<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { onMount } from 'svelte';

import { isMultiplexedLog } from '../stream/stream-utils';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

// Log
let refContainer: ContainerInfoUI;
// logs has been initialized
let noLogs = true;

// need to refresh logs when container is switched or state changes
$: {
  if (
    refContainer &&
    (refContainer.id !== container.id || (refContainer.state !== container.state && container.state !== 'EXITED'))
  ) {
    logsTerminal?.clear();
    fetchContainerLogs();
  }
  refContainer = container;
}

let logsTerminal: Terminal;

function callback(name: string, data: string) {
  if (name === 'first-message') {
    noLogs = false;
    // clear on the first message
    logsTerminal?.clear();
  } else if (name === 'data') {
    noLogs = false;
    if (isMultiplexedLog(data)) {
      logsTerminal?.write(data.substring(8) + '\r');
    } else {
      logsTerminal?.write(data + '\r');
    }
  }
  if (!noLogs) {
    window.dispatchEvent(new Event('resize'));
  }
}

async function fetchContainerLogs() {
  // grab logs of the container
  await window.logsContainer(container.engineId, container.id, callback);
}

onMount(async () => {
  fetchContainerLogs();
});
</script>

<EmptyScreen icon={NoLogIcon} title="No Log" message="Log output of {container.name}" hidden={noLogs === false} />

<div
  class="min-w-full flex flex-col"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}>
  <TerminalWindow class="h-full" bind:terminal={logsTerminal} convertEol disableStdIn />
</div>
