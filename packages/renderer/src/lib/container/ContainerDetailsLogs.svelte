<script lang="ts">
import 'xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import { isMultiplexedLog } from '../stream/stream-utils';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

// Log
let logsXtermDiv: HTMLDivElement;
let refContainer: ContainerInfoUI;
// logs has been initialized
let noLogs = true;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

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

let currentRouterPath: string;

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
}

async function fetchContainerLogs() {
  // grab logs of the container
  await window.logsContainer(container.engineId, container.id, callback);
}

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: {
      background: getPanelDetailColor(),
    },
    convertEol: true,
  });
  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);

  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/logs`) {
      termFit.fit();
    }
  });
  termFit.fit();
}

onMount(async () => {
  // Refresh the terminal on initial load
  await refreshTerminal();
  fetchContainerLogs();
  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(() => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(logsXtermDiv);
});
</script>

<EmptyScreen icon={NoLogIcon} title="No Log" message="Log output of {container.name}" hidden={noLogs === false} />

<div
  class="min-w-full flex flex-col"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}
  bind:this={logsXtermDiv}>
</div>
