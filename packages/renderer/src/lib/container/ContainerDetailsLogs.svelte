<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { mount, onDestroy, onMount } from 'svelte';

import { isMultiplexedLog } from '../stream/stream-utils';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import ContainerDetailsLogsClear from './ContainerDetailsLogsClear.svelte';
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
    fetchContainerLogs().catch((err: unknown) => console.error(`Error fetching container logs ${container.id}`, err));
  }
  refContainer = container;
}
let terminalParentDiv: HTMLDivElement;

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
  await window.logsContainer({ engineId: container.engineId, containerId: container.id, callback });
}

function afterTerminalInit(): void {
  // mount the svelte5 component to the terminal xterm element
  let xtermElement = terminalParentDiv.querySelector('.xterm');
  if (!xtermElement) {
    xtermElement = terminalParentDiv;
  }
  // add svelte component using this xterm element
  mount(ContainerDetailsLogsClear, {
    target: xtermElement,
    props: {
      terminal: logsTerminal,
    },
  });
}

onMount(async () => {
  await fetchContainerLogs();
});

onDestroy(() => {
  logsTerminal?.dispose();
});
</script>

<EmptyScreen icon={NoLogIcon} title="No Log" message="Log output of {container.name}" hidden={noLogs === false} />

<div
  class="min-w-full flex flex-col"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}
  bind:this={terminalParentDiv}>
  <TerminalWindow on:init={afterTerminalInit} class="h-full" bind:terminal={logsTerminal} convertEol disableStdIn />
</div>
